angular.module('setting').factory('settingDriverFactory', ['$rootScope', '$iService',
  ($rootScope, $iService) => {
    return {
      getDataRFID: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            datetime: data.datetime
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.api()}nissanForklift/getDataRFID`, strJson, header, (res) => {
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
      getDataDriver: (callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.api()}nissanForklift/getDataDriver`, strJson, header, (res) => {
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
      addDataDriver: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
						code: data.code,
						name: data.name,
						department: data.department,
            email: data.email,
            phone: data.phone,
            image: data.image
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.api()}nissanForklift/addDataDriver`, strJson, header, (res) => {
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
      editDataDriver: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
						id: data.id,
						code: data.code,
						name: data.name,
						department: data.department,
            email: data.email,
            phone: data.phone,
            image: data.image
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.api()}nissanForklift/editDataDriver`, strJson, header, (res) => {
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
      editDataDriverRFID: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
						id: data.id,
						rfid: data.rfid
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.api()}nissanForklift/editDataDriverRFID`, strJson, header, (res) => {
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
      deleteDataDriver: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
						id: data.id
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.api()}nissanForklift/deleteDataDriver`, strJson, header, (res) => {
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
