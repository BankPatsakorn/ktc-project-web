angular.module('camera').factory('cameraSnapshotFactory', ['$rootScope', '$iService',
  ($rootScope, $iService) => {
    return {
      getListPicture: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            modem_id: data.modem_id,
            start: data.start,
            stop: data.stop
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.host_picture()}list_picture_db`, strJson, header, (res) => {
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
      getPicture: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            modem_id: data.modem_id,
            name_img: data.name_img
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.host_picture()}get_picture_db`, strJson, header, (res) => {
            if ($.trim(res)) {
              callback(res)
            } else {
              callback(null)
            }
          })
        } else {
          $iService.clearToken()
        }
      }
    }
  }
])
