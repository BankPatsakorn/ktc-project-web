angular.module('tracking').factory('trackingRealtimeFactory', ['$rootScope', '$iService',
  ($rootScope, $iService) => {
    return {
      getTrackingRealtime: callback => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}tracking_realtime`, strJson, header, (res) => {
            if ($.trim(res) && res.hasOwnProperty('vehicle_tracking')) {
              callback(res.vehicle_tracking)
            } else {
              callback([])
            }
          })
        } else {
          $iService.clearToken()
        }
      },
      getGeom: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            swlat1: data.swlat1,
            swlng1: data.swlng1,
            nelat2: data.nelat2,
            nelon2: data.nelon2,
            zoom_level: data.zoom_level,
            all_id: data.all_id
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}get_geom`, strJson, header, (res) => {
            if ($.trim(res) && res.hasOwnProperty('features')) {
              callback(res)
            } else {
              callback({
                type: "FeatureCollection",
                features: []
              })
            }
          })
        } else {
          $iService.clearToken()
        }
      },
      addGeom: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            station_name: data.station_name,
            station_type: data.station_type,
            geom: data.geom
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}add_geom`, strJson, header, (res) => {
            if ($.trim(res) && res.hasOwnProperty('success')) {
              callback(res)
            } else {
              callback({
                success: false
              })
            }
          })
        } else {
          $iService.clearToken()
        }
      },
      setGeom: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            geom_data: data.geom_data
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}set_geom`, strJson, header, (res) => {
            if ($.trim(res) && res.hasOwnProperty('success')) {
              callback(res)
            } else {
              callback({
                success: false
              })
            }
          })
        } else {
          $iService.clearToken()
        }
      },
      delGeom: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            geom_data: data.geom_data
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}del_geom`, strJson, header, (res) => {
            if ($.trim(res) && res.hasOwnProperty('success')) {
              callback(res)
            } else {
              callback({
                success: false
              })
            }
          })
        } else {
          $iService.clearToken()
        }
      },
      setNote: (data, callback) => {
        if ($rootScope.authentication.token) {
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}set_note`, data, header, (res) => {
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
