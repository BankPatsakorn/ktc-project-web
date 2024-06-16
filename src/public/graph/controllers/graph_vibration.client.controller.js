angular.module('graph').controller('GraphVibrationController', ['$rootScope', '$scope', '$iService', 'graphVibrationFactory', 'settingVehicleFactory', 'indexFactory',
  ($rootScope, $scope, $iService, graphVibrationFactory, settingVehicleFactory, indexFactory) => {

    if ($rootScope.authentication.role != 'admin') {
      $location.path(`/${$rootScope.url_lang}/`)
    }

  	$scope.$iService = $iService
    $scope.dataGraphVibration = []
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

    $scope.searchDataGraph = () => {
      if ($scope.selectVehicle != "" && $scope.selectVehicle != null && $scope.selectVehicle !== '0' &&
        $scope.startDate != "" && $scope.startDate != null &&
        $scope.stopDate != "" && $scope.stopDate != null) {
        const _data = {
          modemid: $scope.selectVehicle,
          start: $scope.startDate,
          stop: $scope.stopDate
        }
        graphVibrationFactory.getDataGraphVibration(_data, res => {
          $scope.setVehicleName()
          if (res.length > 0) {
            const _data = {
              datetime: [],
              data_ax: [],
              data_ay: [],
              data_az: [],
              data_gx: [],
              data_gy: [],
              data_gz: []
            }
            function compare(a, b) {
              if (a.datetime < b.datetime) {
                return -1
              }
              if (a.datetime > b.datetime) {
                return 1
              }
              return 0
            }
            res.sort(compare)
            res.map((data, index) => {
              _data.datetime.push(moment(data.datetime).format('YYYY-MM-DD HH:mm:ss'))
              _data.datetime.push(moment(data.datetime).add('seconds', 8).format('YYYY-MM-DD HH:mm:ss'))
              _data.datetime.push(moment(data.datetime).add('seconds', 16).format('YYYY-MM-DD HH:mm:ss'))
              _data.datetime.push(moment(data.datetime).add('seconds', 24).format('YYYY-MM-DD HH:mm:ss'))
              _data.data_ax.push(data.data[0].ax_max)
              _data.data_ax.push(data.data[0].ax_min)
              _data.data_ax.push(data.data[1].ax_max)
              _data.data_ax.push(data.data[1].ax_min)
              _data.data_ay.push(data.data[0].ay_max)
              _data.data_ay.push(data.data[0].ay_min)
              _data.data_ay.push(data.data[1].ay_max)
              _data.data_ay.push(data.data[1].ay_min)
              _data.data_az.push(data.data[0].az_max)
              _data.data_az.push(data.data[0].az_min)
              _data.data_az.push(data.data[1].az_max)
              _data.data_az.push(data.data[1].az_min)
              _data.data_gx.push(data.data[0].gx_max)
              _data.data_gx.push(data.data[0].gx_min)
              _data.data_gx.push(data.data[1].gx_max)
              _data.data_gx.push(data.data[1].gx_min)
              _data.data_gy.push(data.data[0].gy_max)
              _data.data_gy.push(data.data[0].gy_min)
              _data.data_gy.push(data.data[1].gy_max)
              _data.data_gy.push(data.data[1].gy_min)
              _data.data_gz.push(data.data[0].gz_max)
              _data.data_gz.push(data.data[0].gz_min)
              _data.data_gz.push(data.data[1].gz_max)
              _data.data_gz.push(data.data[1].gz_min)
            })

            $scope.dataGraphVibration = {
              datetime: [],
              data_ax: [],
              data_ay: [],
              data_az: [],
              data_gx: [],
              data_gy: [],
              data_gz: []
            }
            _data.datetime.map((data, index) => {
              if (index > 0) {
                const _diff = $iService.diffBetweenDatetime($scope.dataGraphVibration.datetime[$scope.dataGraphVibration.datetime.length-1], data)
                if (_diff.years > 0 || _diff.months > 0 || _diff.days > 0 || _diff.hours > 0 || _diff.minutes > 0 || _diff.seconds > 0) {
                  $scope.dataGraphVibration.datetime.push(moment(data))
                  $scope.dataGraphVibration.data_ax.push(_data.data_ax[index])
                  $scope.dataGraphVibration.data_ay.push(_data.data_ay[index])
                  $scope.dataGraphVibration.data_az.push(_data.data_az[index])
                  $scope.dataGraphVibration.data_gx.push(_data.data_gx[index])
                  $scope.dataGraphVibration.data_gy.push(_data.data_gy[index])
                  $scope.dataGraphVibration.data_gz.push(_data.data_gz[index])
                }
              } else {
                $scope.dataGraphVibration.datetime.push(moment(data))
                $scope.dataGraphVibration.data_ax.push(_data.data_ax[index])
                $scope.dataGraphVibration.data_ay.push(_data.data_ay[index])
                $scope.dataGraphVibration.data_az.push(_data.data_az[index])
                $scope.dataGraphVibration.data_gx.push(_data.data_gx[index])
                $scope.dataGraphVibration.data_gy.push(_data.data_gy[index])
                $scope.dataGraphVibration.data_gz.push(_data.data_gz[index])
              }
              
            })
          } else {
            $scope.dataGraphVibration = []
            $iService.toggleModalMessage({
              title: $rootScope.text.page_graph_vibration.alert_title,
              detail: $rootScope.text.page_graph_vibration.alert_no_data
            })
          }
        })
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_graph_vibration.alert_title,
          detail: $rootScope.text.page_graph_vibration.alert_blank
        })
      }
    }
  }
]).directive('graphVibration', ['$rootScope', '$window', '$timeout',
  ($rootScope, $window, $timeout) => {
    return {
      restrict: 'AC',
      scope: {
        data: '@',
        vehicleName: '@'
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
          function genData(name, json) {
            let _data = [], i = 0
            if (json.hasOwnProperty('datetime')) {
              if (json.datetime.length > 0) {
                while (i < json.datetime.length) {
                  if (name == 'x-axis') {
                    _data.push([Date.parse(json.datetime[i]), parseInt(json.data_ax[i])])
                    // _data.data.push({x: Date.parse(json.datetime[i]), y: parseInt(json.data_ax[i])})
                  } else if (name == 'y-axis') {
                    _data.push([Date.parse(json.datetime[i]), parseInt(json.data_ay[i])])
                    // _data.data.push({x: Date.parse(json.datetime[i]), y: parseInt(json.data_ay[i])})
                  } else if (name == 'z-axis') {
                    _data.push([Date.parse(json.datetime[i]), parseInt(json.data_az[i])])
                    // _data.data.push({x: Date.parse(json.datetime[i]), y: parseInt(json.data_az[i])})
                  }
                  i++
                }
              }
            }
            return _data
          }
          const options = {
            chart: {
              type: 'spline',
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
              text: $rootScope.text.page_graph_vibration.title
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
              title: { text: $rootScope.text.page_graph_vibration.vibration }
            },
            tooltip: {
              formatter: function(args) {
                return `
                  <b>${moment(this.x).format("YYYY-MM-DD HH:mm:ss")}:</b> ${this.y}
                `
              }
            },
            series: [{
              turboThreshold: 50000,
              name: $rootScope.text.page_graph_vibration.x_axis,
              data: genData('x-axis', json),
              color: 'rgba(252, 80, 80, 0.8)'
            }, {
              turboThreshold: 50000,
              name: $rootScope.text.page_graph_vibration.y_axis,
              data: genData('y-axis', json),
              color: 'rgba(246, 234, 39, 0.8)'
            }, {
              turboThreshold: 50000,
              name: $rootScope.text.page_graph_vibration.z_axis,
              data: genData('z-axis', json),
              color: 'rgba(173, 206, 89, 0.8)'
            }]
          }
          chart = new Highcharts.Chart(attrs.id, options)
        }
      }
    }
  }
])
