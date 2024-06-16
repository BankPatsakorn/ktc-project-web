angular.module('report').controller('ReportInoutStationController', ['$rootScope', '$scope', '$iService', 'reportInoutStationFactory', 'indexFactory',
  ($rootScope, $scope, $iService, reportInoutStationFactory, indexFactory) => {

  	$scope.$iService = $iService
    $scope.dataReportInoutStationSingle = []
    $scope.dataReportInoutStationGroup = []
    
    $scope.reportOptions = [
      $rootScope.text.page_report_inout_station.radio_report_single,
      $rootScope.text.page_report_inout_station.radio_report_group
    ]
    $scope.model = {
      selectReport: $rootScope.text.page_report_inout_station.radio_report_single
    }
    
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

    $scope.setTextMonth = (str) => {
      $scope.selectMonth = str
    }

    $scope.searchDataReport = () => {
      if ($scope.model.selectReport == $rootScope.text.page_report_inout_station.radio_report_single) {
        if ($scope.selectVehicle != "" && $scope.selectVehicle != null && $scope.selectVehicle !== '0' &&
          $scope.startDate != "" && $scope.startDate != null &&
          $scope.stopDate != "" && $scope.stopDate != null) {
          const _data = {
            modemid: $scope.selectVehicle,
            start: $scope.startDate,
            stop: $scope.stopDate
          }
          reportInoutStationFactory.getDataReportSingle(_data, res => {
            if (res.length > 0) {
              $scope.dataReportInoutStationSingle = res
            } else {
              $scope.dataReportInoutStationSingle = []
              $iService.toggleModalMessage({
                title: $rootScope.text.page_report_inout_station.alert_title,
                detail: $rootScope.text.page_report_inout_station.alert_no_data
              })
            }
          })
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.page_report_inout_station.alert_title,
            detail: $rootScope.text.page_report_inout_station.alert_blank
          })
        }
      } else if ($scope.model.selectReport == $rootScope.text.page_report_inout_station.radio_report_group) {
        if ($scope.selectMonth != "" && $scope.selectMonth != null) {
          const _data = {
            year_month: $scope.selectMonth
          }
          reportInoutStationFactory.getDataReportGroup(_data, res => {
            if (res.length > 0) {
              $scope.dataReportInoutStationGroup = res
            } else {
              $scope.dataReportInoutStationGroup = []
              $iService.toggleModalMessage({
                title: $rootScope.text.page_report_inout_station.alert_title,
                detail: $rootScope.text.page_report_inout_station.alert_no_data
              })
            }
          })
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.page_report_inout_station.alert_title,
            detail: $rootScope.text.page_report_inout_station.alert_blank
          })
        }
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_report_inout_station.alert_title_error,
          detail: $rootScope.text.page_report_inout_station.alert_detail_error
        })
      }
    }
  }
]).directive('tableReportInoutStationSingle', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
  ($rootScope, $compile, $iService, $window, $timeout) => {
    return {
      restrict: 'AC',
      scope: {
        data: '@',
        type: '@',
        vehicle: '@',
        modemId: '@',
        start: '@',
        stop: '@'
      },
      link: (scope, element, attrs) => {

        scope.vehicle = null, scope.vehicle_name = null, scope.modem_id = null, scope.start_datetime = null, scope.stop_datetime = null

        let dataTable, isTableCreated = false, _height = $(window).height() - 270

        angular.element($window).bind('resize', () => {
          _height = $(window).height() - 270
          if (_height < 300) {
            _height = 300
          }
          scope.triggerSize()
          // manuall $digest required as resize event
          // is outside of angular
          scope.$digest()
        })

        scope.triggerSize = () => {
          if (isTableCreated) {
            element.parent().css({ 'max-height': _height, 'height': _height })
            element.each(function() { $(this).dataTable().fnDraw() })
          }
        }

        scope.setDataTable = (data) => {
          isTableCreated = true
          return element.DataTable({
            columns: [{
              title: $rootScope.text.page_report_inout_station.table.single.datetime_in,
              data: data => `${data.enter_date} ${data.enter_time}`,
              responsivePriority: 1
            }, {
              title: $rootScope.text.page_report_inout_station.table.single.location_in,
              data: data => $rootScope.url_lang == 'th' ? data.start_loc_th ? $iService.customizeTextLocation(data.start_loc_th) : '' : data.start_loc_en ? $iService.customizeTextLocation(data.start_loc_en) : ''
            }, {
              title: $rootScope.text.page_report_inout_station.table.single.station_in,
              data: data => data.enter_station
            }, {
              title: $rootScope.text.page_report_inout_station.table.single.station_type,
              data: data => $rootScope.url_lang == 'th' ? data.type_name_th : data.type_name_en
            }, {
              title: $rootScope.text.page_report_inout_station.table.single.datetime_out,
              data: data => `${data.leave_date} ${data.leave_time}`,
            }, {
              title: $rootScope.text.page_report_inout_station.table.single.location_out,
              data: data => $rootScope.url_lang == 'th' ? data.end_loc_th ? $iService.customizeTextLocation(data.end_loc_th) : '' : data.end_loc_en ? $iService.customizeTextLocation(data.end_loc_en) : ''
            }, {
              title: $rootScope.text.page_report_inout_station.table.single.station_out,
              data: data => data.exit_station
            }, {
              title: $rootScope.text.page_report_inout_station.table.single.distance,
              data: data => data.distance
            }, {
              title: $rootScope.text.page_report_inout_station.table.single.position,
              data: data => data,
              className: "text-center",
              responsivePriority: 2,
              render: function (data, type, row) {
                const _btn = `<button class="btn btn-primary btn-circle btn-list" ng-click='openMap(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_report_inout_station.table.single.position}"><i class="fa fa-map-marker"></i></button>`
                const _start = data.start_lonlat.split(',')
                const _end = data.end_lonlat.split(',')
                return type === 'export' ? `${_start[1]}, ${_start[0]} | ${_end[1]}, ${_end[0]}` : _btn
              }
            }],
            fnCreatedRow: (nRow, aData, iDataIndex) => {
              const linker = $compile(nRow)
              const element = linker(scope)
              return nRow = element
            },
            responsive: {
              details: {
                display: $.fn.dataTable.Responsive.display.modal({
                  header: row => $rootScope.text.page_report_inout_station.title
                }),
                renderer: (api, rowIdx, columns) => {
                  const data = $.map(columns, (col, i) => {
                    return `<tr>
                        <td class="td-modal-title"><b>${col.title}:</b></td>
                        <td class="td-modal-detail">${col.data}</td>
                      </tr>`
                  }).join('')
                  const e = angular.element(`<table class="table-modal-customize">${data}</table>`)
                  const compiled = $compile(e)(scope)
                  return compiled[0]
                }
              }
            },
            scrollY: _height,
            scrollCollapse: true,
            paging: false,
            data: data,
            dom: 'Bfrtip',
            buttons: [
              {
                extend: 'colvis',
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-columns"></i> Column visibility')
                },
                className: 'btn btn-default btn-sm'
              }, {
                extend: 'copyHtml5',
                exportOptions: {
                  // columns: ':visible(:not(.not-export-col))'
                  orthogonal: 'export'
                },
                filename: function() {
                  return `${$rootScope.text.page_report_inout_station.table.single.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_inout_station.table.single.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
                },
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-clipboard"> Copy to clipboard ')
                },
                className: 'btn btn-default btn-sm'
              }, {
                extend: 'excelHtml5',
                exportOptions: {
                  // columns: ':visible(:not(.not-export-col))'
                  orthogonal: 'export'
                },
                filename: function() {
                  return `${$rootScope.text.page_report_inout_station.table.single.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_inout_station.table.single.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
                },
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-file-text-o"></i> Export .xlsx')
                },
                className: 'btn btn-default btn-sm'
              }, {
                extend: 'print',
                exportOptions: {
                  // columns: ':visible(:not(.not-export-col))'
                  orthogonal: 'export'
                },
                filename: function() {
                  return `${$rootScope.text.page_report_inout_station.table.single.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_inout_station.table.single.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
                },
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-print"></i> Print')
                },
                className: 'btn btn-default btn-sm'
              }
            ]
          })
        }

        scope.$watch('data', newValue => {
          if (newValue && typeof newValue === 'string') {
            newValue = JSON.parse(newValue)
            if (isTableCreated) {
              dataTable.clear()
              dataTable.rows.add(newValue)
              dataTable.draw()
            } else {
              dataTable = scope.setDataTable(newValue)
            }
            $timeout(() => {
              $(window).trigger('resize')
              element.each(function() { $(this).dataTable().fnDraw() })
            }, 1000)
          } else {
            if (dataTable) {
              dataTable.clear()
              dataTable.rows.add([])
              dataTable.draw()
            } else {
              dataTable = scope.setDataTable([])
            }
          }
        })

        scope.$watch('type', newValue => {
          $timeout(() => {
            $(window).trigger('resize')
            element.each(function() { $(this).dataTable().fnDraw() })
          }, 1000)
        })

        scope.$watch('modemId', newValue => {
          if (newValue && typeof newValue === 'string') {
            scope.modem_id = newValue
            if (scope.vehicle.length > 0) {
              const _vehicle = scope.vehicle.filter((x) => (x.id == newValue))
              if (_vehicle.length > 0) {
                scope.vehicle_name = _vehicle[0].text
              }
            }
          }
        })

        scope.$watch('vehicle', newValue => {
          if (newValue && typeof newValue === 'string') {
            scope.vehicle = JSON.parse(newValue)
          }
        })

        scope.$watch('start', newValue => {
          if (newValue && typeof newValue === 'string') {
            scope.start_datetime = newValue
          }
        })

        scope.$watch('stop', newValue => {
          if (newValue && typeof newValue === 'string') {
            scope.stop_datetime = newValue
          }
        })

        scope.openMap = data => {
          $iService.openModalMap(data)
        }
      }
    }
  }
]).directive('tableReportInoutStationGroup', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
  ($rootScope, $compile, $iService, $window, $timeout) => {
    return {
      restrict: 'AC',
      scope: {
        data: '@',
        type: '@',
        yearMonth: '@'
      },
      link: (scope, element, attrs) => {

        scope.year_month = null

        let dataTable, isTableCreated = false, _height = $(window).height() - 270

        angular.element($window).bind('resize', () => {
          _height = $(window).height() - 270
          if (_height < 300) {
            _height = 300
          }
          scope.triggerSize()
          // manuall $digest required as resize event
          // is outside of angular
          scope.$digest()
        })

        scope.triggerSize = () => {
          if (isTableCreated) {
            element.parent().css({ 'max-height': _height, 'height': _height })
            element.each(function() { $(this).dataTable().fnDraw() })
          }
        }

        scope.setDataTable = (data) => {
          isTableCreated = true
          return element.DataTable({
            columns: [{
              title: $rootScope.text.page_report_inout_station.table.group.license,
              data: data => data.vehicle_name
            }, {
              title: $rootScope.text.page_report_inout_station.table.group.total,
              data: data => data.total_inout
            }, {
              title: $rootScope.text.page_report_inout_station.table.group.total_duration,
              data: data => data.total_timeuse
            }, {
              title: $rootScope.text.page_report_inout_station.table.group.station,
              data: data => data.inout_station
            }, {
              title: $rootScope.text.page_report_inout_station.table.group.station_duration,
              data: data => data.timeuse_station
            }, {
              title: $rootScope.text.page_report_inout_station.table.group.allow_zone,
              data: data => data.inout_allow_zone
            }, {
              title: $rootScope.text.page_report_inout_station.table.group.allow_zone_duration,
              data: data => data.timeuse_allow_zone
            }, {
              title: $rootScope.text.page_report_inout_station.table.group.notallow_zone,
              data: data => data.inout_notallow_zone
            }, {
              title: $rootScope.text.page_report_inout_station.table.group.notallow_zone_duration,
              data: data => data.timeuse_notallow_zone
            }],
            fnCreatedRow: (nRow, aData, iDataIndex) => {
              const linker = $compile(nRow)
              const element = linker(scope)
              return nRow = element
            },
            responsive: {
              details: {
                display: $.fn.dataTable.Responsive.display.modal({
                  header: row => $rootScope.text.page_report_inout_station.title
                }),
                renderer: (api, rowIdx, columns) => {
                  const data = $.map(columns, (col, i) => {
                    return `<tr>
                        <td class="td-modal-title"><b>${col.title}:</b></td>
                        <td class="td-modal-detail">${col.data}</td>
                      </tr>`
                  }).join('')
                  const e = angular.element(`<table class="table-modal-customize">${data}</table>`)
                  const compiled = $compile(e)(scope)
                  return compiled[0]
                }
              }
            },
            scrollY: _height,
            scrollCollapse: true,
            paging: false,
            data: data,
            dom: 'Bfrtip',
            buttons: [
              {
                extend: 'colvis',
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-columns"></i> Column visibility')
                },
                className: 'btn btn-default btn-sm'
              }, {
                extend: 'copyHtml5',
                exportOptions: {
                  // columns: ':visible(:not(.not-export-col))'
                },
                filename: function() {
                  return `${$rootScope.text.page_report_inout_station.table.group.export_title}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_inout_station.table.group.export_title} ${scope.year_month}`
                },
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-clipboard"> Copy to clipboard ')
                },
                className: 'btn btn-default btn-sm'
              }, {
                extend: 'excelHtml5',
                exportOptions: {
                  // columns: ':visible(:not(.not-export-col))'
                },
                filename: function() {
                  return `${$rootScope.text.page_report_inout_station.table.group.export_title}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_inout_station.table.group.export_title} ${scope.year_month}`
                },
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-file-text-o"></i> Export .xlsx')
                },
                className: 'btn btn-default btn-sm'
              }, {
                extend: 'print',
                exportOptions: {
                  // columns: ':visible(:not(.not-export-col))'
                  orthogonal: 'export'
                },
                filename: function() {
                  return `${$rootScope.text.page_report_inout_station.table.group.export_title}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_inout_station.table.group.export_title} ${scope.year_month}`
                },
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-print"></i> Print')
                },
                className: 'btn btn-default btn-sm'
              }
            ]
          })
        }

        scope.$watch('data', newValue => {
          if (newValue && typeof newValue === 'string') {
            newValue = JSON.parse(newValue)
            if (isTableCreated) {
              dataTable.clear()
              dataTable.rows.add(newValue)
              dataTable.draw()
            } else {
              dataTable = scope.setDataTable(newValue)
            }
            $timeout(() => {
              $(window).trigger('resize')
              element.each(function() { $(this).dataTable().fnDraw() })
            }, 1000)
          } else {
            if (dataTable) {
              dataTable.clear()
              dataTable.rows.add([])
              dataTable.draw()
            } else {
              dataTable = scope.setDataTable([])
            }
          }
        })

        scope.$watch('type', newValue => {
          $timeout(() => {
            $(window).trigger('resize')
            element.each(function() { $(this).dataTable().fnDraw() })
          }, 1000)
        })

        scope.$watch('yearMonth', newValue => {
          if (newValue && typeof newValue === 'string') {
            scope.year_month = newValue
          }
        })
      }
    }
  }
])
