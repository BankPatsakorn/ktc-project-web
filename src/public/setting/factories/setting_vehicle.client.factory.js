angular.module('setting').factory('settingVehicleFactory', ['$rootScope', '$iService',
  ($rootScope, $iService) => {
    return {
      getDataVehicle: (callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
						fleetname: $rootScope.authentication.fleetname
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}get_vehicle_info_forklift`, strJson, header, (res) => {
            if ($.trim(res)) {
              callback(res)
            } else {
              callback([])
            }
          })
        } else {
          $iService.clearToken()
        }
      },
      getDataMileage: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
						fleetname: $rootScope.authentication.fleetname,
            modem_id: data.modem_id
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.api()}gps/getMileageAlert`, strJson, header, (res) => {
            if ($.trim(res)) {
              callback(res)
            } else {
              callback([])
            }
          })
        } else {
          $iService.clearToken()
        }
      },
      editDataMileage: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            modem_id: data.modem_id,
            mileage_start: data.mileage_start,
            mileage_stop: data.mileage_stop,
            mileage_message_alert: data.mileage_message_alert
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.api()}gps/editMileageAlert`, strJson, header, (res) => {
            if ($.trim(res)) {
              callback(res)
            } else {
              callback([])
            }
          })
        } else {
          $iService.clearToken()
        }
      },
      editDataVehicle: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            modem_id: data.modem_id,
            vehiclename: data.vehiclename,
            carlicence: data.carlicence,
            sim: data.sim,
            speedmax: data.speedmax,
            idlestop: data.idlestop,
            // km_per_lite: data.km_per_lite,
            // fueltank: data.fueltank,
            vbrand_id: data.vbrand_id,
            vehicle_model_id: data.vehicle_model_id,
            vtype_id: data.vtype_id,
            vehicle_color_id: data.vehicle_color_id,
            sim_brand: data.sim_brand,
            calibrate_work_time: data.calibrate_work_time,
            calibrate_battery: data.calibrate_battery,
            calibrate_mileage: data.calibrate_mileage,
            group_zone: data.group_zone
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}set_vehicle_info_forklift`, strJson, header, (res) => {
            if ($.trim(res)) {
              callback(res)
            } else {
              callback([])
            }
          })
        } else {
          $iService.clearToken()
        }
      },
      getDataRFIDModemID: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            modem_id: data.modem_id,
            datetime: data.datetime
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.api()}nissanForklift/getDataRFIDModemID`, strJson, header, (res) => {
            if ($.trim(res)) {
              callback(res)
            } else {
              callback([])
            }
          })
        } else {
          $iService.clearToken()
        }
      },
      getRFIDStatusUpdate: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            modem_id: data.modem_id
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.api()}nissanForklift/getRFIDStatusUpdate`, strJson, header, (res) => {
            if ($.trim(res)) {
              callback(res)
            } else {
              callback([])
            }
          })
        } else {
          $iService.clearToken()
        }
      },
      editRFIDTagCode: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            modem_id: data.modem_id,
            rfid_tag_code: data.rfid
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.api()}nissanForklift/editRFIDTagCode`, strJson, header, (res) => {
            if ($.trim(res)) {
              callback(res)
            } else {
              callback([])
            }
          })
        } else {
          $iService.clearToken()
        }
      }
    }
  }
])
