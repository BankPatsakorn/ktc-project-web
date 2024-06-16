angular.module('report').controller('ReportUsageVehicleAndDriverController', ['$rootScope', '$scope', '$iService', 'reportUsageVehicleAndDriverFactory', 'indexFactory',
  ($rootScope, $scope, $iService, reportUsageVehicleAndDriverFactory, indexFactory) => {

    if ($rootScope.authentication.role != 'admin' &&
      $rootScope.authentication.role != 'tnt') {
      $location.path(`/${$rootScope.url_lang}/`)
    }

  	$scope.$iService = $iService
    $scope.dataReportUsageVehicleAndDriverSingle = []
    $scope.dataReportUsageVehicleAndDriverAll = []
    
    $scope.reportOptions = [
      $rootScope.text.page_report_usage_vehicle_and_driver.radio_report_single,
      $rootScope.text.page_report_usage_vehicle_and_driver.radio_report_all
    ]
    $scope.model = {
      selectReport: $rootScope.text.page_report_usage_vehicle_and_driver.radio_report_single
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
      if ($scope.model.selectReport == $rootScope.text.page_report_usage_vehicle_and_driver.radio_report_single) {
        if ($scope.selectVehicle != "" && $scope.selectVehicle != null && $scope.selectVehicle !== '0' &&
          $scope.startDate != "" && $scope.startDate != null &&
          $scope.stopDate != "" && $scope.stopDate != null) {
          const _data = {
            modemid: $scope.selectVehicle,
            start: $scope.startDate,
            stop: $scope.stopDate
          }
          reportUsageVehicleAndDriverFactory.getDataReportSingle(_data, res => {
            if (res.length > 0) {
              $scope.dataReportUsageVehicleAndDriverSingle = res
            } else {
              $scope.dataReportUsageVehicleAndDriverSingle = []
              $iService.toggleModalMessage({
                title: $rootScope.text.page_report_usage_vehicle_and_driver.alert_title,
                detail: $rootScope.text.page_report_usage_vehicle_and_driver.alert_no_data
              })
            }
          })
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.page_report_usage_vehicle_and_driver.alert_title,
            detail: $rootScope.text.page_report_usage_vehicle_and_driver.alert_blank
          })
        }
      } else if ($scope.model.selectReport == $rootScope.text.page_report_usage_vehicle_and_driver.radio_report_all) {
        if ($scope.startDate != "" && $scope.startDate != null &&
          $scope.stopDate != "" && $scope.stopDate != null) {
          const _data = {
            start: $scope.startDate,
            stop: $scope.stopDate
          }
          reportUsageVehicleAndDriverFactory.getDataReportAll(_data, res => {
            if (res.length > 0) {
              $scope.dataReportUsageVehicleAndDriverAll = res
            } else {
              $scope.dataReportUsageVehicleAndDriverAll = []
              $iService.toggleModalMessage({
                title: $rootScope.text.page_report_usage_vehicle_and_driver.alert_title,
                detail: $rootScope.text.page_report_usage_vehicle_and_driver.alert_no_data
              })
            }
          })
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.page_report_usage_vehicle_and_driver.alert_title,
            detail: $rootScope.text.page_report_usage_vehicle_and_driver.alert_blank
          })
        }
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_report_usage_vehicle_and_driver.alert_title_error,
          detail: $rootScope.text.page_report_usage_vehicle_and_driver.alert_detail_error
        })
      }
    }
  }
]).directive('tableReportUsageVehicleAndDriverSingle', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
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
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.single.group_zone,
              data: data => data.group_zone,
              responsivePriority: 1
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.single.date,
              data: data => data.date_process,
              responsivePriority: 2
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.single.distance,
              data: data => data.distance || 0
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.single.working,
              data: data => data.running || "00:00"
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.single.ideling,
              data: data => data.idling || "00:00"
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.single.parking,
              data: data => data.parking || "00:00"
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.single.overspeed_count,
              data: data => data.total_overspeed || 0
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.single.speed_max,
              data: data => data.speed_max || 0
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.single.driver_name,
              data: data => data.driver_name || "-"
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.single.driver_time_use,
              data: data => data.drivertime_use_forklift || "00:00"
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.single.first_scan_rfid,
              data: data => data.first_slash_rfid || ""
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.single.last_scan_rfid,
              data: data => data.end_slash_rfid || ""
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.single.total_scan_rfid,
              data: data => data.total_slash_rfid || 0
            }],
            fnCreatedRow: (nRow, aData, iDataIndex) => {
              const linker = $compile(nRow)
              const element = linker(scope)
              return nRow = element
            },
            responsive: {
              details: {
                display: $.fn.dataTable.Responsive.display.modal({
                  header: row => $rootScope.text.page_report_usage_vehicle_and_driver.title
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
                  return `${$rootScope.text.page_report_usage_vehicle_and_driver.table.single.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_usage_vehicle_and_driver.table.single.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
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
                  return `${$rootScope.text.page_report_usage_vehicle_and_driver.table.single.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_usage_vehicle_and_driver.table.single.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
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
                  return `${$rootScope.text.page_report_usage_vehicle_and_driver.table.single.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_usage_vehicle_and_driver.table.single.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
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
      }
    }
  }
]).directive('tableReportUsageVehicleAndDriverAll', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
  ($rootScope, $compile, $iService, $window, $timeout) => {
    return {
      restrict: 'AC',
      scope: {
        data: '@',
        type: '@',
        start: '@',
        stop: '@'
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
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.all.vehicle_name,
              data: data => data.vehicle_name,
              responsivePriority: 1
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.all.group_zone,
              data: data => data.group_zone,
              responsivePriority: 2
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.all.date,
              data: data => data.date_process,
              responsivePriority: 3
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.all.distance,
              data: data => data.distance || 0
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.all.working,
              data: data => data.running || "00:00"
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.all.ideling,
              data: data => data.idling || "00:00"
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.all.parking,
              data: data => data.parking || "00:00"
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.all.overspeed_count,
              data: data => data.total_overspeed || 0
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.all.speed_max,
              data: data => data.speed_max || 0
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.all.driver_name,
              data: data => data.driver_name || "-"
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.all.driver_time_use,
              data: data => data.drivertime_use_forklift || "00:00"
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.all.first_scan_rfid,
              data: data => data.first_slash_rfid || ""
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.all.last_scan_rfid,
              data: data => data.end_slash_rfid || ""
            }, {
              title: $rootScope.text.page_report_usage_vehicle_and_driver.table.all.total_scan_rfid,
              data: data => data.total_slash_rfid || 0
            }],
            fnCreatedRow: (nRow, aData, iDataIndex) => {
              const linker = $compile(nRow)
              const element = linker(scope)
              return nRow = element
            },
            responsive: {
              details: {
                display: $.fn.dataTable.Responsive.display.modal({
                  header: row => $rootScope.text.page_report_usage_vehicle_and_driver.title
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
                  return `${$rootScope.text.page_report_usage_vehicle_and_driver.table.all.export_title}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_usage_vehicle_and_driver.table.all.export_title} ${scope.year_month}`
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
                  return `${$rootScope.text.page_report_usage_vehicle_and_driver.table.all.export_title}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_usage_vehicle_and_driver.table.all.export_title} ${scope.year_month}`
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
                  return `${$rootScope.text.page_report_usage_vehicle_and_driver.table.all.export_title}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_usage_vehicle_and_driver.table.all.export_title} ${scope.year_month}`
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
