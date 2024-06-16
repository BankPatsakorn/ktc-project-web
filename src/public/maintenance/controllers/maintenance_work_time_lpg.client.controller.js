angular.module('maintenance').controller('MaintenanceWorkTimeLpgController', ['$rootScope', '$scope', '$iService', 'maintenanceWorkTimeLpgFactory', 'settingVehicleFactory', 'indexFactory',
  ($rootScope, $scope, $iService, maintenanceWorkTimeLpgFactory, settingVehicleFactory, indexFactory) => {

    $scope.$iService = $iService
  	$scope.dataForklift = []
  	$scope.dataForkliftBATT = []
  	$scope.dataForkliftLPG = []
    $scope.dataSettingVehicle = []
    $scope.dataVehicles = []
    $scope.dataLoadding = true
    
    $scope.modalMaintenanceWorkTimeLPG = {}

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

    maintenanceWorkTimeLpgFactory.getMaintenanceWorkTime(res => {
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
        $scope.dataForklift = res
      }
    })

    $scope.toggleModalEdit = (data) => {
      $scope.modalMaintenanceWorkTimeLPG.editModal(data)
    }

    $scope.confirmEdit = (data) => {
      if (data.modem_id != "" && data.modem_id != null && data.modem_id !== '0' &&
        $iService.checkDecimal(data.last_check.toString()) &&
        $iService.checkDecimal(data.check_every.toString())) {
        if (data.edit) {
          const _duecheck = parseFloat(data.last_check) + parseFloat(data.check_every)
          maintenanceWorkTimeLpgFactory.editMaintenanceWorkTime(data, res => {
            if (res.success) {
              const _modem_id = $scope.dataForkliftLPG.map((_data) => (_data.modem_id))
              const _index = _modem_id.indexOf(data.modem_id)
              if (_index != -1) {
                $scope.dataForkliftLPG[_index].status = 'left'
                $scope.dataForkliftLPG[_index].lastcheck = parseFloat(data.last_check)
                $scope.dataForkliftLPG[_index].check_every = parseFloat(data.check_every)
                $scope.dataForkliftLPG[_index].duecheck = parseFloat(_duecheck)
                $scope.dataForkliftLPG[_index].left_working_hour = parseFloat(_duecheck) - parseFloat(data.last_check)
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_maintenance_work_time_lpg.alert_title_success,
                  detail: $rootScope.text.page_maintenance_work_time_lpg.alert_detail_success
                })
              } else {
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_maintenance_work_time_lpg.alert_title_error,
                  detail: $rootScope.text.page_maintenance_work_time_lpg.alert_detail_error
                })
              }
            } else {
              $iService.toggleModalMessage({
                title: $rootScope.text.page_maintenance_work_time_lpg.alert_title_error,
                detail: $rootScope.text.page_maintenance_work_time_lpg.alert_detail_error
              })
            }
          })
        }
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_maintenance_work_time_lpg.alert_title,
          detail: $rootScope.text.page_maintenance_work_time_lpg.alert_blank
        })
      }
    }

    $scope.setDataForklift = () => {
      if ($scope.dataForklift.length > 0 && $scope.dataSettingVehicle.length > 0 && $scope.dataVehicles.length > 0) {
        const vehicle_model_id = $scope.dataVehicles.map(_data => parseInt(_data.vehiclemodelid.trim()))
        $scope.dataForklift.map((data, index) => {
          const modem_id = $scope.dataSettingVehicle.map(_data => _data.modem_id)
          const _index = modem_id.indexOf(data.modem_id)
          if (_index != -1) {
            const __index = vehicle_model_id.indexOf(parseInt($scope.dataSettingVehicle[_index].vehicle_model_id.trim()))
            if (__index != -1) {
              if ($scope.dataVehicles[__index].vehicletype == "รถ LPG") {
                $scope.dataForkliftLPG.push({
                  ...data,
                  setting: $scope.dataSettingVehicle[_index],
                  vehicle_detail: $scope.dataVehicles[__index]
                })
              }
              return Object.assign(data, data, {
                ...data,
                setting: $scope.dataSettingVehicle[_index],
                vehicle_detail: $scope.dataVehicles[__index]
              })
            } else {
              return Object.assign(data, data, {
                ...data,
                setting: $scope.dataSettingVehicle[_index],
                vehicle_detail: {}
              })
            }
          } else {
            return Object.assign(data, data, {
              ...data,
              setting: {},
              vehicle_detail: {}
            })
          }
        })
        $scope.dataLoadding = false
      }
    }

    $scope.$watch('dataSettingVehicle', (newValue, oldValue) => {
      if (typeof newValue !== "undefined" && newValue != null && newValue != "" && newValue !== "0") {
        $scope.setDataForklift()
      }
    })

    $scope.$watch('dataForklift', (newValue, oldValue) => {
      if (typeof newValue !== "undefined" && newValue != null && newValue != "" && newValue !== "0") {
        $scope.setDataForklift()
      }
    })

    $scope.$watch('dataVehicles', (newValue, oldValue) => {
      if (typeof newValue !== "undefined" && newValue != null && newValue != "" && newValue !== "0") {
        $scope.setDataForklift()
      }
    })
  }
]).directive('modalMaintenanceWorkTimeLpg', ['$rootScope',
  ($rootScope) => {
    return {
      templateUrl: 'maintenance/views/modal_maintenance_work_time_lpg.client.view.html',
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: {
        sharedobj: '=',
        modalConfirm: '&fnModalConfirm'
      },
      link: (scope, element, attrs) => {

        scope.confirmEdit = false
        scope.text = $rootScope.text

        scope.$watch(attrs.visible, value => {
          if (value == true)
            element.modal('show')
          else
            element.modal('hide')
        })

        element.on('shown.bs.modal', () => {
          scope.$apply(() => {
            scope.$parent[attrs.visible] = true
          })
        })

        element.on('hidden.bs.modal', () => {
          scope.$apply(() => {
            scope.$parent[attrs.visible] = false
            scope.inputMaintenanceLastcheck = ""
            scope.inputMaintenanceCheckEvery = ""
          })
        })

        scope.sharedobj.editModal = (data) => {
          scope.confirmEdit = true
          scope.modem_id = data.modem_id
          scope.inputMaintenanceLastcheck = ((parseFloat(data.working_hour_norun || 0) + parseFloat(data.calibrate_working_hour || 0)) / 60).toFixed(0)
          scope.inputMaintenanceCheckEvery = data.check_every
          element.modal('toggle')
        }

        scope.confirm = () => {
          scope.modalConfirm({
            data: {
              edit: scope.confirmEdit,
              modem_id: scope.modem_id,
              last_check: scope.inputMaintenanceLastcheck,
              check_every: scope.inputMaintenanceCheckEvery
            }
          })
        }
      }
    }
  }
]).directive('tableMaintenanceWorkTimeLpg', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
  ($rootScope, $compile, $iService, $window, $timeout) => {
    return {
      restrict: 'AC',
      scope: {
        data: '@',
        modalEdit: '&fnToggleModalEdit',
      },
      link: (scope, element, attrs) => {

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
              title: $rootScope.text.page_maintenance_work_time_lpg.table.sort,
              data: (data, type, full, meta) => (meta.row + 1),
              width: "30px",
              className: "text-right",
              responsivePriority: 1
            }, {
              title: $rootScope.text.page_maintenance_work_time_lpg.table.vehicle_name,
              data: data => data.vehicle_name,
              responsivePriority: 2
            }, {
              title: $rootScope.text.page_maintenance_work_time_lpg.table.mileage,
              data: data => parseFloat(parseFloat(data.now_mileage || 0) + parseFloat(data.calibrate_mileage || 0)).toFixed(3)
            }, {
              title: $rootScope.text.page_maintenance_work_time_lpg.table.work_time,
              data: data => parseFloat((parseFloat(data.working_hour_norun || 0) + parseFloat(data.calibrate_working_hour || 0)) / 60).toFixed(0)
            }, {
              title: $rootScope.text.page_maintenance_work_time_lpg.table.last_check,
              data: data => data.lastcheck
            }, {
              title: $rootScope.text.page_maintenance_work_time_lpg.table.check_every,
              data: data => data.check_every
            }, {
              title: $rootScope.text.page_maintenance_work_time_lpg.table.due_check,
              data: data => data.duecheck
            }, {
              title: $rootScope.text.page_maintenance_work_time_lpg.table.status,
              data: data => scope.customizeTextWorkTime(data.status, data.left_working_hour || 0)
            }, {
              title: $rootScope.text.page_maintenance_work_time_lpg.table.edit,
              data: data => {
                if ($rootScope.authentication.role == 'admin') {
                  return `<button class="btn btn-warning btn-circle btn-list" ng-click='edit(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_maintenance_work_time_lpg.edit_tooltip}"><i class="fa fa-pencil-square-o"></i></button>`
                } else {
                  return `<button class="btn btn-warning btn-circle btn-list" ng-click='edit(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_maintenance_work_time_lpg.edit_tooltip}" disabled><i class="fa fa-pencil-square-o"></i></button>`
                }
              },
              className: "text-center",
              responsivePriority: 2
            }],
            fnCreatedRow: (nRow, aData, iDataIndex) => {
              const linker = $compile(nRow)
              const element = linker(scope)
              return nRow = element
            },
            responsive: {
              details: {
                display: $.fn.dataTable.Responsive.display.modal({
                  header: row => $rootScope.text.page_maintenance_work_time_lpg.title
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
                  columns: [ 0, 1, 2, 3 ]
                },
                title: $rootScope.text.page_maintenance_work_time_lpg.table.export_title,
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-clipboard"> Copy to clipboard ')
                },
                className: 'btn btn-default btn-sm'
              }, {
                extend: 'excelHtml5',
                exportOptions: {
                  // columns: ':visible(:not(.not-export-col))'
                  columns: [ 0, 1, 2, 3 ]
                },
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-file-text-o"></i> Export .xlsx')
                },
                title: $rootScope.text.page_maintenance_work_time_lpg.table.export_title,
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

        scope.customizeTextWorkTime = (status, left_working_hour) => {
          if (status == "left") {
            return `${$rootScope.text.page_maintenance_work_time_batt.status_left}${parseFloat(left_working_hour).toFixed(0)}`
          } else if (status == "over") {
            return `${$rootScope.text.page_maintenance_work_time_batt.status_over}${parseFloat(left_working_hour).toFixed(0)}`
          } else {
            return null;
          }
        }

        scope.edit = data => scope.modalEdit({ data: data })
      }
    }
  }
])
