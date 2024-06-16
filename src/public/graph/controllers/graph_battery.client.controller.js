angular.module('graph').controller('GraphBatteryController', ['$rootScope', '$scope', '$iService', 'graphBatteryFactory', 'settingVehicleFactory', 'indexFactory',
  ($rootScope, $scope, $iService, graphBatteryFactory, settingVehicleFactory, indexFactory) => {

    if ($rootScope.authentication.role != 'admin' &&
      $rootScope.authentication.role != 'tnt') {
      $location.path(`/${$rootScope.url_lang}/`)
    }

    $scope.$iService = $iService
    $scope.dataGraphBattery = []
    $scope.dataSettingVehicle = []
    $scope.settingVehicle = {}
    $scope.dataSelectVehicle = []

    $scope.$watch('selectVehicle', (newValue) => {
      if (newValue && typeof newValue === 'string') {
        if (newValue != '0') {
          $scope.setSetting()
        }
      }
    })

    $scope.$watch('dataSettingVehicle', (newValue, oldValue) => {
      if (typeof newValue !== "undefined" && newValue != null && newValue != "" && newValue !== "0") {
        $scope.getDataVehicleSelect()
      }
    })

    $scope.$watch('dataVehicles', (newValue, oldValue) => {
      if (typeof newValue !== "undefined" && newValue != null && newValue != "" && newValue !== "0") {
        $scope.getDataVehicleSelect()
      }
    })

    settingVehicleFactory.getDataVehicle(res => {
      if (res.length > 0) {
        $scope.dataSettingVehicle = res
      }
    })

    indexFactory.getDataDetailVehicle(res => {
      if (res.length > 0) {
        $scope.dataVehicles = res
      }
    })

    $scope.setSetting = () => {
      if ($scope.dataSettingVehicle.length > 0 && $scope.selectVehicle != '0') {
        const _setting = $scope.dataSettingVehicle.filter((data) => (data.modem_id == $scope.selectVehicle))
        if (_setting.length > 0) {
          $scope.settingVehicle = _setting[0]
        }
      }
    }
    
    $scope.getDataVehicleSelect = () => {
      const modem_id = $scope.dataSettingVehicle.map(_data => _data.modem_id)
      const vehicle_model_id = $scope.dataVehicles.map(_data => parseInt(_data.vehiclemodelid.trim()))
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
          res.map(data => {
            const _index = modem_id.indexOf(data.modem_id)
            if (_index != -1) {
              const __index = vehicle_model_id.indexOf(parseInt($scope.dataSettingVehicle[_index].vehicle_model_id.trim()))
              if (__index != -1) {
                if ($scope.dataVehicles[__index].vehicletype == "รถไฟฟ้า") {
                  $scope.dataSelectVehicle.push({
                    id: data.modem_id,
                    text: data.vehicle_name
                  })
                }
              }
            }
          })
        } else {
          $scope.dataSelectVehicle = []
        }
      })
    }

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
        graphBatteryFactory.getDataGraphBattery(_data, res => {
          $scope.setVehicleName()
          if (res.length > 0) {
            // $scope.dataGraphBattery = res.replace(/'/g, '"')
            $scope.dataGraphBattery = res
          } else {
            $scope.dataGraphBattery = []
            $iService.toggleModalMessage({
              title: $rootScope.text.page_graph_battery.alert_title,
              detail: $rootScope.text.page_graph_battery.alert_no_data
            })
          }
        })
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_graph_battery.alert_title,
          detail: $rootScope.text.page_graph_battery.alert_blank
        })
      }
    }
  }
]).directive('graphBattery', ['$rootScope', '$window', '$timeout', '$iService',
  ($rootScope, $window, $timeout, $iService) => {
    return {
      restrict: 'AC',
      scope: {
        data: '@',
        vehicleName: '@',
        setting: '@'
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
          function colorStatus1(value) {
            if (value == 1) {
              return 'rgba(252, 80, 80, 1)'
            } else {
              return 'rgba(252, 80, 80, 0)'
            }
          }

          function colorStatus2(value) {
            if (value == 2) {
              return 'rgba(246, 234, 39, 1)'
            } else {
              return 'rgba(246, 234, 39, 0)'
            }
          }

          function colorStatus3(value) {
            if (value == 3) {
              return 'rgba(173, 206, 89, 1)'
            } else {
              return 'rgba(173, 206, 89, 0)'
            }
          }

          function calBattery(value) {
            if (scope.setting) {
              const _setting = JSON.parse(scope.setting)
              const _battery = value == null || value <= 0 ? 0 : value
              const _percent = parseFloat(parseFloat($iService.calBase(13, 17, 0, 100, _battery)) + parseFloat(_setting.calibrate_battery || 0))
              if (_percent > 100) {
                return 100
              } else {
                return _percent.toFixed(0)
              }
            } else {
              return 0
            }
          }
          
          function genDataStatus1(json) {
            let _data = [], i = 0
            if (json.length > 0) {
              while (i < json[0].data.length) {
                const _datetime = moment(json[0].data[i])
                // const battery = parseInt(calBattery(json[1].data[i]))
                const battery = json[1].data[i]
                const status = json[4].data[i]
                _data.push({
                  x: Date.parse(_datetime),
                  y: battery,
                  segmentColor: colorStatus1(status)
                })
                i++
              }
            }
            return _data
          }

          function genDataStatus2(json) {
            let _data = [], i = 0
            if (json.length > 0) {
              while (i < json[0].data.length) {
                const _datetime = moment(json[0].data[i])
                // const battery = parseInt(calBattery(json[1].data[i]))
                const battery = json[1].data[i]
                const status = json[4].data[i]
                _data.push({
                  x: Date.parse(_datetime),
                  y: battery,
                  segmentColor: colorStatus2(status)
                })
                i++
              }
            }
            return _data
          }

          function genDataStatus3(json) {
            let _data = [], i = 0
            if (json.length > 0) {
              while (i < json[0].data.length) {
                const _datetime = moment(json[0].data[i])
                // const battery = parseInt(calBattery(json[1].data[i]))
                const battery = json[1].data[i]
                const status = json[4].data[i]
                _data.push({
                  x: Date.parse(_datetime),
                  y: battery,
                  segmentColor: colorStatus3(status)
                })
                i++
              }
            }
            return _data
          }

          const options = {
            chart: {
              type: 'coloredarea',
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
              text: $rootScope.text.page_graph_battery.title
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
              }
            },
            yAxis: {
              title: { text: null },
              max: 100,
              min: 0
            },
            tooltip: {
              formatter: function(args) {
                const this_point_index = this.series.data.indexOf(this.point)
                let loc, value_text
                if ($rootScope.url_lang == 'th') {
                  const arr_str = json[2].data[this_point_index].split("|")
                  const arr_loc = arr_str[0].split(":")
                  value_text = `
                    [ ${this.point.y.toFixed(2)}${$rootScope.text.page_graph_battery.percent} ]
                  `
                  loc = `
                    ${$rootScope.text.page_graph_battery.sub_district}${arr_loc[0]} 
                    ${$rootScope.text.page_graph_battery.district}${arr_loc[1]} 
                    ${$rootScope.text.page_graph_battery.province}${arr_loc[2]}
                  `
                } else {
                  const arr_str = json[3].data[this_point_index].split("|")
                  const arr_loc = arr_str[0].split(":")
                  value_text = `
                  [ ${this.point.y.toFixed(2)}${$rootScope.text.page_graph_battery.percent} ]
                `
                  loc = `
                    ${$rootScope.text.page_graph_battery.sub_district}${arr_loc[0]} 
                    ${$rootScope.text.page_graph_battery.district}${arr_loc[1]} 
                    ${$rootScope.text.page_graph_battery.province}${arr_loc[2]}
                  `
                }
                return `<b>${moment(this.x).format("YYYY-MM-DD HH:mm:ss")} ${value_text}</b><br/>${$rootScope.text.page_graph_battery.location}: ${loc}`
                // return `<b>${moment(this.x).format("YYYY-MM-DD HH:mm:ss")} ${value_text}</b>`
              }
            },
            series: [{
              turboThreshold: 50000,
              type: 'coloredarea',
              name: $rootScope.text.page_graph_battery.parking,
              data: genDataStatus1(json),
              color: 'rgba(252, 80, 80, 1)'
            }, {
              turboThreshold: 50000,
              type: 'coloredarea',
              name: $rootScope.text.page_graph_battery.ideling,
              data: genDataStatus2(json),
              color: 'rgba(246, 234, 39, 1)'
            }, {
              turboThreshold: 50000,
              type: 'coloredarea',
              name: $rootScope.text.page_graph_battery.running,
              data: genDataStatus3(json),
              color: 'rgba(173, 206, 89, 1)'
            }]
          }
          chart = new Highcharts.Chart(attrs.id, options)
        }
      }
    }
  }
])
