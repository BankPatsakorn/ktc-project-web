angular.module('graph').controller('GraphFuelController', ['$rootScope', '$scope', '$iService', 'graphFuelFactory', 'indexFactory',
  ($rootScope, $scope, $iService, graphFuelFactory, indexFactory) => {

    if ($rootScope.authentication.role != 'admin') {
      $location.path(`/${$rootScope.url_lang}/`)
    }

    $scope.$iService = $iService
    $scope.dataGraphFuel = []
    
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
        graphFuelFactory.getDataGraphFuel(_data, res => {
          $scope.setVehicleName()
          if (res.length > 0) {
            $scope.dataGraphFuel = res
          } else {
            $scope.dataGraphFuel = []
            $iService.toggleModalMessage({
              title: $rootScope.text.page_graph_fuel.alert_title,
              detail: $rootScope.text.page_graph_fuel.alert_no_data
            })
          }
        })
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_graph_fuel.alert_title,
          detail: $rootScope.text.page_graph_fuel.alert_blank
        })
      }
    }
  }
// ]).directive('graphFuel', ['$rootScope', '$window', '$timeout',
//   ($rootScope, $window, $timeout) => {
//     return {
//       restrict: 'AC',
//       scope: {
//         data: '@',
//         vehicleName: '@'
//       },
//       link: (scope, element, attrs) => {

//         let chart = null

//         angular.element($window).bind('resize', () => {
//           scope.triggerSize()
//           // manuall $digest required as resize event
//           // is outside of angular
//           scope.$digest()
//         })

//         scope.triggerSize = () => {
//           if (chart != null) {
//             const graph_width = chart.renderTo.clientWidth
//             const graph_height = chart.renderTo.clientHeight
//             chart.setSize(graph_width, graph_height)
//           }
//         }

//         scope.$watch('data', (newValue) => {
//           if (newValue && typeof newValue === 'string') {
//             scope.setChart(JSON.parse(newValue))
//           } else {
//             scope.setChart([])
//           }
//         })

//         scope.setChart = (json) => {
//           function color(value) {
//             let color = ''
//             switch (value) {
//               case 1:
//                 color = 'rgba(252, 80, 80, 1)'
//                 break
//               case 2:
//                 color = 'rgba(246, 234, 39, 1)'
//                 break
//               case 3:
//                 color = 'rgba(173, 206, 89, 1)'
//                 break
//             }
//             return color
//           }
          
//           function genData(json) {
//             let _data = [], i = 0
//             if (json.length > 0) {
//               while (i < json[0].data.length) {
//                 const fuel = json[1].data[i]
//                 const status = json[4].data[i]
//                 _data.push({
//                   x: Date.parse(json[0].data[i]),
//                   y: fuel,
//                   segmentColor: color(status)
//                 })
//                 i++
//               }
//             }
//             return _data
//           }

//           const options = {
//             chart: {
//               type: 'coloredarea',
//               zoomType: 'xy',
//               height: '350px',
//               events: {
//                 beforePrint: function () {
//                   this.oldhasUserSize = this.hasUserSize;
//                   this.resetParams = [this.chartWidth, this.chartHeight, false];
//                   this.setSize(this.chartWidth, this.chartHeight, false);
//                 },
//                 afterPrint: function () {
//                   this.setSize.apply(this, this.resetParams);
//                   this.hasUserSize = this.oldhasUserSize;
//                 }
//               }
//             },
//             title: {
//               text: $rootScope.text.page_graph_fuel.title
//             },
//             subtitle: {
//               text: scope.vehicleName
//             },
//             xAxis: {
//               type: 'datetime',
//               labels: {
//                 formatter: function() {
//                   return moment(this.value).format("YYYY-MM-DD HH:mm")
//                 },
//                 style: {
//                   color: "#666666",
//                   fontFamily: "Kanit",
//                   fontSize: "12px",
//                   fontWeight: 400
//                 },
//                 y: 30,
//                 rotation: -30
//               }
//             },
//             yAxis: {
//               title: { text: null },
//               max: 100,
//               min: 0
//             },
//             tooltip: {
//               formatter: function(args) {
//                 const this_point_index = this.series.data.indexOf(this.point)
//                 let loc, value_text
//                 if ($rootScope.url_lang == 'th') {
//                   const arr_str = json[2].data[this_point_index].split("|")
//                   const arr_loc = arr_str[0].split(":")
//                   value_text = `
//                     [ ${this.point.y.toFixed(2)}${$rootScope.text.page_graph_fuel.percent} ]
//                   `
//                   loc = `
//                     ${$rootScope.text.page_graph_fuel.sub_district}${arr_loc[0]} 
//                     ${$rootScope.text.page_graph_fuel.district}${arr_loc[1]} 
//                     ${$rootScope.text.page_graph_fuel.province}${arr_loc[2]}
//                   `
//                 } else {
//                   const arr_str = json[3].data[this_point_index].split("|")
//                   const arr_loc = arr_str[0].split(":")
//                   value_text = `
//                   [ ${this.point.y.toFixed(2)}${$rootScope.text.page_graph_fuel.percent} ]
//                 `
//                   loc = `
//                     ${$rootScope.text.page_graph_fuel.sub_district}${arr_loc[0]} 
//                     ${$rootScope.text.page_graph_fuel.district}${arr_loc[1]} 
//                     ${$rootScope.text.page_graph_fuel.province}${arr_loc[2]}
//                   `
//                 }
//                 return `<b>${moment(this.x).format("YYYY-MM-DD HH:mm:ss")} ${value_text}</b><br/>${$rootScope.text.page_graph_fuel.location}: ${loc}`
//               }
//             },
//             series: [{
//               turboThreshold: 50000,
//               showInLegend: false,
//               type: 'coloredarea',
//               data: genData(json)
//             }]
//           }
//           chart = new Highcharts.Chart(attrs.id, options)
//         }
//       }
//     }
//   }
]).directive('graphFuel', ['$rootScope', '$window', '$timeout',
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
          
          function genDataStatus1(json) {
            let _data = [], i = 0
            if (json.length > 0) {
              while (i < json[0].data.length) {
                const fuel = json[1].data[i] > 100 ? 100 : json[1].data[i]
                const status = json[4].data[i]
                _data.push({
                  x: Date.parse(json[0].data[i]),
                  y: fuel,
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
                const fuel = json[1].data[i] > 100 ? 100 : json[1].data[i]
                const status = json[4].data[i]
                _data.push({
                  x: Date.parse(json[0].data[i]),
                  y: fuel,
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
                const fuel = json[1].data[i] > 100 ? 100 : json[1].data[i]
                const status = json[4].data[i]
                _data.push({
                  x: Date.parse(json[0].data[i]),
                  y: fuel,
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
              text: $rootScope.text.page_graph_fuel.title
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
                    [ ${this.point.y.toFixed(2)}${$rootScope.text.page_graph_fuel.percent} ]
                  `
                  loc = `
                    ${$rootScope.text.page_graph_fuel.sub_district}${arr_loc[0]} 
                    ${$rootScope.text.page_graph_fuel.district}${arr_loc[1]} 
                    ${$rootScope.text.page_graph_fuel.province}${arr_loc[2]}
                  `
                } else {
                  const arr_str = json[3].data[this_point_index].split("|")
                  const arr_loc = arr_str[0].split(":")
                  value_text = `
                  [ ${this.point.y.toFixed(2)}${$rootScope.text.page_graph_fuel.percent} ]
                `
                  loc = `
                    ${$rootScope.text.page_graph_fuel.sub_district}${arr_loc[0]} 
                    ${$rootScope.text.page_graph_fuel.district}${arr_loc[1]} 
                    ${$rootScope.text.page_graph_fuel.province}${arr_loc[2]}
                  `
                }
                return `<b>${moment(this.x).format("YYYY-MM-DD HH:mm:ss")} ${value_text}</b><br/>${$rootScope.text.page_graph_fuel.location}: ${loc}`
              }
            },
            series: [{
              turboThreshold: 50000,
              type: 'coloredarea',
              name: $rootScope.text.page_graph_fuel.parking,
              data: genDataStatus1(json),
              color: 'rgba(252, 80, 80, 1)'
            }, {
              turboThreshold: 50000,
              type: 'coloredarea',
              name: $rootScope.text.page_graph_fuel.ideling,
              data: genDataStatus2(json),
              color: 'rgba(246, 234, 39, 1)'
            }, {
              turboThreshold: 50000,
              type: 'coloredarea',
              name: $rootScope.text.page_graph_fuel.running,
              data: genDataStatus3(json),
              color: 'rgba(173, 206, 89, 1)'
            }]
          }
          chart = new Highcharts.Chart(attrs.id, options)
        }
      }
    }
  }
]).directive('graphFuelAverage', ['$rootScope', '$window', '$timeout',
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
          function genData(json) {
            let _data = [], i = 0
            if (json.length > 0) {
              while (i < json[0].data.length) {
                const fuel = json[1].data[i] > 100 ? 100 : json[1].data[i]
                const status = json[4].data[i]
                _data.push({
                  x: Date.parse(json[0].data[i]),
                  y: fuel
                })
                i++
              }
            }
            return _data
          }

          function genDataNew(data) {
            let _new = [], i = 0
            let count = 0
            let average = 0
            while (i < data.length) {
              if (i == 0) {
                _new.push(data[i])
              }
              if (count < 10) {
                if (i == data.length-1) {
                  _new.push(average / count)
                  average = 0
                  count = 0
                } else {
                  average += parseFloat(data[i])
                  count++
                }
              } else {
                _new.push(average / count)
                average = 0
                count = 0
              }
              i++
            }
            return _new
          }

          function genDateNew(data) {
            let _new = [], i = 0
            let count = 0
            while (i < data.length) {
              if (i == 0) {
                _new.push(data[i])
              }
              if (count < 10) {
                if (i == data.length-1) {
                  _new.push(data[i])
                  count = 0
                } else {
                  count++
                }
              } else {
                _new.push(data[i])
                count = 0
              }
              i++
            }
            return _new
          }

          function genDataAverage(json) {
            let _data = [], i = 0
            if (json.length > 0) {
              const fuel = genDataNew(json[1].data)
              const date = genDateNew(json[0].data)
              while (i < date.length) {
                _data.push({
                  x: Date.parse(date[i]),
                  y: fuel[i] > 100 ? 100 : fuel[i]
                })
                i++
              }
            }
            return _data
          }

          const options = {
            chart: {
              type: 'area',
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
              text: $rootScope.text.page_graph_fuel.title
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
                    [ ${this.point.y.toFixed(2)}${$rootScope.text.page_graph_fuel.percent} ]
                  `
                  loc = `
                    ${$rootScope.text.page_graph_fuel.sub_district}${arr_loc[0]} 
                    ${$rootScope.text.page_graph_fuel.district}${arr_loc[1]} 
                    ${$rootScope.text.page_graph_fuel.province}${arr_loc[2]}
                  `
                } else {
                  const arr_str = json[3].data[this_point_index].split("|")
                  const arr_loc = arr_str[0].split(":")
                  value_text = `
                  [ ${this.point.y.toFixed(2)}${$rootScope.text.page_graph_fuel.percent} ]
                `
                  loc = `
                    ${$rootScope.text.page_graph_fuel.sub_district}${arr_loc[0]} 
                    ${$rootScope.text.page_graph_fuel.district}${arr_loc[1]} 
                    ${$rootScope.text.page_graph_fuel.province}${arr_loc[2]}
                  `
                }
                return `<b>${moment(this.x).format("YYYY-MM-DD HH:mm:ss")} ${value_text}</b><br/>${$rootScope.text.page_graph_fuel.location}: ${loc}`
              }
            },
            series: [{
              turboThreshold: 50000,
              type: 'area',
              name: $rootScope.text.page_graph_fuel.fuel_average,
              data: genDataAverage(json),
              color: 'rgba(255, 0, 0, 1)',
              fillOpacity: 1
            }, {
              turboThreshold: 50000,
              type: 'area',
              name: $rootScope.text.page_graph_fuel.fuel_tank,
              data: genData(json),
              color: 'rgba(0, 255, 0, 1)',
              fillOpacity: 0.6
            }]
          }
          chart = new Highcharts.Chart(attrs.id, options)
        }
      }
    }
  }
])
