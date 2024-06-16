angular.module('graph').controller('GraphOverSpeedController', ['$rootScope', '$scope', '$iService', 'graphOverSpeedFactory', 'settingVehicleFactory', 'indexFactory',
  ($rootScope, $scope, $iService, graphOverSpeedFactory, settingVehicleFactory, indexFactory) => {

    if ($rootScope.authentication.role != 'admin' &&
      $rootScope.authentication.role != 'tnt') {
      $location.path(`/${$rootScope.url_lang}/`)
    }

  	$scope.$iService = $iService
    $scope.dataGraphOverSpeed = []
    $scope.dataSettingVehicle = []

    settingVehicleFactory.getDataVehicle(res => {
      if (res.length > 0) {
        $scope.dataSettingVehicle = res
      }
    })
    
    indexFactory.getVehicleByFleet(res => {
      if (res.length > 0) {
        function compare(a, b) {
          if (a.vehicle_name < b.vehicle_name) {
            return -1
          }
          if (a.vehicle_name > b.vehicle_name) {
            return 1
          }
          return 0
        }
        res.sort(compare)
        $scope.dataSelectVehicle = res.map(data => {
          return {
            id: data.modem_id,
            text: data.vehicle_name
          }
        })
      } else {
        $scope.dataSelectVehicle = []
      }
    })

    $scope.setTextDate = (str) => {
      const res = str.split(" - ")
      $scope.startDate = res[0]
      $scope.stopDate = res[1]
    }

    $scope.setVehicleName = () => {
      $scope.vehicle_name = $scope.dataSelectVehicle.filter(data => (data.id == $scope.selectVehicle))
      $scope.vehicle_name = $scope.vehicle_name[0].text
    }

    $scope.setSpeedMax = () => {
      $scope.vehicle_setting = $scope.dataSettingVehicle.filter(data => (data.modem_id == $scope.selectVehicle))
      $scope.speed_max = $scope.vehicle_setting[0].speedmax
    }

    $scope.searchDataGraph = () => {
      if ($scope.selectVehicle != "" && $scope.selectVehicle != null && $scope.selectVehicle !== '0' &&
        $scope.startDate != "" && $scope.startDate != null &&
        $scope.stopDate != "" && $scope.stopDate != null) {
        const _data = {
          modemid: $scope.selectVehicle,
          start: $scope.startDate,
          stop: $scope.stopDate
        }
        graphOverSpeedFactory.getDataGraphOverSpeed(_data, res => {
          $scope.setVehicleName()
          $scope.setSpeedMax()
          if (res.length > 0) {
            $scope.dataGraphOverSpeed = res
          } else {
            $scope.dataGraphOverSpeed = []
            $iService.toggleModalMessage({
              title: $rootScope.text.page_graph_over_speed.alert_title,
              detail: $rootScope.text.page_graph_over_speed.alert_no_data
            })
          }
        })
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_graph_over_speed.alert_title,
          detail: $rootScope.text.page_graph_over_speed.alert_blank
        })
      }
    }
  }
]).directive('graphOverSpeed', ['$rootScope', '$window', '$timeout',
  ($rootScope, $window, $timeout) => {
    return {
      restrict: 'AC',
      scope: {
        data: '@',
        vehicleName: '@',
        speedMax: '@'
      },
      link: (scope, element, attrs) => {

        let chart = null

        angular.element($window).bind('resize', () => {
          scope.triggerSize()
          // manuall $digest required as resize event
          // is outside of angular
          scope.$digest()
        })

        scope.triggerSize = () => {
          if (chart != null) {
            const graph_width = chart.renderTo.clientWidth
            const graph_height = chart.renderTo.clientHeight
            chart.setSize(graph_width, graph_height)
          }
        }

        scope.$watch('data', (newValue) => {
          if (newValue && typeof newValue === 'string') {
            scope.setChart(JSON.parse(newValue))
          } else {
            scope.setChart([])
          }
        })

        scope.setChart = (json) => {
          function genData(json) {
            let _data = [], i = 0
            if (json.length > 0) {
              while (i < json[0].data.length) {
                _data.push([Date.parse(json[0].data[i]), json[1].data[i]])
                i++
              }
            }
            return _data
          }
          const options = {
            chart: {
              zoomType: 'xy',
              height: '350px',
              events: {
                beforePrint: function () {
                  this.oldhasUserSize = this.hasUserSize;
                  this.resetParams = [this.chartWidth, this.chartHeight, false];
                  this.setSize(this.chartWidth, this.chartHeight, false);
                },
                afterPrint: function () {
                  this.setSize.apply(this, this.resetParams);
                  this.hasUserSize = this.oldhasUserSize;
                }
              }
            },
            title: {
              text: $rootScope.text.page_graph_over_speed.title
            },
            subtitle: {
              text: scope.vehicleName
            },
            xAxis: {
              type: 'datetime',
              labels: {
                formatter: function() {
                  return moment(this.value).format("YYYY-MM-DD HH:mm")
                },
                style: {
                  color: "#666666",
                  fontFamily: "Kanit",
                  fontSize: "12px",
                  fontWeight: 400
                },
                y: 30,
                rotation: -30
              },
            },
            yAxis: {
              title: { text: null },
              min: 0,
              max: 200,
              plotLines: [{
                color: '#d9534f',
                width: 2,
                value: scope.speedMax ? +scope.speedMax : 80,
                dashStyle: 'shortdash',
                label: {
                  text: `${$rootScope.text.page_graph_over_speed.limit_speed} ${scope.speedMax ? +scope.speedMax : 80}`,
                  align: 'right',
                  y: -20,
                  style: {
                    color: '#d9534f'
                  }
                }
              }]
            },
            tooltip: {
              formatter: function(args) {
                const this_point_index = this.series.data.indexOf(this.point)
                let loc
                if ($rootScope.url_lang == 'th') {
                  const arr_loc = json[2].data[this_point_index].split(":")
                  loc = `
                    ${$rootScope.text.page_graph_over_speed.sub_district}${arr_loc[0]} 
                    ${$rootScope.text.page_graph_over_speed.district}${arr_loc[1]} 
                    ${$rootScope.text.page_graph_over_speed.province}${arr_loc[2]}
                  `
                } else {
                  const arr_loc = json[3].data[this_point_index].split(":")
                  loc = `
                    ${$rootScope.text.page_graph_over_speed.sub_district}${arr_loc[0]} 
                    ${$rootScope.text.page_graph_over_speed.district}${arr_loc[1]} 
                    ${$rootScope.text.page_graph_over_speed.province}${arr_loc[2]}
                  `
                }
                return `
                  <b>${moment(this.x).format("YYYY-MM-DD HH:mm:ss")} 
                  ${$rootScope.text.page_graph_over_speed.speed}${this.y}
                  ${$rootScope.text.page_graph_over_speed.km_hr}</b><br/>
                  ${$rootScope.text.page_graph_over_speed.location}: ${loc}
                `
              }
            },
            series: [{
              turboThreshold: 50000,
              showInLegend: false,
              data: genData(json),
              threshold: scope.speedMax ? +scope.speedMax : 80,
              negativeColor: '#ADCE59',
              color: '#FC5050'
            }]
          }
          chart = new Highcharts.Chart(attrs.id, options)
        }
      }
    }
  }
])
