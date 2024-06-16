angular.module('setting').controller('SettingStaffController', ['$rootScope', '$scope', '$location', '$iService', 'settingStaffFactory',
  ($rootScope, $scope, $location, $iService, settingStaffFactory) => {

    if ($rootScope.authentication.role != 'admin') {
      $location.path(`/${$rootScope.url_lang}/`)
    }

  	$scope.$iService = $iService
    $scope.dataSettingStaff = []
    
    $scope.modalSettingStaff = {}

    settingStaffFactory.getDataStaff(res => {
      if (res.length > 0) {
        $scope.dataSettingStaff = res
      }
    })

    $scope.toggleModalAdd = () => {
      $scope.modalSettingStaff.addModal()
    }

    $scope.toggleModalEdit = (data) => {
      $scope.modalSettingStaff.editModal(data)
    }

    $scope.toggleModalDelete = (id) => {
      $scope.delete_id = id
      $scope.showModalDeleteStaff = !$scope.showModalDeleteStaff
    }

    $scope.confirmDelete = () => {
      const _data = {
        id: $scope.delete_id
      }
      settingStaffFactory.deleteDataStaff(_data, res => {
        if (res.success) {
          const _id = $scope.dataSettingStaff.map((data) => (data.id))
          const _index = _id.indexOf(_data.id)
          if (_index != -1) {
            $scope.dataSettingStaff.splice(_index, 1)
            $iService.toggleModalMessage({
              title: $rootScope.text.page_setting_staff.alert_title_success,
              detail: $rootScope.text.page_setting_staff.alert_detail_success
            })
          } else {
            $iService.toggleModalMessage({
              title: $rootScope.text.page_setting_staff.alert_title_error,
              detail: $rootScope.text.page_setting_staff.alert_detail_error
            })
          }
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.page_setting_staff.alert_title_error,
            detail: $rootScope.text.page_setting_staff.alert_detail_error
          })
        }
      })
    }

    $scope.confirmEdit = (data) => {
      if (data.contact_name != null && data.contact_name != "" &&
        data.contact_lastname != null && data.contact_lastname != "" &&
        data.email != null && data.email != "" &&
        data.mobile_phone != null && data.mobile_phone != "" &&
        data.job_position != null && data.job_position != "") {
        if (data.edit) {
          settingStaffFactory.editDataStaff(data, res => {
            if (res.success) {
              const _id = $scope.dataSettingStaff.map((_data) => (_data.id))
              const _index = _id.indexOf(data.id)
              if (_index != -1) {
                $scope.dataSettingStaff[_index].contact_name = data.contact_name
                $scope.dataSettingStaff[_index].contact_lastname = data.contact_lastname
                $scope.dataSettingStaff[_index].email = data.email
                $scope.dataSettingStaff[_index].mobile_phone = data.mobile_phone
                $scope.dataSettingStaff[_index].job_position = data.job_position
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_setting_staff.alert_title_success,
                  detail: $rootScope.text.page_setting_staff.alert_detail_success
                })
              } else {
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_setting_staff.alert_title_error,
                  detail: $rootScope.text.page_setting_staff.alert_detail_error
                })
              }
            } else {
              $iService.toggleModalMessage({
                title: $rootScope.text.page_setting_staff.alert_title_error,
                detail: $rootScope.text.page_setting_staff.alert_detail_error
              })
            }
          })
        } else {
          settingStaffFactory.addDataStaff(data, res => {
            if (res.success) {
              const _data = {
                id: res.id,
                fleetid: $rootScope.authentication.fleetid,
                fleetname: $rootScope.authentication.fleetname,
                contact_name: data.contact_name,
                contact_lastname: data.contact_lastname,
                email: data.email,
                mobile_phone: data.mobile_phone,
                job_position: data.job_position
              }
              $scope.dataSettingStaff.push(_data)
              $iService.toggleModalMessage({
                title: $rootScope.text.page_setting_staff.alert_title_success,
                detail: $rootScope.text.page_setting_staff.alert_detail_success
              })
            }
          })
        }
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_tracking_realtime.alert_title_warning,
          detail: $rootScope.text.page_tracking_realtime.alert_detail_blank
        })
      }
    }
  }
]).directive('modalSettingStaff', ['$rootScope',
  ($rootScope) => {
    return {
      templateUrl: 'setting/views/modal_setting_staff.client.view.html',
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
            scope.inputFirstName = ""
            scope.inputLastName = ""
            scope.inputEmail = ""
            scope.inputPhone = ""
            scope.inputDepartment = ""
            scope.$parent[attrs.visible] = false
          })
        })

        scope.sharedobj.addModal = () => {
          scope.confirmEdit = false
          scope.inputFirstName = ""
          scope.inputLastName = ""
          scope.inputEmail = ""
          scope.inputPhone = ""
          scope.inputDepartment = ""
          scope.title = $rootScope.text.modal_setting_staff.title_add
          scope.btn_edit = $rootScope.text.modal_setting_staff.btn_confirm
          scope.btn_close = $rootScope.text.modal_setting_staff.btn_close
          element.modal('toggle')
        }

        scope.sharedobj.editModal = (data) => {
          scope.confirmEdit = true
          scope.inputId = data.id
          scope.inputFirstName = data.contact_name
          scope.inputLastName = data.contact_lastname
          scope.inputEmail = data.email
          scope.inputPhone = data.mobile_phone
          scope.inputDepartment = data.job_position
          scope.title = $rootScope.text.modal_setting_staff.title_edit
          scope.btn_edit = $rootScope.text.modal_setting_staff.btn_edit
          scope.btn_close = $rootScope.text.modal_setting_staff.btn_close
          element.modal('toggle')
        }

        scope.confirm = () => {
          if (scope.confirmEdit) {
            scope.modalConfirm({
              data: {
                edit: scope.confirmEdit,
                id: scope.inputId,
                contact_name: scope.inputFirstName,
                contact_lastname: scope.inputLastName,
                email: scope.inputEmail,
                mobile_phone: scope.inputPhone,
                job_position: scope.inputDepartment
              }
            })
          } else {
            scope.modalConfirm({
              data: {
                edit: scope.confirmEdit,
                contact_name: scope.inputFirstName,
                contact_lastname: scope.inputLastName,
                email: scope.inputEmail,
                mobile_phone: scope.inputPhone,
                job_position: scope.inputDepartment
              }
            })
          }
        }
      }
    }
  }
]).directive('modalDeleteStaff', () => {
  return {
    templateUrl: 'setting/views/modal_delete_staff.client.view.html',
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
}).directive('tableSettingStaff', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
  ($rootScope, $compile, $iService, $window, $timeout) => {
    return {
      restrict: 'AC',
      scope: {
        data: '@',
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
              title: $rootScope.text.page_setting_staff.table.staff_name,
              data: data => data.contact_name + " " + data.contact_lastname,
              responsivePriority: 1
            }, {
              title: $rootScope.text.page_setting_staff.table.email,
              data: data => data.email
            }, {
              title: $rootScope.text.page_setting_staff.table.department,
              data: data => data.job_position
            }, {
              title: $rootScope.text.page_setting_staff.table.phone,
              data: data => data.mobile_phone
            }, {
              title: $rootScope.text.page_setting_staff.table.group_zone,
              data: data => data.group_zone || ''
            }, {
              title: $rootScope.text.page_setting_staff.table.edit,
              data: data => `<button class="btn btn-warning btn-circle btn-list" ng-click='edit(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_setting_staff.edit_tooltip}"><i class="fa fa-pencil-square-o"></i></button>`,
              className: "text-center",
              responsivePriority: 2
            }, {
              title: $rootScope.text.page_setting_staff.table.delete,
              data: data => `<button class="btn btn-danger btn-circle btn-list" ng-click="delete('${data.id}')" tooltip data-placement="top" data-title="${$rootScope.text.page_setting_staff.delete_tooltip}"><i class="fa fa-trash-o"></i></button>`,
              className: "text-center",
              responsivePriority: 3
            }],
            fnCreatedRow: (nRow, aData, iDataIndex) => {
              const linker = $compile(nRow)
              const element = linker(scope)
              return nRow = element
            },
            responsive: {
              details: {
                display: $.fn.dataTable.Responsive.display.modal({
                  header: row => $rootScope.text.page_setting_staff.title
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
                title: $rootScope.text.page_setting_staff.table.export_title,
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
                title: $rootScope.text.page_setting_staff.table.export_title,
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

        scope.edit = data => scope.modalEdit({ data: data })
        scope.delete = data => scope.modalDelete({ data: data })
      }
    }
  }
])
