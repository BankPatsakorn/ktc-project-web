angular.module('dashboard').controller('DashboardController', ['$rootScope', '$scope', '$timeout', '$interval', '$compile', '$location', '$window', '$sce', '$iService', 'dashboardFactory', 'trackingRealtimeFactory', 'settingVehicleFactory', 'indexFactory',
  ($rootScope, $scope, $timeout, $interval, $compile, $location, $window, $sce, $iService, dashboardFactory, trackingRealtimeFactory, settingVehicleFactory, indexFactory) => {

  	$scope.$iService = $iService
  	const url_path = $location.path().split('/')
    $scope.modem_id = url_path[3]
    $scope.dataSettingVehicle = []
    $scope.dataVehicles = []
    $scope.dataForklift = {}
    $scope.dataTrackingRealtime = []

    $scope.markerTracking = []

    let stopInterval = undefined

  	const markers = new L.LayerGroup()

    const osm = $iService.layerOsm(), esri = $iService.layerEsri()

    const map = L.map('map-forklift', {
      center: $iService.centerMap(),
      zoom: $iService.zoomMap(),
      layers: [osm, markers],
      fullscreenControl: true,
      editable: false
    })

    const baseLayers = {
      OpenStreetMap: osm,
      Esri: esri
    }

    const overlays = {
      Marker: markers
    }

    L.control.layers(baseLayers, overlays).addTo(map)

    map.on('baselayerchange', e => {
      const zoom_level = map.getZoom()
      if(e.name == 'Esri') {
        if(zoom_level > 17) {
          map.options.maxZoom = 17
          map.setZoom(17)
        } else {
          map.options.maxZoom = 17
          map.setZoom(zoom_level)
        }
      } else {
        map.options.maxZoom = 18
        map.setZoom(zoom_level)
      }
    })

    $scope.$on("$destroy", function() {
      if (angular.isDefined(stopInterval)) {
        $interval.cancel(stopInterval)
        stopInterval = undefined
      }
    })

    settingVehicleFactory.getDataVehicle(res => {
      if (res.length > 0) {
        $scope.dataSettingVehicle = res
      }
    })

    indexFactory.getDataDetailVehicle(res => {
      if (res.length > 0) {
        $scope.dataVehicles = res
      }
    })

    dashboardFactory.getDataForklift(res => {
      if (res.length > 0) {
        $scope.dataTrackingRealtime = res.filter(data => {
          if ($scope.modem_id === data.modem_id) {
            let _overtime, _diff = $iService.diffDuration(data.gps_datetime)
            if (_diff.days >= 1 || _diff.months > 0 || _diff.years > 0) {
              _overtime = {
                status_overtime: true,
                status_overtime_text: $rootScope.text.page_dashboard.gps_not_update
              }
            } else {
              _overtime = {
                status_overtime: false,
                status_overtime_text: ''
              }
            }
            const _icon = L.icon({
              iconUrl: `${$iService.host()}static/assets/img/icon/vehicle/v${data.status_angle}.png`,
              iconSize: [28, 28],
              iconAnchor: [12, 12],
              popupAnchor: [3, -5]
            })
            const e = angular.element($iService.setTemplatePopupTrackingRealtime(data))
            $compile(e)($scope.$new(), (element, scope) => {
              $scope.markerTracking.push(L.Marker.movingMarker([
                  [parseFloat(data.lat), parseFloat(data.lon)]
                ], [], { modem_id: data.modem_id, icon: _icon })
                .bindPopup(element[0])
                .bindTooltip(data.vehicle_name, { direction: 'auto', permanent: true, className: 'label-vehicle' })
                .on('click', function () {
                  $scope.followVehicle(data)
                })
                .on('start', function(e) {
                  if ($scope.followModemId == data.modem_id) {
                    $scope.setMoving = true
                    $scope.setIntervalMoving(data)
                  }
                })
                .on('end', function(e) {
                  if ($scope.followModemId == data.modem_id) {
                    $scope.setMoving = false
                    if (angular.isDefined($scope.movingTimer)) {
                      $interval.cancel($scope.movingTimer)
                    }
                    map.setZoom(18)
                    map.invalidateSize()
                    map.panTo([parseFloat(e.target._latlng.lat), parseFloat(e.target._latlng.lng)])
                  }
                })
                .addTo(markers))
            })
            if ($scope.modem_id === data.modem_id) {
              map.setZoom(16)
              $timeout(() => {
                map.panTo([parseFloat(data.lat), parseFloat(data.lon)])
                map.invalidateSize()
                map.setZoom(17)
              }, 1000)
            }
            return Object.assign(data, data, {
              ...data,
              ..._overtime,
              status_text: $iService.statusTextTracking(data.status)
            })
          }
        })
        $scope.dataForklift = $scope.dataTrackingRealtime[0]
      }
    })

    $scope.setDataForklift = () => {
      if ($scope.dataTrackingRealtime.length > 0 && $scope.dataSettingVehicle.length > 0 && $scope.dataVehicles.length > 0) {
        const vehicle_model_id = $scope.dataVehicles.map(_data => parseInt(_data.vehiclemodelid.trim()))
        const modem_id = $scope.dataSettingVehicle.map(_data => _data.modem_id)
        const _index = modem_id.indexOf($scope.dataForklift.modem_id)
        if (_index != -1) {
          const __index = vehicle_model_id.indexOf(parseInt($scope.dataSettingVehicle[_index].vehicle_model_id.trim()))
          if (__index != -1) {
            Object.assign($scope.dataForklift, $scope.dataForklift, {
              ...$scope.dataForklift,
              setting: $scope.dataSettingVehicle[_index],
              vehicle_detail: $scope.dataVehicles[__index]
            })
          } else {
            Object.assign($scope.dataForklift, $scope.dataForklift, {
              ...$scope.dataForklift,
              setting: $scope.dataSettingVehicle[_index],
              vehicle_detail: {}
            })
          }
        } else {
          Object.assign($scope.dataForklift, $scope.dataForklift, {
            ...$scope.dataForklift,
            setting: {},
            vehicle_detail: {}
          })
        }
      }
    }

    $scope.$watch('dataSettingVehicle', (newValue, oldValue) => {
      if (typeof newValue !== "undefined" && newValue != null && newValue != "" && newValue !== "0") {
        $scope.setDataForklift()
      }
    })

    $scope.$watch('dataForklift', (newValue, oldValue) => {
      if (typeof newValue !== "undefined" && newValue != null && newValue != "" && newValue !== "0") {
        $scope.setDataForklift()
      }
    })

    $scope.$watch('dataVehicles', (newValue, oldValue) => {
      if (typeof newValue !== "undefined" && newValue != null && newValue != "" && newValue !== "0") {
        $scope.setDataForklift()
      }
    })

    $scope.sendNote = (note, modem_id) => {
      if (note.hasOwnProperty('message')) {
        if (typeof note.message !== "undefined" && note.message != null && note.message != "") {
          const _data = {
            modem_id: modem_id,
            message: note.message
          }

          trackingRealtimeFactory.setNote(_data, res => {
            if (res.success) {
              note.message = ""
              $iService.toggleModalMessage({
                title: $rootScope.text.page_dashboard.alert_title_success,
                detail: $rootScope.text.page_dashboard.alert_detail_success
              })
            } else {
              $iService.toggleModalMessage({
                title: $rootScope.text.page_dashboard.alert_title_error,
                detail: $rootScope.text.page_dashboard.alert_detail_error
              })
            }
          })
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.page_dashboard.alert_title_warning,
            detail: $rootScope.text.page_dashboard.alert_detail_blank
          })
        }
      }
    }

    $scope.unfollowVehicle = () => {
      $scope.followModemId = null
      if (angular.isDefined($scope.movingTimer)) {
        $interval.cancel($scope.movingTimer)
      }
      $scope.dataTrackingRealtime.map((data, index) => {
        $scope.markerTracking[index].closePopup()
        $scope.markerTracking[index].openTooltip()
        $scope.markerTracking[index].setOpacity(1)
      })
    }
    
    $scope.setIntervalMoving = (data) => {
      if (angular.isDefined($scope.movingTimer)) {
        $interval.cancel($scope.movingTimer)
      }
      const _arr = $scope.dataTrackingRealtime.map((data) => (data.modem_id))
      const _index = _arr.indexOf(data.modem_id)
      if ($scope.setMoving) {
        $scope.movingTimer = $interval(() => {
          const _latlng = $scope.markerTracking[_index].getLatLng()
          map.panTo([parseFloat(_latlng.lat), parseFloat(_latlng.lng)])
        }, 100)
      } else {
        $timeout(() => {
          const _latlng = $scope.markerTracking[_index].getLatLng()
          map.panTo([parseFloat(_latlng.lat), parseFloat(_latlng.lng)])
        }, 100)
      }
    }

    $scope.followVehicle = (data) => {
      if (angular.isDefined($scope.movingTimer)) {
        $interval.cancel($scope.movingTimer)
      }
      $scope.followModemId = data.modem_id
      const _arr = $scope.dataTrackingRealtime.map((data, index) => {
        $scope.markerTracking[index].closePopup()
        $scope.markerTracking[index].closeTooltip()
        $scope.markerTracking[index].setOpacity(0)
        return data.modem_id
      })
      const _index = _arr.indexOf(data.modem_id)
      map.panTo([parseFloat(data.lat), parseFloat(data.lon)])
      map.setZoom(18)
      map.invalidateSize()
      $scope.markerTracking[_index].openPopup()
      $scope.markerTracking[_index].openTooltip()
      $scope.markerTracking[_index].setOpacity(1)
      $scope.setIntervalMoving(data)
    }

    $scope.updateData = (data, _index) => {
      let _check_repeat = true
      if ($scope.dataTrackingRealtime[_index]['gps_datetime'] != data.gps_datetime) {
        _check_repeat = false
      }
      if (!_check_repeat) {
        let _check_position = false
        if ($scope.dataTrackingRealtime[_index]['lat'] != data.lat && $scope.dataTrackingRealtime[_index]['lon'] != data.lon) {
          _check_position = true
        }
        
        let _check_status = false
        if (parseInt($scope.dataTrackingRealtime[_index]['status']) != parseInt(data.status)) {
          _check_status = true
        }

        const _latlon = {
          last_lat: $scope.dataTrackingRealtime[_index]['lat'], 
          last_lon: $scope.dataTrackingRealtime[_index]['lon'],
          now_lat: data.lat,
          now_lon: data.lon
        }

        Object.entries(data).forEach(([key, value]) => {
          if ($scope.dataTrackingRealtime[_index].hasOwnProperty(key)) {
            $scope.dataTrackingRealtime[_index][key] = data[key]
            if (key === 'gps_datetime') {
              const _diff = $iService.diffDuration(data[key])
              if (_diff.days >= 1 || _diff.months > 0 || _diff.years > 0) {
                $scope.dataTrackingRealtime[_index]['status_overtime'] = true
                $scope.dataTrackingRealtime[_index]['status_overtime_text'] = $rootScope.text.page_dashboard.gps_not_update
              } else {
                $scope.dataTrackingRealtime[_index]['status_overtime'] = false
                $scope.dataTrackingRealtime[_index]['status_overtime_text'] = ''
              }
            }
          } else {
            // console.log(`[${_index}] Not key => ${key}`, data[key])
          }
          if ($scope.dataForklift.hasOwnProperty(key)) {
            $scope.dataForklift[key] = data[key]
            if (key === 'gps_datetime') {
              const _diff = $iService.diffDuration(data[key])
              if (_diff.days >= 1 || _diff.months > 0 || _diff.years > 0) {
                $scope.dataForklift['status_overtime'] = true
                $scope.dataForklift['status_overtime_text'] = $rootScope.text.page_dashboard.gps_not_update
              } else {
                $scope.dataForklift['status_overtime'] = false
                $scope.dataForklift['status_overtime_text'] = ''
              }
            }
          } else {
            // console.log(`[${_index}] Not key => ${key}`, data[key])
          }
        })
        $scope.$apply()

        if (_check_position) {
          const _icon = L.icon({
            iconUrl: `${$iService.host()}static/assets/img/icon/vehicle/v${data.status}_${$iService.calIconDirection($iService.calAngle(_latlon))}.png`,
            iconSize: [28, 28],
            iconAnchor: [12, 12],
            popupAnchor: [3, -5]
          })
  
          const e = angular.element($iService.setTemplatePopupTrackingRealtime($scope.dataTrackingRealtime[_index]))
          $compile(e)($scope.$new(), function(element, scope) {
            $scope.markerTracking[_index].setIcon(_icon)
            $scope.markerTracking[_index]._popup.setContent(element[0])
            $scope.markerTracking[_index].moveTo(new L.LatLng(parseFloat(data.lat), parseFloat(data.lon)), 15000)
          })
        } else {
          const e = angular.element($iService.setTemplatePopupTrackingRealtime($scope.dataTrackingRealtime[_index]))
          if (_check_status) {
            const _icon = L.icon({
              iconUrl: `${$iService.host()}static/assets/img/icon/vehicle/v${data.status}_${$iService.calIconDirection($iService.calAngle(_latlon))}.png`,
              iconSize: [28, 28],
              iconAnchor: [12, 12],
              popupAnchor: [3, -5]
            })
            $compile(e)($scope.$new(), function(element, scope) {
              $scope.markerTracking[_index].setIcon(_icon)
              $scope.markerTracking[_index]._popup.setContent(element[0])
            })
          } else {
            $compile(e)($scope.$new(), function(element, scope) {
              $scope.markerTracking[_index]._popup.setContent(element[0])
            })
          }
        }
      }
    }

    $scope.$on('broadcastUpdateTrackingRealtime', (event, data) => {
      if ($scope.modem_id === data.modem_id) {
        const _arr = $scope.dataTrackingRealtime.map(data => (data.modem_id))
        const _index = _arr.indexOf(data.modem_id)
        if (_index != -1) {
          $scope.updateData(data, _index)
        }
      }
    })

    $scope.$on('broadcastUpdateRFID', (event, data) => {
      if ($scope.modem_id === data.modem_id) {
        const _arr = $scope.dataTrackingRealtime.map(_data => (_data.modem_id))
        const _index = _arr.indexOf(data.modem_id)
        if (_index != -1) {
          $scope.updateData(data, _index)
        }
      }
    })

    $scope.back = () => {
      $window.history.back()
    }
  }
])
