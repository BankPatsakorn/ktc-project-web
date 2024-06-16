angular.module('report').controller('ReportSlidingCardController', ['$rootScope', '$scope', '$iService', 'reportSlidingCardFactory', 'indexFactory',
  ($rootScope, $scope, $iService, reportSlidingCardFactory, indexFactory) => {

  	$scope.$iService = $iService
    $scope.dataReportSlidingCardSingle = []
    $scope.dataReportSlidingCardGroup = []
    
    $scope.reportOptions = [
      $rootScope.text.page_report_sliding_card.radio_report_single,
      $rootScope.text.page_report_sliding_card.radio_report_group,
      $rootScope.text.page_report_sliding_card.radio_report_driver
    ]
    $scope.model = {
      selectReport: $rootScope.text.page_report_sliding_card.radio_report_single
    }
    
    indexFactory.getListDriverCard(res => {
      if (res.length > 0) {
        function compare(a, b) {
          if (a.vehiclename < b.vehiclename) {
            return -1
          }
          if (a.vehiclename > b.vehiclename) {
            return 1
          }
          return 0
        }
        res.sort(compare)
        $scope.dataSelectVehicle = res.map(data => {
          return {
            id: data.modem_id,
            text: data.vehiclename
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
      if ($scope.model.selectReport == $rootScope.text.page_report_sliding_card.radio_report_single) {
        if ($scope.selectVehicle != "" && $scope.selectVehicle != null && $scope.selectVehicle !== '0' &&
          $scope.startDate != "" && $scope.startDate != null &&
          $scope.stopDate != "" && $scope.stopDate != null) {
          const _data = {
            modemid: $scope.selectVehicle,
            start: $scope.startDate,
            stop: $scope.stopDate
          }
          reportSlidingCardFactory.getDataReportSingle(_data, res => {
            if (res.length > 0) {
              $scope.dataReportSlidingCardSingle = res
            } else {
              $scope.dataReportSlidingCardSingle = []
              $iService.toggleModalMessage({
                title: $rootScope.text.page_report_sliding_card.alert_title,
                detail: $rootScope.text.page_report_sliding_card.alert_no_data
              })
            }
          })
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.page_report_sliding_card.alert_title,
            detail: $rootScope.text.page_report_sliding_card.alert_blank
          })
        }
      } else if ($scope.model.selectReport == $rootScope.text.page_report_sliding_card.radio_report_driver) {
        if ($scope.selectVehicle != "" && $scope.selectVehicle != null && $scope.selectVehicle !== '0' &&
          $scope.startDate != "" && $scope.startDate != null &&
          $scope.stopDate != "" && $scope.stopDate != null) {
          const _data = {
            modemid: $scope.selectVehicle,
            start: $scope.startDate,
            stop: $scope.stopDate
          }
          reportSlidingCardFactory.getDataReportDriver(_data, res => {
            if (res.rows.length > 0) {
              $scope.dataReportSlidingCardDriver = res.rows
            } else {
              $scope.dataReportSlidingCardDriver = []
              $iService.toggleModalMessage({
                title: $rootScope.text.page_report_sliding_card.alert_title,
                detail: $rootScope.text.page_report_sliding_card.alert_no_data
              })
            }
          })
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.page_report_sliding_card.alert_title,
            detail: $rootScope.text.page_report_sliding_card.alert_blank
          })
        }
      } else if ($scope.model.selectReport == $rootScope.text.page_report_sliding_card.radio_report_group) {
        if ($scope.selectMonth != "" && $scope.selectMonth != null) {
          const _data = {
            year_month: $scope.selectMonth
          }
          reportSlidingCardFactory.getDataReportGroup(_data, res => {
            if (res.length > 0) {
              $scope.dataReportSlidingCardGroup = res
            } else {
              $scope.dataReportSlidingCardGroup = []
              $iService.toggleModalMessage({
                title: $rootScope.text.page_report_sliding_card.alert_title,
                detail: $rootScope.text.page_report_sliding_card.alert_no_data
              })
            }
          })
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.page_report_sliding_card.alert_title,
            detail: $rootScope.text.page_report_sliding_card.alert_blank
          })
        }
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_report_sliding_card.alert_title_error,
          detail: $rootScope.text.page_report_sliding_card.alert_detail_error
        })
      }
    }
  }
]).directive('tableReportSlidingCardSingle', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
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
              title: $rootScope.text.page_report_sliding_card.table.single.date,
              data: data => data.gps_datetime
            }, {
              title: $rootScope.text.page_report_sliding_card.table.single.driver_name,
              data: data => data.driver_name
            }, {
              title: $rootScope.text.page_report_sliding_card.table.single.card_id,
              data: data => data.driver_id
            }, {
              title: $rootScope.text.page_report_sliding_card.table.single.card_type,
              data: data => $iService.checkDriverTypeCard(data.driver_type)
            }, {
              title: $rootScope.text.page_report_sliding_card.table.single.card_no,
                data: data => data.driver_no
            }, {
              title: $rootScope.text.page_report_sliding_card.table.single.sex,
              data: data => $rootScope.url_lang == 'th' ? data.driver_sex_th : data.driver_sex_en
            }, {
              title: $rootScope.text.page_report_sliding_card.table.single.birth_date,
              data: data => data.driver_birthcard
            }, {
              title: $rootScope.text.page_report_sliding_card.table.single.expire_date,
              data: data => data.driver_expirecard
            }, {
              title: $rootScope.text.page_report_sliding_card.table.single.location,
              data: data => $rootScope.url_lang == 'th' ? data.locations_th ? $iService.customizeTextLocation(data.locations_th) : '' : data.locations_en ? $iService.customizeTextLocation(data.locations_en) : ''
            }, {
              title: $rootScope.text.page_report_sliding_card.table.single.position,
              data: data => data,
              className: "text-center",
              responsivePriority: 2,
              render: function (data, type, row) {
                const _btn = `<button class="btn btn-primary btn-circle btn-list" ng-click='openMap(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_report_sliding_card.table.single.position}"><i class="fa fa-map-marker"></i></button>`
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
                  header: row => $rootScope.text.page_report_sliding_card.title
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
                  return `${$rootScope.text.page_report_sliding_card.table.single.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_sliding_card.table.single.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
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
                  return `${$rootScope.text.page_report_sliding_card.table.single.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_sliding_card.table.single.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
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
                  return `${$rootScope.text.page_report_sliding_card.table.single.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_sliding_card.table.single.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
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
]).directive('tableReportSlidingCardGroup', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
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
              title: $rootScope.text.page_report_sliding_card.table.group.start,
              data: data => data.start_date
            }, {
              title: $rootScope.text.page_report_sliding_card.table.group.vehicle_name,
              data: data => data.vehiclename
            }, {
              title: $rootScope.text.page_report_sliding_card.table.group.start_location,
              data: data => $rootScope.url_lang == 'th' ? data.start_loc_th ? $iService.customizeTextLocation(data.start_loc_th) : '' : data.start_loc_en ? $iService.customizeTextLocation(data.start_loc_en) : ''
            }, {
              title: $rootScope.text.page_report_sliding_card.table.group.end,
              data: data => data.end_date
            }, {
              title: $rootScope.text.page_report_sliding_card.table.group.end_location,
              data: data => $rootScope.url_lang == 'th' ? data.end_loc_th ? $iService.customizeTextLocation(data.end_loc_th) : '' : data.end_loc_en ? $iService.customizeTextLocation(data.end_loc_en) : ''
            }, {
              title: $rootScope.text.page_report_sliding_card.table.group.driver_name,
              data: data => data.driver_name
            }, {
              title: $rootScope.text.page_report_sliding_card.table.group.card_id,
              data: data => data.driver_id
            }, {
              title: $rootScope.text.page_report_sliding_card.table.group.card_type,
              data: data => $iService.checkDriverTypeCard(data.driver_type)
            }, {
              title: $rootScope.text.page_report_sliding_card.table.group.card_no,
              data: data => data.driver_no
            }, {
              title: $rootScope.text.page_report_sliding_card.table.group.sex,
              data: data => $rootScope.url_lang == 'th' ? data.driver_sex_th : data.driver_sex_en
            }, {
              title: $rootScope.text.page_report_sliding_card.table.group.birth_date,
              data: data => data.driver_birthcard
            }, {
              title: $rootScope.text.page_report_sliding_card.table.group.expire_date,
              data: data => data.driver_expirecard
            }, {
              title: $rootScope.text.page_report_sliding_card.table.group.duration,
              data: data => data.time_use
            }],
            fnCreatedRow: (nRow, aData, iDataIndex) => {
              const linker = $compile(nRow)
              const element = linker(scope)
              return nRow = element
            },
            responsive: {
              details: {
                display: $.fn.dataTable.Responsive.display.modal({
                  header: row => $rootScope.text.page_report_sliding_card.title
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
                  return `${$rootScope.text.page_report_sliding_card.table.group.export_title}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_sliding_card.table.group.export_title} ${scope.year_month}`
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
                  return `${$rootScope.text.page_report_sliding_card.table.group.export_title}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_sliding_card.table.group.export_title} ${scope.year_month}`
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
                  return `${$rootScope.text.page_report_sliding_card.table.group.export_title}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_sliding_card.table.group.export_title} ${scope.year_month}`
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
]).directive('tableReportSlidingCardDriver', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
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
              title: $rootScope.text.page_report_sliding_card.table.driver.start,
              data: data => data.start_date,
              responsivePriority: 1
            }, {
              title: $rootScope.text.page_report_sliding_card.table.driver.driver_name,
              data: data => data.driver
            }, {
              title: $rootScope.text.page_report_sliding_card.table.driver.start_location,
              data: data => $rootScope.url_lang == 'th' ? data.start_loc_th ? $iService.customizeTextLocation(data.start_loc_th) : '' : data.start_loc_en ? $iService.customizeTextLocation(data.start_loc_en) : ''
            }, {
              title: $rootScope.text.page_report_sliding_card.table.driver.end,
              data: data => data.end_date
            }, {
              title: $rootScope.text.page_report_sliding_card.table.driver.end_location,
              data: data => $rootScope.url_lang == 'th' ? data.end_loc_th ? $iService.customizeTextLocation(data.end_loc_th) : '' : data.end_loc_en ? $iService.customizeTextLocation(data.end_loc_en) : ''
            }, {
              title: $rootScope.text.page_report_sliding_card.table.driver.duration,
              data: data => data.timeuse
            }, {
              title: $rootScope.text.page_report_sliding_card.table.driver.idling,
              data: data => data.time_idle
            }, {
              title: $rootScope.text.page_report_sliding_card.table.driver.distance,
              data: data => data.distance
            }, {
              title: $rootScope.text.page_report_sliding_card.table.driver.fuel,
              data: data => data.fuel_used
            }, {
              title: $rootScope.text.page_report_sliding_card.table.driver.average_speed,
              data: data => data.avg_speed
            }, {
              title: $rootScope.text.page_report_sliding_card.table.driver.max_speed,
              data: data => data.max_speed
            }, {
              title: $rootScope.text.page_report_sliding_card.table.driver.station,
              data: data => data.is_in_station
            }, {
              title: $rootScope.text.page_report_sliding_card.table.driver.position,
              data: data => data,
              className: "text-center",
              responsivePriority: 2,
              render: function (data, type, row) {
                const _btn = `<button class="btn btn-primary btn-circle btn-list" ng-click='openMap(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_report_sliding_card.table.driver.position}"><i class="fa fa-map-marker"></i></button>`
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
                  header: row => $rootScope.text.page_report_sliding_card.title
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
                  return `${$rootScope.text.page_report_sliding_card.table.driver.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_sliding_card.table.driver.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
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
                  return `${$rootScope.text.page_report_sliding_card.table.driver.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_sliding_card.table.driver.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
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
                  return `${$rootScope.text.page_report_sliding_card.table.driver.export_title} ${scope.vehicle_name}`
                },
                title: function() {
                  return `${$rootScope.text.page_report_sliding_card.table.driver.export_title} ${scope.vehicle_name} ${scope.start_datetime} - ${scope.stop_datetime}`
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
])
