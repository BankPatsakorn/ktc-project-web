angular.module('setting').controller('SettingGroupController', ['$rootScope', '$scope', '$location', '$iService', 'settingGroupFactory', 'indexFactory',
  ($rootScope, $scope, $location, $iService, settingGroupFactory, indexFactory) => {

    if ($rootScope.authentication.role != 'admin') {
      $location.path(`/${$rootScope.url_lang}/`)
    }

    $scope.$iService = $iService
    $scope.dataSettingGroup = []

    $scope.modalSettingGroup = {}
    $scope.modalChangePasswordGroup = {}

    settingGroupFactory.getDataGroup(res => {
      if (res.length > 0) {
        $scope.dataSettingGroup = res
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

    $scope.toggleModalAdd = () => {
      $scope.modalSettingGroup.addModal()
    }

    $scope.toggleModalEdit = data => {
      $scope.dataEditVehicle = []
      settingGroupFactory.getDataVehicleGroup(data, res => {
        if (res.length > 0) {
          $scope.dataEditVehicle = res.map(_data => {
            return {
              id: _data.modem_id,
              text: _data.get_vehiclename
            }
          })
        }
      })
      $scope.modalSettingGroup.editModal(data)
    }

    $scope.toggleModalChangePassword = data => {
      $scope.modalChangePasswordGroup.changePassword(data)
    }

    $scope.toggleModalDelete = (code) => {
      $scope.fleet_code = code
      $scope.showModalDeleteGroup = !$scope.showModalDeleteGroup
    }

    $scope.modalClearData = () => {
      $scope.editVehicles = null
    }

    $scope.confirmChangePassword = data => {
      if (data.new_password != null && data.new_password != "" &&
        data.confirm_password != null && data.confirm_password != "") {
        if (data.new_password == data.confirm_password) {
          settingGroupFactory.changePasswordGroup(data, res => {
            if (res.success) {
              $iService.toggleModalMessage({
                title: $rootScope.text.page_setting_group.alert_title_success,
                detail: $rootScope.text.page_setting_group.alert_detail_success
              })
            } else {
              $iService.toggleModalMessage({
                title: $rootScope.text.page_setting_group.alert_title_error,
                detail: $rootScope.text.page_setting_group.alert_detail_error
              })
            }
          })
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.page_setting_group.alert_title_warning,
            detail: $rootScope.text.page_setting_group.alert_not_match
          })
        }
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_setting_group.alert_title_warning,
          detail: $rootScope.text.page_setting_group.alert_detail_blank
        })
      }
    }

    $scope.confirmEdit = data => {
      if (data.fleetname != null && data.fleetname != "" &&
        data.subfleetid != null && data.subfleetid != "" &&
        data.vehiclename != null && data.vehiclename != "") {
        if (data.edit) {
          settingGroupFactory.editDataGroup(data, res => {
            if (res.success) {
              const _code = $scope.dataSettingGroup.map(_data => (_data.fleet_code))
              const _index = _code.indexOf(data.fleet_code)
              if (_index != -1) {
                $scope.dataSettingGroup[_index].subfleetid = data.subfleetid
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_setting_group.alert_title_success,
                  detail: $rootScope.text.page_setting_group.alert_detail_success
                })
              } else {
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_setting_group.alert_title_error,
                  detail: $rootScope.text.page_setting_group.alert_detail_error
                })
              }
            } else {
              $iService.toggleModalMessage({
                title: $rootScope.text.page_setting_group.alert_title_error,
                detail: $rootScope.text.page_setting_group.alert_detail_error
              })
            }
          })
        } else {
          if (data.password == data.confirm_password) {
            settingGroupFactory.addDataGroup(data, res => {
              if (res.success) {
                const _data = {
                  fleet_code: res.fleet_code,
                  fleetname: data.fleetname,
                  subfleetid: data.subfleetid
                }
                $scope.dataSettingGroup.push(_data)
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_setting_group.alert_title_success,
                  detail: $rootScope.text.page_setting_group.alert_detail_success
                })
              } else {
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_setting_group.alert_title_error,
                  detail: $rootScope.text.page_setting_group.alert_detail_error
                })
              }
            })
          } else {
            $iService.toggleModalMessage({
              title: $rootScope.text.page_setting_group.alert_title_warning,
              detail: $rootScope.text.page_setting_group.alert_not_match
            })
          }
        }
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_setting_group.alert_title_warning,
          detail: $rootScope.text.page_setting_group.alert_detail_blank
        })
      }
    }

    $scope.confirmDelete = () => {
      const _data = {
        fleet_code: $scope.fleet_code
      }
      settingGroupFactory.deleteDataGroup(_data, res => {
        if (res.success) {
          const _code = $scope.dataSettingGroup.map(data => (data.fleet_code))
          const _index = _code.indexOf(_data.fleet_code)
          if (_index != -1) {
            $scope.dataSettingGroup.splice(_index, 1)
            $iService.toggleModalMessage({
              title: $rootScope.text.page_setting_group.alert_title_success,
              detail: $rootScope.text.page_setting_group.alert_detail_success
            })
          } else {
            $iService.toggleModalMessage({
              title: $rootScope.text.page_setting_group.alert_title_error,
              detail: $rootScope.text.page_setting_group.alert_detail_error
            })
          }
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.page_setting_group.alert_title_error,
            detail: $rootScope.text.page_setting_group.alert_detail_error
          })
        }
      })
    }
  }
]).directive('modalChangePasswordGroup', ['$rootScope',
  ($rootScope) => {
    return {
      templateUrl: 'setting/views/modal_change_password_group.client.view.html',
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: {
        sharedobj: '=',
        modalConfirm: '&fnModalConfirm'
      },
      link: (scope, element, attrs) => {

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
            scope.inputNewPassword = ""
            scope.inputConfirmPassword = ""
            scope.$parent[attrs.visible] = false
          })
        })

        scope.sharedobj.changePassword = data => {
          scope.confirmEdit = true
          scope.fleetCode = data.fleet_code
          element.modal('toggle')
        }

        scope.confirm = () => {
          scope.modalConfirm({
            data: {
              fleet_code: scope.fleetCode,
              new_password: scope.inputNewPassword,
              confirm_password: scope.inputConfirmPassword
            }
          })
        }
      }
    }
  }
]).directive('modalSettingGroup', ['$rootScope',
  ($rootScope) => {
    return {
      templateUrl: 'setting/views/modal_setting_group.client.view.html',
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: {
        vehicles: '@',
        editVehicles: '@',
        sharedobj: '=',
        modalConfirm: '&fnModalConfirm',
        modalClear: '&fnModalClear'
      },
      link: (scope, element, attrs) => {

        scope.text = $rootScope.text
        scope.confirmEdit = false

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
            scope.inputGroupID = ""
            scope.inputGroupName = ""
            scope.inputPassword = ""
            scope.inputConfirmPassword = ""
            scope.bundleVehicle = []
            scope.modalClear()
            scope.$parent[attrs.visible] = false
          })
        })

        scope.$watch('vehicles', (newValue, oldValue) => {
          if (newValue && typeof newValue === 'string') {
            scope.dataSelectVehicles = JSON.parse(newValue)
          }
        })

        scope.$watch('editVehicles', (newValue, oldValue) => {
          if (newValue && typeof newValue === 'string') {
            const _bundle = JSON.parse(newValue).map(data => (data.id))
            scope.bundleVehicle = _bundle
          }
        })

        scope.sharedobj.addModal = () => {
          scope.confirmEdit = false
          scope.inputGroupID = ""
          scope.inputGroupName = ""
          scope.inputPassword = ""
          scope.inputConfirmPassword = ""
          scope.bundleVehicle = []
          scope.title = $rootScope.text.modal_setting_group.title_add
          scope.btn_edit = $rootScope.text.modal_setting_group.btn_confirm
          scope.btn_close = $rootScope.text.modal_setting_group.btn_close
          element.modal('toggle')
        }

        scope.sharedobj.editModal = data => {
          scope.confirmEdit = true
          scope.fleetCode = data.fleet_code
          scope.inputGroupID = data.fleetname
          scope.inputGroupName = data.subfleetid
          scope.inputPassword = ""
          scope.inputConfirmPassword = ""
          scope.bundleVehicle = []
          scope.title = $rootScope.text.modal_setting_group.title_edit
          scope.btn_edit = $rootScope.text.modal_setting_group.btn_edit
          scope.btn_close = $rootScope.text.modal_setting_group.btn_close
          element.modal('toggle')
        }

        scope.confirm = () => {
          let _vehicle = ""
          scope.bundleVehicle.forEach((value, index) => {
            if (index == scope.bundleVehicle.length-1) {
              _vehicle = `${_vehicle}${value}`
            } else {
              _vehicle = `${_vehicle}${value},`
            }
          })
          if (scope.confirmEdit) {
            scope.modalConfirm({
              data: {
                edit: scope.confirmEdit,
                fleet_code: scope.fleetCode,
                fleetname: scope.inputGroupID,
                subfleetid: scope.inputGroupName,
                vehiclename: _vehicle
              }
            })
          } else {
            scope.modalConfirm({
              data: {
                edit: scope.confirmEdit,
                fleetname: scope.inputGroupID,
                subfleetid: scope.inputGroupName,
                password: scope.inputPassword,
                confirm_password: scope.inputConfirmPassword,
                vehiclename: _vehicle
              }
            })
          }
        }
      }
    }
  }
]).directive('modalDeleteGroup', () => {
  return {
    templateUrl: 'setting/views/modal_delete_group.client.view.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: true,
    link: (scope, element, attrs) => {

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
        })
      })
    }
  }
}).directive('tableSettingGroup', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
  ($rootScope, $compile, $iService, $window, $timeout) => {
    return {
      restrict: 'AC',
      scope: {
        data: '@',
        modalChangePassword: '&fnToggleModalChangePassword',
        modalEdit: '&fnToggleModalEdit',
        modalDelete: '&fnToggleModalDelete'
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
              title: $rootScope.text.page_setting_group.table.group_id,
              data: data => data.fleetname,
              responsivePriority: 1
            }, {
              title: $rootScope.text.page_setting_group.table.group_name,
              data: data => data.subfleetid
            }, {
              title: $rootScope.text.page_setting_group.table.change_password,
              data: data => `<button class="btn btn-primary btn-circle btn-list" ng-click='changePassword(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_setting_group.change_password_tooltip}"><i class="fa fa-key"></i></button>`,
              className: "text-center",
              responsivePriority: 2
            }, {
              title: $rootScope.text.page_setting_group.table.edit,
              data: data => `<button class="btn btn-warning btn-circle btn-list" ng-click='edit(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_setting_group.edit_tooltip}"><i class="fa fa-pencil-square-o"></i></button>`,
              className: "text-center",
              responsivePriority: 3
            }, {
              title: $rootScope.text.page_setting_group.table.delete,
              data: data => `<button class="btn btn-danger btn-circle btn-list" ng-click="delete('${data.fleet_code}')" tooltip data-placement="top" data-title="${$rootScope.text.page_setting_group.delete_tooltip}"><i class="fa fa-trash-o"></i></button>`,
              className: "text-center",
              responsivePriority: 4
            }],
            fnCreatedRow: (nRow, aData, iDataIndex) => {
              const linker = $compile(nRow)
              const element = linker(scope)
              return nRow = element
            },
            responsive: {
              details: {
                display: $.fn.dataTable.Responsive.display.modal({
                  header: row => $rootScope.text.page_setting_group.title
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
                  columns: [ 0, 1 ]
                },
                title: $rootScope.text.page_setting_group.table.export_title,
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-clipboard"> Copy to clipboard ')
                },
                className: 'btn btn-default btn-sm'
              }, {
                extend: 'excelHtml5',
                exportOptions: {
                  // columns: ':visible(:not(.not-export-col))'
                  columns: [ 0, 1 ]
                },
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-file-text-o"></i> Export .xlsx')
                },
                title: $rootScope.text.page_setting_group.table.export_title,
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

        scope.changePassword = data => scope.modalChangePassword({ data: data })
        scope.edit = data => scope.modalEdit({ data: data })
        scope.delete = data => scope.modalDelete({ data: data })
      }
    }
  }
])
