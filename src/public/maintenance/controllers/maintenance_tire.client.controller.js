angular.module('maintenance').controller('MaintenanceTireController', ['$rootScope', '$scope', '$iService', 'maintenanceTireFactory',
  ($rootScope, $scope, $iService, maintenanceTireFactory) => {

    $scope.$iService = $iService
    
    $scope.modalMaintenanceTire = {}

    maintenanceTireFactory.getMaintenanceTire(res => {
      if (res.length > 0) {
        $scope.dataMaintenanceTire = res
      } else {
        $scope.dataMaintenanceTire = []
      }
    })

    $scope.toggleModalEdit = (data) => {
      $scope.modalMaintenanceTire.editModal(data)
    }

    $scope.confirmEdit = (data) => {
      if (data.modem_id != "" && data.modem_id != null && data.modem_id !== '0' &&
        $iService.checkDecimal(data.last_check.toString()) &&
        $iService.checkDecimal(data.check_every.toString())) {
        if (data.edit) {
          const _duecheck = parseFloat(data.last_check) + parseFloat(data.check_every)
          maintenanceTireFactory.editMaintenanceTire(data, res => {
            if (res.success) {
              const _modem_id = $scope.dataMaintenanceTire.map((_data) => (_data.modem_id))
              const _index = _modem_id.indexOf(data.modem_id)
              if (_index != -1) {
                $scope.dataMaintenanceTire[_index].status = 'left'
                $scope.dataMaintenanceTire[_index].lastcheck = parseFloat(data.last_check)
                $scope.dataMaintenanceTire[_index].check_every = parseFloat(data.check_every)
                $scope.dataMaintenanceTire[_index].duecheck = parseFloat(_duecheck)
                $scope.dataMaintenanceTire[_index].leftmileage = parseFloat(_duecheck) - parseFloat(data.last_check)
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_maintenance_tire.alert_title_success,
                  detail: $rootScope.text.page_maintenance_tire.alert_detail_success
                })
              } else {
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_maintenance_tire.alert_title_error,
                  detail: $rootScope.text.page_maintenance_tire.alert_detail_error
                })
              }
            } else {
              $iService.toggleModalMessage({
                title: $rootScope.text.page_maintenance_tire.alert_title_error,
                detail: $rootScope.text.page_maintenance_tire.alert_detail_error
              })
            }
          })
        }
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_maintenance_tire.alert_title,
          detail: $rootScope.text.page_maintenance_tire.alert_blank
        })
      }
    }
  }
]).directive('modalMaintenanceTire', ['$rootScope',
  ($rootScope) => {
    return {
      templateUrl: 'maintenance/views/modal_maintenance_tire.client.view.html',
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
          scope.inputMaintenanceLastcheck = data.now_mileage.toFixed(0)
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
]).directive('tableMaintenanceTire', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
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
              title: $rootScope.text.page_maintenance_tire.table.vehicle_name,
              data: data => data.vehicle_name,
              responsivePriority: 1
            }, {
              title: $rootScope.text.page_maintenance_tire.table.mileage,
              data: data => data.now_mileage.toFixed(0)
            }, {
              title: $rootScope.text.page_maintenance_tire.table.last_check,
              data: data => data.lastcheck
            }, {
              title: $rootScope.text.page_maintenance_tire.table.check_every,
              data: data => data.check_every
            }, {
              title: $rootScope.text.page_maintenance_tire.table.due_check,
              data: data => data.duecheck
            }, {
              title: $rootScope.text.page_maintenance_tire.table.status,
              data: data => scope.customizeTextLubricator(data.status, data.leftmileage)
            }, {
              title: $rootScope.text.page_maintenance_tire.table.edit,
              data: data => `<button class="btn btn-warning btn-circle btn-list" ng-click='edit(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_maintenance_tire.edit_tooltip}"><i class="fa fa-pencil-square-o"></i></button>`,
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
                  header: row => $rootScope.text.page_maintenance_tire.title
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
                title: $rootScope.text.page_maintenance_tire.table.export_title,
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
                title: $rootScope.text.page_maintenance_tire.table.export_title,
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

        scope.customizeTextLubricator = (status, leftmileage) => {
          if (status == "left") {
            return `${$rootScope.text.page_maintenance_tire.status_left}${(leftmileage).toFixed(0)}`
          } else if (status == "over") {
            return `${$rootScope.text.page_maintenance_tire.status_over}${(leftmileage).toFixed(0)}`
          } else {
            return null;
          }
        }

        scope.edit = data => scope.modalEdit({ data: data })
      }
    }
  }
])
