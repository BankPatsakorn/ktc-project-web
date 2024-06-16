angular.module('graph').factory('graphEfficientFactory', ['$rootScope', '$iService',
  ($rootScope, $iService) => {
    return {
      getDataGraphEfficient: (data, callback) => {
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
          $iService.postByHeader(`${$iService.url()}new_utilization_vehicle`, strJson, header, (res) => {
          // $iService.postByHeader(`${$iService.url()}chart_utilization_vehicle_by_month`, strJson, header, (res) => {
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
