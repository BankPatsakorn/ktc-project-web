angular.module('report').controller('ReportIdlingController', ['$rootScope', '$scope', '$iService', 'reportIdlingFactory', 'indexFactory',
  ($rootScope, $scope, $iService, reportIdlingFactory, indexFactory) => {

    $scope.$iService = $iService
    $scope.dataReportIdlingDate = []
    $scope.dataReportIdlingMonth = []
    
    $scope.reportOptions = [
      $rootScope.text.page_report_idling.radio_report_date,
      $rootScope.text.page_report_idling.radio_report_month,
      $rootScope.text.page_report_idling.radio_report_group
    ]
    $scope.model = {
      selectReport: $rootScope.text.page_report_idling.radio_report_date
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
      if ($scope.model.selectReport == $rootScope.text.page_report_idling.radio_report_date) {
        if ($scope.selectVehicle != "" && $scope.selectVehicle != null && $scope.selectVehicle !== '0' &&
          $scope.startDate != "" && $scope.startDate != null &&
          $scope.stopDate != "" && $scope.stopDate != null) {
          const _data = {
            modemid: $scope.selectVehicle,
            start: $scope.startDate,
            stop: $scope.stopDate
          }
          reportIdlingFactory.getDataReportDate(_data, res => {
            if (res.rows.length > 0) {
              $scope.dataReportIdlingDate = res.rows
            } else {
              $scope.dataReportIdlingDate = []
              $iService.toggleModalMessage({
                title: $rootScope.text.page_report_idling.alert_title,
                detail: $rootScope.text.page_report_idling.alert_no_data
              })
            }
          })
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.page_report_idling.alert_title,
            detail: $rootScope.text.page_report_idling.alert_blank
          })
        }
      } else if ($scope.model.selectReport == $rootScope.text.page_report_idling.radio_report_month) {
        if ($scope.selectVehicle != "" && $scope.selectVehicle != null && $scope.selectVehicle !== '0' &&
          $scope.selectMonth != "" && $scope.selectMonth != null) {
          const _data = {
            modemid: $scope.selectVehicle,
            year_month: $scope.selectMonth
          }
          reportIdlingFactory.getDataReportMonth(_data, res => {
            if (res.length > 0) {
              $scope.dataReportIdlingMonth = res
            } else {
              $scope.dataReportIdlingMonth = []
              $iService.toggleModalMessage({
                title: $rootScope.text.page_report_idling.alert_title,
                detail: $rootScope.text.page_report_idling.alert_no_data
              })
            }
          })
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.page_report_idling.alert_title,
            detail: $rootScope.text.page_report_idling.alert_blank
          })
        }
      } else if ($scope.model.selectReport == $rootScope.text.page_report_idling.radio_report_group) {
        if ($scope.startDate != "" && $scope.startDate != null &&
          $scope.stopDate != "" && $scope.stopDate != null) {
          const _data = {
            start: $scope.startDate,
            stop: $scope.stopDate
          }
          reportIdlingFactory.getDataReportGroup(_data, res => {
            if (res.rows.length > 0) {
              $scope.dataReportIdlingGroup = res.rows
            } else {
              $scope.dataReportIdlingGroup = []
              $iService.toggleModalMessage({
                title: $rootScope.text.page_report_idling.alert_title,
                detail: $rootScope.text.page_report_idling.alert_no_data
              })
            }
          })
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.page_report_idling.alert_title,
            detail: $rootScope.text.page_report_idling.alert_blank
          })
        }
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_report_idling.alert_title_error,
          detail: $rootScope.text.page_report_idling.alert_detail_error
        })
      }
    }
  }
]).directive('tableReportIdlingDate', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
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
              title: $rootScope.text.page_report_idling.table.date.date,
              data: data => data.date,
              responsivePriority: 1
            }, {
              title: $rootScope.text.page_report_idling.table.date.location,
              data: data => $rootScope.url_lang == 'th' ? data.start_loc_th ? $iService.customizeTextLocation(data.start_loc_th) : '' : data.start_loc_en ? $iService.customizeTextLocation(data.start_loc_en) : ''
            }, {
              title: $rootScope.text.page_report_idling.table.date.start_time,
              data: data => data.start_date
            }, {
              title: $rootScope.text.page_report_idling.table.date.end_time,
              data: data => data.end_date
            }, {
              title: $rootScope.text.page_report_idling.table.date.duration,
              data: data => data.timeuse
            }, {
              title: $rootScope.text.page_report_idling.table.date.position,
              data: data => data,
              className: "text-center",
              responsivePriority: 2,
              render: function (data, type, row) {
                const _btn = `<button class="btn btn-primary btn-circle btn-list" ng-click='openMap(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_report_idling.table.date.position}"><i class="fa fa-map-marker"></i></button>`
                const _latlon = data.lonlat.split(',')
                return type === 'export' ? `${_latlon[1]}, ${_latlon[0]}` : _btn
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
                  header: row => $rootScope.text.page_report_idling.title
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
                  return `${$rootScope.text.page_report_idling.table.date.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_idling.table.date.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
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
                  return `${$rootScope.text.page_report_idling.table.date.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_idling.table.date.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
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
                  return `${$rootScope.text.page_report_idling.table.date.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_idling.table.date.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
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
]).directive('tableReportIdlingMonth', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
  ($rootScope, $compile, $iService, $window, $timeout) => {
    return {
      restrict: 'AC',
      scope: {
        data: '@',
        type: '@',
        vehicle: '@',
        modemId: '@',
        yearMonth: '@'
      },
      link: (scope, element, attrs) => {

        scope.vehicle = null, scope.vehicle_name = null, scope.modem_id = null, scope.year_month = null

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
              title: $rootScope.text.page_report_idling.table.month.date,
              data: data => data.day,
              responsivePriority: 1
            }, {
              title: $rootScope.text.page_report_idling.table.month.parking_time,
              data: data => data.times
            }, {
              title: $rootScope.text.page_report_idling.table.month.parking_duration,
              data: data => data.total_timeuse
            }, {
              title: $rootScope.text.page_report_idling.table.month.over_longer,
              data: data => data.count_idle_30min
            }, {
              title: $rootScope.text.page_report_idling.table.month.start_time,
              data: data => data.start_time
            }, {
              title: $rootScope.text.page_report_idling.table.month.end_time,
              data: data => data.end_time
            }, {
              title: $rootScope.text.page_report_idling.table.month.duration,
              data: data => data.max_timeuse
            }, {
              title: $rootScope.text.page_report_idling.table.month.location_longest,
              data: data => $rootScope.url_lang == 'th' ? data.xstart_loc_th ? $iService.customizeTextLocation(data.xstart_loc_th) : '' : data.xstart_loc_en ? $iService.customizeTextLocation(data.xstart_loc_en) : ''
            }, {
              title: $rootScope.text.page_report_idling.table.month.position,
              data: data => data,
              className: "text-center",
              responsivePriority: 2,
              render: function (data, type, row) {
                const _btn = `<button class="btn btn-primary btn-circle btn-list" ng-click='openMap(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_report_idling.table.month.position}"><i class="fa fa-map-marker"></i></button>`
                const _latlon = data.xlonlat.split(',')
                return type === 'export' ? `${_latlon[1]}, ${_latlon[0]}` : _btn
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
                  header: row => $rootScope.text.page_report_idling.title
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
                  return `${$rootScope.text.page_report_idling.table.month.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_idling.table.month.export_title} ${scope.vehicle_name} ${scope.year_month}`
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
                  return `${$rootScope.text.page_report_idling.table.month.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_idling.table.month.export_title} ${scope.vehicle_name} ${scope.year_month}`
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
                  return `${$rootScope.text.page_report_idling.table.month.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_idling.table.month.export_title} ${scope.vehicle_name} ${scope.year_month}`
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

        scope.$watch('yearMonth', newValue => {
          if (newValue && typeof newValue === 'string') {
            scope.year_month = newValue
          }
        })

        scope.openMap = data => {
          $iService.openModalMap(data)
        }
      }
    }
  }
]).directive('tableReportIdlingGroup', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
  ($rootScope, $compile, $iService, $window, $timeout) => {
    return {
      scope: {
        data: '@',
        type: '@',
        start: '@',
        stop: '@'
      },
      link: (scope, element, attrs) => {

        scope.start_datetime = null, scope.stop_datetime = null

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
              title: $rootScope.text.page_report_idling.table.group.start,
              data: data => data.start_maxidle,
              responsivePriority: 1
            }, {
              title: $rootScope.text.page_report_idling.table.group.vehicle_name,
              data: data => data.vehicle_name == null ? '' : data.vehicle_name
            }, {
              title: $rootScope.text.page_report_idling.table.group.start_location,
              data: data => $rootScope.url_lang == 'th' ? data.start_loc_th ? $iService.customizeTextLocation(data.start_loc_th) : '' : data.start_loc_en ? $iService.customizeTextLocation(data.start_loc_en) : ''
            }, {
              title: $rootScope.text.page_report_idling.table.group.end,
              data: data => data.end_maxidle
            }, {
              title: $rootScope.text.page_report_idling.table.group.end_location,
              data: data => $rootScope.url_lang == 'th' ? data.end_loc_th ? $iService.customizeTextLocation(data.end_loc_th) : '' : data.end_loc_en ? $iService.customizeTextLocation(data.end_loc_en) : ''
            }, {
              title: $rootScope.text.page_report_idling.table.group.idling_setting,
              data: data => data.idle_setting
            }, {
              title: $rootScope.text.page_report_idling.table.group.idling_time,
              data: data => data.count_idle
            }, {
              title: $rootScope.text.page_report_idling.table.group.max_idling,
              data: data => data.max_time_idle
            }, {
              title: $rootScope.text.page_report_idling.table.group.total_idling,
              data: data => data.total_timeuse
            }, {
              title: $rootScope.text.page_report_idling.table.group.position,
              data: data => data,
              className: "text-center",
              responsivePriority: 2,
              render: function (data, type, row) {
                const _btn = `<button class="btn btn-primary btn-circle btn-list" ng-click='openMap(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_report_idling.table.group.position}"><i class="fa fa-map-marker"></i></button>`
                const _latlon = data.lonlat.split(',')
                return type === 'export' ? `${_latlon[1]}, ${_latlon[0]}` : _btn
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
                  header: row => $rootScope.text.page_report_idling.title
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
                  return `${$rootScope.text.page_report_idling.table.group.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_idling.table.group.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
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
                  return `${$rootScope.text.page_report_idling.table.group.export_title}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_idling.table.group.export_title} ${scope.start_datetime} - ${scope.stop_datetime}`
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
                  return `${$rootScope.text.page_report_idling.table.group.export_title}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_idling.table.group.export_title}${scope.start_datetime} - ${scope.stop_datetime}`
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
])
