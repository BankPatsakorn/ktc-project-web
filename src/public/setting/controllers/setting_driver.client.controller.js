angular.module('setting').controller('SettingDriverController', ['$rootScope', '$scope', '$location', '$iService', 'settingDriverFactory', 'indexFactory',
  ($rootScope, $scope, $location, $iService, settingDriverFactory, indexFactory) => {
    
    if ($rootScope.authentication.role != 'admin' &&
      $rootScope.authentication.role != 'tnt') {
      $location.path(`/${$rootScope.url_lang}/`)
    }

  	$scope.$iService = $iService
    $scope.dataSettingDriver = []
    
    $scope.modalSettingDriver = {}
    $scope.modalSettingDriverRFID = {}

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

    settingDriverFactory.getDataDriver(res => {
      if (res.length > 0) {
        $scope.dataSettingDriver = res
      }
    })

    $scope.toggleModalRFID = data => {
      $scope.modalSettingDriverRFID.editModal(data)
    }

    $scope.toggleModalAdd = () => {
      $scope.modalSettingDriver.addModal()
    }

    $scope.toggleModalEdit = (data) => {
      $scope.modalSettingDriver.editModal(data)
    }

    $scope.toggleModalDelete = (id) => {
      $scope.delete_id = id
      $scope.showModalDeleteDriver = !$scope.showModalDeleteDriver
    }

    $scope.confirmDelete = () => {
      const _data = {
        id: $scope.delete_id
      }
      settingDriverFactory.deleteDataDriver(_data, res => {
        if (res.success) {
          const _id = $scope.dataSettingDriver.map((data) => (data.id))
          const _index = _id.indexOf(_data.id)
          if (_index != -1) {
            $scope.dataSettingDriver.splice(_index, 1)
            $iService.toggleModalMessage({
              title: $rootScope.text.page_setting_driver.alert_title_success,
              detail: $rootScope.text.page_setting_driver.alert_detail_success
            })
          } else {
            $iService.toggleModalMessage({
              title: $rootScope.text.page_setting_driver.alert_title_error,
              detail: $rootScope.text.page_setting_driver.alert_detail_error
            })
          }
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.page_setting_driver.alert_title_error,
            detail: $rootScope.text.page_setting_driver.alert_detail_error
          })
        }
      })
    }

    $scope.confirmEditDriverRFID = data => {
      if (data.rfid != '0') {
        const _data = {
          id: data.id,
          rfid: data.rfid
        }
        settingDriverFactory.editDataDriverRFID(data, res => {
          if (res.success) {
            const _id = $scope.dataSettingDriver.map((_data) => (_data.id))
            const _index = _id.indexOf(data.id)
            if (_index != -1) {
              $scope.dataSettingDriver[_index].rfid = data.rfid
              $iService.toggleModalMessage({
                title: $rootScope.text.page_setting_driver.alert_title_success,
                detail: $rootScope.text.page_setting_driver.alert_detail_success
              })
            } else {
              $iService.toggleModalMessage({
                title: $rootScope.text.page_setting_driver.alert_title_error,
                detail: $rootScope.text.page_setting_driver.alert_detail_error
              })
            }
          } else {
            $iService.toggleModalMessage({
              title: $rootScope.text.page_setting_vehicle.alert_title_error,
              detail: $rootScope.text.page_setting_vehicle.alert_detail_error
            })
          }
        })
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_setting_vehicle.alert_title_warning,
          detail: $rootScope.text.page_setting_vehicle.alert_detail_blank
        })
      }
    }

    $scope.confirmEdit = (data) => {
      if (data.code != null && data.code != "" &&
        data.name != null && data.name != "" &&
        data.department != null && data.department != "" &&
        data.email != null && data.email != "" &&
        data.phone != null && data.phone != "" &&
        data.image != null && data.image != "" && data.image != "../../static/assets/img/user.png") {
        if (data.edit) {
          settingDriverFactory.editDataDriver(data, res => {
            if (res.success) {
              const _id = $scope.dataSettingDriver.map((_data) => (_data.id))
              const _index = _id.indexOf(data.id)
              if (_index != -1) {
                $scope.dataSettingDriver[_index].code = data.code
                $scope.dataSettingDriver[_index].name = data.name
                $scope.dataSettingDriver[_index].department = data.department
                $scope.dataSettingDriver[_index].email = data.email
                $scope.dataSettingDriver[_index].phone = data.phone
                $scope.dataSettingDriver[_index].image = data.image
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_setting_driver.alert_title_success,
                  detail: $rootScope.text.page_setting_driver.alert_detail_success
                })
              } else {
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_setting_driver.alert_title_error,
                  detail: $rootScope.text.page_setting_driver.alert_detail_error
                })
              }
            } else {
              $iService.toggleModalMessage({
                title: $rootScope.text.page_setting_driver.alert_title_error,
                detail: $rootScope.text.page_setting_driver.alert_detail_error
              })
            }
          })
        } else {
          settingDriverFactory.addDataDriver(data, res => {
            if (res.success) {
              const _data = {
                id: res.id,
                fleetid: $rootScope.authentication.fleetid,
                fleetname: $rootScope.authentication.fleetname,
                code: data.code,
                rfid: '-',
                name: data.name,
                department: data.department,
                email: data.email,
                phone: data.phone
              }
              $scope.dataSettingDriver.push(_data)
              $iService.toggleModalMessage({
                title: $rootScope.text.page_setting_driver.alert_title_success,
                detail: $rootScope.text.page_setting_driver.alert_detail_success
              })
            }
          })
        }
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_setting_driver.alert_title_warning,
          detail: $rootScope.text.page_setting_driver.alert_detail_blank
        })
      }
    }
  }
]).directive('modalSettingDriverRFID', ['$rootScope', '$timeout', '$iService', 'settingDriverFactory',
  ($rootScope, $timeout, $iService, settingDriverFactory) => {
    return {
      templateUrl: 'setting/views/modal_setting_driver_rfid.client.view.html',
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: {
        vehicle: "@",
        sharedobj: '=',
        modalConfirm: '&fnModalConfirm'
      },
      link: (scope, element, attrs) => {

        scope.text = $rootScope.text
        scope.confirmEdit = false
        scope.dataEdit = {}
        scope.dataRFID = []
        scope.dataSelectVehicle = []
        scope.inputDatetime = moment().format('YYYY-MM-DD')

        scope.$watch('vehicle', value => {
          if (typeof value !== "undefined" && value != null && value != "") {
            scope.dataSelectVehicle = JSON.parse(value)
          }
        })

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
            scope.dataSelect = []
            scope.selectRFID = "0"
            scope.inputRFID = ""
            scope.$parent[attrs.visible] = false
          })
        })

        scope.getDataRFIDModemID = () => {
          if (typeof scope.modemId !== "undefined" && scope.modemId != null && scope.modemId != "" && scope.modemId != "0" &&
          typeof scope.inputDatetime !== "undefined" && scope.inputDatetime != null && scope.inputDatetime != "") {
            const _data = {
              modem_id: scope.modemId,
              datetime: scope.inputDatetime
            }
            settingDriverFactory.getDataRFIDModemID(_data, res => {
              if (res.length > 0) {
                scope.dataSelect = res.map((data, index) => {
                  return {
                    id: index,
                    text: `${data.vehiclename} / ${data.rfid} / ${$iService.formatTextDateTime(data.recive_time)}`,
                    value: data.rfid
                  }
                })
              }
            })
          }
        }

        scope.$watch('inputDatetime', value => {
          scope.getDataRFIDModemID()
        })

        scope.$watch('modemId', value => {
          scope.getDataRFIDModemID()
        })

        scope.sharedobj.editModal = (data) => {
          scope.getDataRFIDModemID()
          scope.inputId = data.id
          scope.inputRFID = data.rfid
          scope.confirmEdit = true
          scope.title = $rootScope.text.modal_setting_driver_rfid.title
          scope.btn_edit = $rootScope.text.modal_setting_driver_rfid.btn_edit
          scope.btn_close = $rootScope.text.modal_setting_driver_rfid.btn_close
          element.modal('toggle')
        }

        scope.sharedobj.toggleModal = () => {
          element.modal('toggle')
        }

        scope.confirm = () => {
          if (scope.confirmEdit) {
            const _index = scope.dataSelect.map(data => (data.id)).indexOf(parseInt(scope.selectRFID))
            if (_index != -1) {
              scope.modalConfirm({
                data: {
                  edit: scope.confirmEdit,
                  id: scope.inputId,
                  rfid: scope.dataSelect[_index].value
                }
              })
            }
          }
        }
      }
    }
  }
]).directive('modalSettingDriver', ['$rootScope', '$iService',
  ($rootScope, $iService) => {
    return {
      templateUrl: 'setting/views/modal_setting_driver.client.view.html',
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
            scope.inputCode = ""
            scope.inputName = ""
            scope.inputDepartment = ""
            scope.inputEmail = ""
            scope.inputPhone = ""
            scope.inputImage = ""
            scope.$parent[attrs.visible] = false
          })
        })

        scope.sharedobj.addModal = () => {
          scope.confirmEdit = false
          scope.inputCode = ""
          scope.inputName = ""
          scope.inputDepartment = ""
          scope.inputEmail = ""
          scope.inputPhone = ""
          scope.inputImage = "../../static/assets/img/user.png"
          scope.title = $rootScope.text.modal_setting_driver.title_add
          scope.btn_edit = $rootScope.text.modal_setting_driver.btn_confirm
          scope.btn_close = $rootScope.text.modal_setting_driver.btn_close
          element.modal('toggle')
        }

        scope.sharedobj.editModal = (data) => {
          scope.confirmEdit = true
          scope.inputId = data.id
          scope.inputCode = data.code
          scope.inputName = data.name
          scope.inputDepartment = data.department
          scope.inputEmail = data.email
          scope.inputPhone = data.phone
          if ($iService.checkImageURL(`${$iService.api()}nissanForklift/getImageDriver/${data.code}`)) {
            $iService.convertImgToDataURLviaCanvas(`${$iService.api()}nissanForklift/getImageDriver/${data.code}`, (base64_data) => {
              scope.inputImage = base64_data
            })
          } else {
            scope.inputImage = "../../static/assets/img/user.png"
          }
          scope.title = $rootScope.text.modal_setting_driver.title_edit
          scope.btn_edit = $rootScope.text.modal_setting_driver.btn_edit
          scope.btn_close = $rootScope.text.modal_setting_driver.btn_close
          element.modal('toggle')
        }

        scope.confirm = () => {
          if (scope.confirmEdit) {
            scope.modalConfirm({
              data: {
                edit: scope.confirmEdit,
                id: scope.inputId,
                code: scope.inputCode,
                name: scope.inputName,
                department: scope.inputDepartment,
                email: scope.inputEmail,
                phone: scope.inputPhone,
                image: scope.inputImage
              }
            })
          } else {
            scope.modalConfirm({
              data: {
                edit: scope.confirmEdit,
                code: scope.inputCode,
                name: scope.inputName,
                department: scope.inputDepartment,
                email: scope.inputEmail,
                phone: scope.inputPhone,
                image: scope.inputImage
              }
            })
          }
        }
      }
    }
  }
]).directive('modalDeleteDriver', () => {
  return {
    templateUrl: 'setting/views/modal_delete_driver.client.view.html',
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
}).directive('tableSettingDriver', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
  ($rootScope, $compile, $iService, $window, $timeout) => {
    return {
      restrict: 'AC',
      scope: {
        data: '@',
        modalRFID: '&fnToggleModalRFID',
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
              title: $rootScope.text.page_setting_driver.table.image,
              data: data => `<div class="list-image"><img src="${data.code == null ? '../../static/assets/img/user.png' : $iService.api() + 'nissanForklift/getImageDriver/' + data.code}"/></div>`,
              responsivePriority: 1
            }, {
              title: $rootScope.text.page_setting_driver.table.code,
              data: data => data.code
            }, {
              title: $rootScope.text.page_setting_driver.table.rfid || '-',
              data: data => data.rfid
            }, {
              title: $rootScope.text.page_setting_driver.table.name,
              data: data => data.name,
              responsivePriority: 2
            }, {
              title: $rootScope.text.page_setting_driver.table.department,
              data: data => data.department
            }, {
              title: $rootScope.text.page_setting_driver.table.email,
              data: data => data.email
            }, {
              title: $rootScope.text.page_setting_driver.table.phone,
              data: data => data.phone
            }, {
              title: $rootScope.text.page_setting_driver.table.rfid,
              data: data => `<button class="btn btn-info btn-circle btn-list" ng-click='rfid(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_setting_driver.rfid_tooltip}"><i class="fa fa-address-card-o"></i></button>`,
              className: "text-center",
              responsivePriority: 2
            }, {
              title: $rootScope.text.page_setting_driver.table.edit,
              data: data => `<button class="btn btn-warning btn-circle btn-list" ng-click='edit(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_setting_driver.edit_tooltip}"><i class="fa fa-pencil-square-o"></i></button>`,
              className: "text-center",
              responsivePriority: 3
            }, {
              title: $rootScope.text.page_setting_driver.table.delete,
              data: data => `<button class="btn btn-danger btn-circle btn-list" ng-click="delete('${data.id}')" tooltip data-placement="top" data-title="${$rootScope.text.page_setting_driver.delete_tooltip}"><i class="fa fa-trash-o"></i></button>`,
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
                  header: row => $rootScope.text.page_setting_driver.title
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
                  stripHtml : false,
                  columns: [ 0, 1, 2, 3, 4, 5, 6 ]
                },
                customize: function(data) {
                  const _data = data.replace(/<div class="list-image"><img src="/g, '').replace(/\"\/><\/div>/g, '')
                  return _data
                },
                title: $rootScope.text.page_setting_driver.table.export_title,
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-clipboard"> Copy to clipboard ')
                },
                className: 'btn btn-default btn-sm'
              }, {
                extend: 'excelHtml5',
                exportOptions: {
                  // columns: ':visible(:not(.not-export-col))'
                  stripHtml : false,
                  columns: [ 0, 1, 2, 3, 4, 5, 6 ],
                  // format: {
                  //   body: function ( data, row, column, node ) {
                  //     if (column == 0) {
                  //       console.log(data)
                  //     }
                  //   }
                  // }
                },
                customize: function(xlsx) {
                  var sheet = xlsx.xl.worksheets['sheet1.xml']
                  $('row c[r^="A"]', sheet).each( function () {
                      const _data = $('is t', this).text().replace('<div class="list-image"><img src="', '').replace('"/></div>', '')
                      if (_data.indexOf("http") != -1) {
                        $(this).attr('t', 'str')
                        $(this).append(`<f>HYPERLINK("${_data}", "${_data}")</f>`)
                        $('is', this).remove()
                        $(this).attr('s','4')

                        // function getBase64Image(img) {
                        //   var canvas = document.createElement("canvas")
                        //   canvas.width = img.width
                        //   canvas.height = img.height
                        //   var ctx = canvas.getContext("2d")
                        //   ctx.drawImage(img, 0, 0)
                        //   return canvas.toDataURL("image/png")
                        // }

                        // const _image = new Image()
                        // _image.src = _data
                        // console.log(getBase64Image(_image))
                        // return $('is t', this).html()
                      } else {
                        $('is t', this).text(_data)
                      }
                  })
                },
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-file-text-o"></i> Export .xlsx')
                },
                title: $rootScope.text.page_setting_driver.table.export_title,
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

        scope.rfid = data => scope.modalRFID({ data: data })
        scope.edit = data => scope.modalEdit({ data: data })
        scope.delete = data => scope.modalDelete({ data: data })
      }
    }
  }
])
