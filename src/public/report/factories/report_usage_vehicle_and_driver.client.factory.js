angular.module('report').factory('reportUsageVehicleAndDriverFactory', ['$rootScope', '$iService',
  ($rootScope, $iService) => {
    return {
      getDataReportSingle: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            modemid: data.modemid,
            is_all: false,
            start: data.start,
            stop: data.stop
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}rp_usage_vehicle_and_driver`, strJson, header, (res) => {
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
      getDataReportAll: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            is_all: true,
            start: data.start,
            stop: data.stop
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}rp_usage_vehicle_and_driver`, strJson, header, (res) => {
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
