angular.module('report').factory('reportSlidingCardFactory', ['$rootScope', '$iService',
  ($rootScope, $iService) => {
    return {
      getDataReportSingle: (data, callback) => {
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
          $iService.postByHeader(`${$iService.url()}report_get_driver_slashcard`, strJson, header, (res) => {
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
      getDataReportGroup: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            year_month: data.year_month
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}report_get_driver_slashcard_group`, strJson, header, (res) => {
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
      getDataReportDriver: (data, callback) => {
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
          $iService.postByHeader(`${$iService.url()}report_driver_driving_trip`, strJson, header, (res) => {
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
