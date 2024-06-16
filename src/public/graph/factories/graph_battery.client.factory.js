angular.module('graph').factory('graphBatteryFactory', ['$rootScope', '$iService',
  ($rootScope, $iService) => {
    return {
      getDataGraphBattery: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            modemid: data.modemid,
            start: data.start,
            stop: data.stop
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}chart_percent_battery_forklift`, strJson, header, (res) => {
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
