angular.module('dashboard').factory('dashboardFactory', ['$rootScope', '$iService',
  ($rootScope, $iService) => {
    return {
      getDataForklift: (callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}tracking_realtime_forklift`, strJson, header, (res) => {
            if ($.trim(res) && res.hasOwnProperty('vehicle_tracking')) {
              callback(res.vehicle_tracking)
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
