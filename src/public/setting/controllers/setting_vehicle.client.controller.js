angular.module('setting').controller('SettingVehicleController', ['$rootScope', '$scope', '$timeout', '$location', '$iService', 'settingVehicleFactory', 'indexFactory',
  ($rootScope, $scope, $timeout, $location, $iService, settingVehicleFactory, indexFactory) => {

    if ($rootScope.authentication.role != 'admin') {
      $location.path(`/${$rootScope.url_lang}/`)
    }

  	$scope.$iService = $iService
    $scope.dataSettingVehicle = []
    $scope.dataSelectRFID = []

    $scope.modalSettingVehicle = {}
    $scope.modalSettingMileage = {}
    $scope.modalSettingTagRFID = {}

    settingVehicleFactory.getDataVehicle(res => {
      if (res.length > 0) {
        $scope.dataSettingVehicle = res
      }
    })

    indexFactory.getDataDetailVehicle(res => {
      if (res.length > 0) {
        $scope.dataVehicles = res
      } else {
        $scope.dataVehicles = []
      }
    })

    indexFactory.getDataColor(res => {
      if (res.length > 0) {
        $scope.dataColors = res
      } else {
        $scope.dataColors = []
      }
    })

    indexFactory.getDataSimCard(res => {
      if (res.length > 0) {
        $scope.dataSimBrand = res
      } else {
        $scope.dataSimBrand = []
      }
    })

    $scope.toggleModalMileage = data => {
      $scope.modalSettingMileage.editModal(data)
    }

    $scope.toggleModalRFID = data => {
      $scope.modalSettingTagRFID.editModal(data)
    }

    $scope.toggleModalEdit = data => {
      $scope.modalSettingVehicle.editModal(data)
    }

    $scope.confirmEditMileage = data => {
      if (data.mileage_start != null && data.mileage_start != "" &&
        data.mileage_stop != null && data.mileage_stop != "" &&
        data.mileage_message_alert != null && data.mileage_message_alert != "") {
        settingVehicleFactory.editDataMileage(data, res => {
          if (res.success) {
            $iService.toggleModalMessage({
              title: $rootScope.text.page_setting_vehicle.alert_title_success,
              detail: $rootScope.text.page_setting_vehicle.alert_detail_success
            })
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

    $scope.confirmEditTagRFID = data => {
      if (data.rfid != '0') {
        settingVehicleFactory.editRFIDTagCode(data, res => {
          if (res.success) {
            $iService.toggleModalMessage({
              title: $rootScope.text.page_setting_vehicle.alert_title_success,
              detail: $rootScope.text.page_setting_vehicle.alert_detail_success
            })
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

    $scope.confirmEdit = data => {
      if (data.modem_id != null && data.modem_id != "" &&
        data.vehiclename != null && data.vehiclename != "" &&
        data.carlicence != null && data.carlicence != "" &&
        data.sim != null && data.sim != "" &&
        data.speedmax != null && data.speedmax != "" && $iService.checkDecimal(data.speedmax) &&
        data.idlestop != null && data.idlestop != "" && $iService.checkDecimal(data.idlestop) &&
        data.vbrand_id != null && data.vbrand_id != "" && data.vbrand_id != "0" &&
        data.vehicle_model_id != null && data.vehicle_model_id != "" && data.vehicle_model_id != "0" &&
        data.vtype_id != null && data.vtype_id != "" && data.vtype_id != "0" &&
        data.vehicle_color_id != null && data.vehicle_color_id != "" && data.vehicle_color_id != "0" &&
        data.sim_brand != null && data.sim_brand != "" && data.sim_brand != "0" &&
        data.calibrate_work_time != "" && data.calibrate_battery != "" && data.calibrate_mileage != "" &&
        data.group_zone != null && data.sim_brand != "" && data.sim_brand != "0") {
        if (data.edit) {
          settingVehicleFactory.editDataVehicle(data, res => {
            if (res.success) {
              const _id = $scope.dataSettingVehicle.map(_data => (_data.modem_id))
              const _index = _id.indexOf(data.modem_id)
              if (_index != -1) {
                $scope.dataSettingVehicle[_index].vehiclename = data.vehiclename
                $scope.dataSettingVehicle[_index].carlicence = data.carlicence
                $scope.dataSettingVehicle[_index].sim = data.sim
                $scope.dataSettingVehicle[_index].speedmax = data.speedmax
                $scope.dataSettingVehicle[_index].idlestop = data.idlestop
                $scope.dataSettingVehicle[_index].vbrand_id = data.vbrand_id
                $scope.dataSettingVehicle[_index].vehicle_model_id = data.vehicle_model_id
                $scope.dataSettingVehicle[_index].vtype_id = data.vtype_id
                $scope.dataSettingVehicle[_index].vehicle_color_id = data.vehicle_color_id
                $scope.dataSettingVehicle[_index].sim_brand = data.sim_brand
                $scope.dataSettingVehicle[_index].calibrate_work_time = data.calibrate_work_time
                $scope.dataSettingVehicle[_index].calibrate_battery = data.calibrate_battery
                $scope.dataSettingVehicle[_index].calibrate_mileage = data.calibrate_mileage
                $scope.dataSettingVehicle[_index].group_zone = data.group_zone
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_setting_vehicle.alert_title_success,
                  detail: $rootScope.text.page_setting_vehicle.alert_detail_success
                })
              } else {
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_setting_vehicle.alert_title_error,
                  detail: $rootScope.text.page_setting_vehicle.alert_detail_error
                })
              }
            } else {
              $iService.toggleModalMessage({
                title: $rootScope.text.page_setting_vehicle.alert_title_error,
                detail: $rootScope.text.page_setting_vehicle.alert_detail_error
              })
            }
          })
        }
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_setting_vehicle.alert_title_warning,
          detail: $rootScope.text.page_setting_vehicle.alert_detail_blank
        })
      }
    }
  }
]).directive('modalSettingMileage', ['$rootScope', 'settingVehicleFactory',
  ($rootScope, settingVehicleFactory) => {
    return {
      templateUrl: 'setting/views/modal_setting_mileage.client.view.html',
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
            scope.inputMileageStart = ""
            scope.inputMileageEnd = ""
            scope.inputMessage = ""
            scope.$parent[attrs.visible] = false
          })
        })

        scope.sharedobj.editModal = (data) => {
          scope.modem_id = data.modem_id
          settingVehicleFactory.getDataMileage(data, res => {
            if (res.success) {
              scope.inputMileageStart = res.data[0].mileage_start
              scope.inputMileageEnd = res.data[0].mileage_stop
              scope.inputMessage = res.data[0].mileage_message_alert
            }
          })
          element.modal('toggle')
        }

        scope.sharedobj.toggleModal = () => {
          element.modal('toggle')
        }

        scope.confirm = () => {
          scope.modalConfirm({
            data: {
              modem_id: scope.modem_id,
              mileage_start: scope.inputMileageStart,
              mileage_stop: scope.inputMileageEnd,
              mileage_message_alert: scope.inputMessage
            }
          })
        }
      }
    }
  }
]).directive('modalSettingTagRFID', ['$rootScope', '$timeout', '$iService', 'settingVehicleFactory',
  ($rootScope, $timeout, $iService, settingVehicleFactory) => {
    return {
      templateUrl: 'setting/views/modal_setting_tag_rfid.client.view.html',
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: {
        sharedobj: '=',
        modalConfirm: '&fnModalConfirm'
      },
      link: (scope, element, attrs) => {

        scope.text = $rootScope.text
        scope.confirmEdit = false
        scope.dataEdit = {}
        scope.dataRFID = []
        scope.inputDatetime = moment().format('YYYY-MM-DD')

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
            scope.inputStatus = ""
            scope.$parent[attrs.visible] = false
          })
        })

        scope.$watch('inputDatetime', value => {
          if (value && scope.modemId) {
            const _data = {
              modem_id: scope.modemId,
              datetime: value
            }
            settingVehicleFactory.getDataRFIDModemID(_data, res => {
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
        })

        scope.sharedobj.editModal = (data) => {
          scope.modemId = data.modem_id
          const _data = {
            modem_id: data.modem_id,
            datetime: scope.inputDatetime
          }
          settingVehicleFactory.getDataRFIDModemID(_data, res => {
            if (res.length > 0) {
              scope.dataSelect = res.map((data, index) => {
                return {
                  id: index,
                  text: `${data.vehiclename} / ${data.rfid} / ${$iService.formatTextDateTime(data.recive_time)}`,
                  value: data.rfid
                }
              })
            }
            settingVehicleFactory.getRFIDStatusUpdate(data, res => {
              if (res.length > 0) {
                scope.inputRFID = res[0].rfid_tag_code
                scope.inputStatus = res[0].rfid_status_update == false ? $rootScope.text.modal_setting_tag_rfid.not_update : $rootScope.text.modal_setting_tag_rfid.update
              }
            })
          })
          scope.confirmEdit = true
          scope.title = $rootScope.text.modal_setting_tag_rfid.title
          scope.btn_edit = $rootScope.text.modal_setting_tag_rfid.btn_edit
          scope.btn_close = $rootScope.text.modal_setting_tag_rfid.btn_close
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
                  modem_id: scope.modemId,
                  rfid: scope.dataSelect[_index].value
                }
              })
            }
          }
        }
      }
    }
  }
]).directive('modalSettingVehicle', ['$rootScope', '$timeout', '$iService',
  ($rootScope, $timeout, $iService) => {
    return {
      templateUrl: 'setting/views/modal_setting_vehicle.client.view.html',
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: {
        vehicles: '@',
        colors: '@',
        sims: '@',
        sharedobj: '=',
        modalConfirm: '&fnModalConfirm'
      },
      link: (scope, element, attrs) => {

        scope.text = $rootScope.text
        scope.confirmEdit = false
        scope.dataEdit = {}
        scope.calibrate_work_time = 0

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
            scope.inputModemId = ""
            scope.inputGroupZone = ""
            scope.inputVehicleName = ""
            scope.inputLicense = ""
            scope.inputSimNumber = ""
            scope.inputOverSpeed = ""
            scope.inputIdling = ""
            // scope.inputRateFule1 = ""
            // scope.inputFuelTank = ""
            scope.selectVehicleBrand = "0"
            scope.selectVehiclesModel = "0"
            scope.selectVehiclesType = "0"
            scope.selectColor = "0"
            scope.selectSimBrand = "0"
            scope.inputCalibrateWorkTime = ""
            scope.inputCompensateWorkTime = ""
            scope.inputCalibrateBattery = ""
            scope.inputCompensateBattery = ""
            scope.inputCalibrateMileage = ""
            scope.inputCompensateMileage = ""
            scope.dataEdit = {}
            scope.$parent[attrs.visible] = false
          })
        })

        scope.sharedobj.editModal = (data) => {
          scope.confirmEdit = true
          scope.dataVehicleBrand = []
          scope.dataEdit = data
          JSON.parse(scope.vehicles).filter(_data => {
            const i = scope.dataVehicleBrand.findIndex(x => x.text == _data.vehiclebrand)
            if (i <= -1) {
              scope.dataVehicleBrand.push({
                id: _data.vehiclebrandid,
                text: _data.vehiclebrand
              })
            }
            return null
          })
          scope.dataVehicleModel = []
          JSON.parse(scope.vehicles).filter(_data => {
            if (_data.vehiclebrandid == data.vbrand_id) {
              scope.dataVehicleModel.push({
                id: _data.vehiclemodelid,
                text: _data.vehiclemodel_name
              })
            }
            return null
          })
          scope.dataVehicleType = []
          JSON.parse(scope.vehicles).filter(_data => {
            if (_data.vehiclebrandid == data.vbrand_id && _data.vehiclemodelid == $.trim(data.vehicle_model_id)) {
              const i = scope.dataVehicleType.findIndex(x => x.text == _data.vehicletype)
              if (i <= -1) {
                scope.dataVehicleType.push({
                  id: _data.vehicletypeid,
                  text: _data.vehicletype
                })
              }
            }
            return null
          })
          if ($rootScope.url_lang == 'th') {
            scope.dataColor = JSON.parse(scope.colors).map(_data => ({
              id: _data.id,
              text: _data.color_th
            }))
          } else {
            scope.dataColor = JSON.parse(scope.colors).map(_data => ({
              id: _data.id,
              text: _data.color_en
            }))
          }
          scope.dataSimBrand = JSON.parse(scope.sims).map(_data => ({
            id: _data.id,
            text: _data.brand_sim
          }))

          $timeout(() => {
            scope.inputModemId = $.trim(data.modem_id)
            scope.inputGroupZone = $.trim(data.group_zone)
            scope.inputVehicleName = $.trim(data.vehiclename)
            scope.inputLicense = $.trim(data.carlicence)
            scope.inputSimNumber = $.trim(data.sim)
            scope.inputOverSpeed = $.trim(data.speedmax)
            scope.inputIdling = $.trim(data.idlestop)
            // scope.inputRateFule1 = $.trim(data.km_per_lite)
            // scope.inputFuelTank = $.trim(data.fueltank)
            scope.selectVehicleBrand = $.trim(data.vbrand_id)
            scope.selectVehiclesModel = $.trim(data.vehicle_model_id)
            scope.selectVehiclesType = $.trim(data.vtype_id)
            scope.selectColor = $.trim(data.vehicle_color_id)
            scope.selectSimBrand = $.trim(data.sim_brand)
            scope.inputCalibrateWorkTime = parseFloat((parseFloat(data.working_norun) + parseFloat(data.working_hour) + parseFloat(data.calibrate_work_time)) / 60).toFixed(2)
            scope.inputCalibrateBattery = parseFloat(parseFloat($iService.calBase(13, 17, 0, 100, data.batterry)) + parseFloat(data.calibrate_battery)).toFixed(2)
            scope.inputCalibrateMileage = parseFloat(parseFloat(data.mileage) + parseFloat(data.calibrate_mileage)).toFixed(3)
            scope.inputGroupZone = $.trim(data.group_zone)
            if (parseInt($.trim(data.has_card_reader)) == 0) {
              scope.inputStatusCardReader = $rootScope.text.modal_setting_vehicle.uninstall_card_reader
            } else {
              scope.inputStatusCardReader = $rootScope.text.modal_setting_vehicle.install_card_reader
            }
            if (parseInt($.trim(data.has_card_reader)) == 0) {
              scope.inputStatusSendDlt = $rootScope.text.modal_setting_vehicle.not_send_data_dlt
            } else {
              scope.inputStatusSendDlt = $rootScope.text.modal_setting_vehicle.send_data_dlt
            }
          })
          element.modal('toggle')
        }

        scope.sharedobj.toggleModal = () => {
          element.modal('toggle')
        }

        scope.confirm = () => {
          if (scope.confirmEdit) {
            scope.modalConfirm({
              data: {
                edit: scope.confirmEdit,
                modem_id: scope.inputModemId,
                vehiclename: scope.inputVehicleName,
                carlicence: scope.inputLicense,
                sim: scope.inputSimNumber,
                speedmax: scope.inputOverSpeed,
                idlestop: scope.inputIdling,
                // km_per_lite: scope.inputRateFule1,
                // fueltank: scope.inputFuelTank,
                vbrand_id: scope.selectVehicleBrand,
                vehicle_model_id: scope.selectVehiclesModel,
                vtype_id: scope.selectVehiclesType,
                vehicle_color_id: scope.selectColor,
                sim_brand: scope.selectSimBrand,
                calibrate_work_time: (scope.inputCompensateWorkTime * 60).toString(),
                calibrate_battery: scope.inputCompensateBattery,
                calibrate_mileage: scope.inputCompensateMileage,
                group_zone: scope.inputGroupZone
              }
            })
          }
        }

        scope.$watch('selectVehicleBrand', (newValue, oldValue) => {
          if (scope.vehicles) {
            if (newValue !== null && newValue !== undefined && newValue !== "" && newValue !== "0") {
              scope.dataVehicleModel = []
              JSON.parse(scope.vehicles).filter(data => {
                if (data.vehiclebrandid == newValue) {
                  const i = scope.dataVehicleModel.findIndex(x => x.text == data.vehiclemodel_name)
                  if (i <= -1) {
                    scope.dataVehicleModel.push({
                      id: data.vehiclemodelid,
                      text: data.vehiclemodel_name
                    })
                  }
                }
                return null
              })
              scope.dataVehicleType = []
              JSON.parse(scope.vehicles).filter(data => {
                if (data.vehiclebrandid == newValue && data.vehiclemodelid == $.trim(scope.selectVehiclesType)) {
                  const i = scope.dataVehicleType.findIndex(x => x.text == data.vehicletype)
                  if (i <= -1) {
                    scope.dataVehicleType.push({
                      id: data.vehicletypeid,
                      text: data.vehicletype
                    })
                  }
                }
                return null
              })
            }
          }
        })

        scope.$watch('selectVehiclesModel', (newValue, oldValue) => {
          if (scope.vehicles) {
            if (typeof newValue !== "undefined" && newValue != null && newValue != "" && newValue !== "0") {
              scope.dataVehicleType = []
              JSON.parse(scope.vehicles).filter(data => {
                if (data.vehiclebrandid == scope.selectVehicleBrand && data.vehiclemodelid == $.trim(newValue)) {
                  const i = scope.dataVehicleType.findIndex(x => x.text == data.vehicletype)
                  if (i <= -1) {
                    scope.dataVehicleType.push({
                      id: data.vehicletypeid,
                      text: data.vehicletype
                    })
                  }
                }
              })
            }
          }
        })

        scope.$watch('inputCalibrateWorkTime', (newValue, oldValue) => {
          if (newValue) {
            scope.inputCompensateWorkTime = (parseFloat(newValue) - ((parseFloat(scope.dataEdit.working_norun) + parseFloat(scope.dataEdit.working_hour)) / 60)).toFixed(2) || 0
          }
        })

        scope.$watch('inputCalibrateBattery', (newValue, oldValue) => {
          if (newValue) {
            const batterry = scope.dataEdit.batterry == null || scope.dataEdit.batterry <= 0 ? 0 : scope.dataEdit.batterry
            scope.inputCompensateBattery = (parseFloat(newValue) - parseFloat($iService.calBase(13, 17, 0, 100, batterry))).toFixed(2) || 0
          }
        })

        scope.$watch('inputCalibrateMileage', (newValue, oldValue) => {
          if (newValue) {
            scope.inputCompensateMileage = (parseFloat(newValue) - parseFloat(scope.dataEdit.mileage)).toFixed(3) || 0
          }
        })
      }
    }
  }
]).directive('tableSettingVehicle', ['$rootScope', '$compile', '$iService', '$window', '$timeout',
  ($rootScope, $compile, $iService, $window, $timeout) => {
    return {
      restrict: 'AC',
      scope: {
        data: '@',
        modalMileage: '&fnToggleModalMileage',
        modalRFID: '&fnToggleModalRFID',
        modalEdit: '&fnToggleModalEdit'
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
              title: $rootScope.text.page_setting_vehicle.table.sort,
              data: (data, type, full, meta) => (meta.row + 1),
              width: "30px",
              className: "text-right",
              responsivePriority: 1
            }, {
              title: $rootScope.text.page_setting_vehicle.table.box_no,
              data: data => data.modem_id,
              responsivePriority: 2
            }, {
              title: $rootScope.text.page_setting_vehicle.table.vehicle_name,
              data: data => data.vehiclename
            }, {
              title: $rootScope.text.page_setting_vehicle.table.license,
              data: data => data.carlicence
            }, {
              title: $rootScope.text.page_setting_vehicle.table.mileage,
              data: data => (parseFloat(data.mileage) + parseFloat(data.calibrate_mileage)).toFixed(3),
              className: "text-right"
            }, {
              title: $rootScope.text.page_setting_vehicle.table.work_time,
              data: data => ((parseFloat(data.working_norun) + parseFloat(data.working_hour) + parseFloat(data.calibrate_work_time)) / 60).toFixed(0),
              className: "text-right"
            }, {
              title: $rootScope.text.page_setting_vehicle.table.group_zone,
              data: data => data.group_zone || ''
            // }, {
            //   title: $rootScope.text.page_setting_vehicle.table.mileage,
            //   data: data => `<button class="btn btn-primary btn-circle btn-list" ng-click='mileage(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_setting_vehicle.mileage_tooltip}"><i class="fa fa-tachometer"></i></button>`,
            //   className: "text-center",
            //   responsivePriority: 2
            }, {
              title: $rootScope.text.page_setting_vehicle.table.rfid,
              data: data => `<button class="btn btn-info btn-circle btn-list" ng-click='rfid(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_setting_vehicle.rfid_tooltip}"><i class="fa fa-address-card-o"></i></button>`,
              className: "text-center",
              responsivePriority: 3
            }, {
              title: $rootScope.text.page_setting_vehicle.table.edit,
              data: data => `<button class="btn btn-warning btn-circle btn-list" ng-click='edit(${JSON.stringify(data)})' tooltip data-placement="top" data-title="${$rootScope.text.page_setting_vehicle.edit_tooltip}"><i class="fa fa-pencil-square-o"></i></button>`,
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
                  header: row => $rootScope.text.page_setting_vehicle.title
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
                  columns: [ 0, 1, 2, 3, 4, 5, 6 ]
                },
                title: $rootScope.text.page_setting_vehicle.table.export_title,
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-clipboard"> Copy to clipboard ')
                },
                className: 'btn btn-default btn-sm'
              }, {
                extend: 'excelHtml5',
                exportOptions: {
                  // columns: ':visible(:not(.not-export-col))'
                  columns: [ 0, 1, 2, 3, 4, 5, 6 ]
                },
                text: function(dt, button, config) {
                  return dt.i18n('buttons.print', '<i class="fa fa-file-text-o"></i> Export .xlsx')
                },
                title: $rootScope.text.page_setting_vehicle.table.export_title,
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

        scope.mileage = data => scope.modalMileage({ data: data })
        scope.rfid = data => scope.modalRFID({ data: data })
        scope.edit = data => scope.modalEdit({ data: data })
      }
    }
  }
])
