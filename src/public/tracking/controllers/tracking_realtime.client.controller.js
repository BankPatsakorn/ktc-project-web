angular.module('tracking').controller('TrackingRealtimeController', ['$rootScope', '$scope', '$timeout', '$interval', '$compile', '$iService', 'trackingRealtimeFactory', 'dashboardFactory',
  ($rootScope, $scope, $timeout, $interval, $compile, $iService, trackingRealtimeFactory, dashboardFactory) => {

    var intervalId = setInterval(GetDataForklift, 300000);
    GetDataForklift();

    $scope.$iService = $iService
    $scope.dataTrackingRealtime = []
    console.log($scope);

    $scope.createStation = false
    $scope.updateStation = false

    $scope.drawAction = false
    $scope.drawTemp = null
    $scope.drawLayer = null
    $scope.drawType = null

    $scope.xLayer = []
    $scope.markerTracking = []
    $scope.isLoadStation = false

    const markers = new L.LayerGroup()
    const editableLayers = $iService.editableLayers()

    const osm = $iService.layerOsm(), esri = $iService.layerEsri()

    const map = L.map('map-realtime', {
      center: $iService.centerMap(),
      zoom: $iService.zoomMap(),
      layers: [osm, markers, editableLayers],
      fullscreenControl: true,
      editable: $rootScope.authentication.role == 'admin' ? true : false
    })

    const baseLayers = {
      OpenStreetMap: osm,
      Esri: esri
    }

    const overlays = {
      Marker: markers,
      Station: editableLayers
    }

    L.control.layers(baseLayers, overlays).addTo(map)

    const drawControl = new L.Control.Draw($iService.drawOptions())
    if ($rootScope.authentication.role == 'admin') {
      map.addControl(drawControl)
    }

    map.on('movestart', e => {
      map.invalidateSize()
    })

    map.on('moveend', e => {
      $scope.checkZoomPlotStation()
      map.invalidateSize()
    })

    map.on('baselayerchange', e => {
      const zoom_level = map.getZoom()
      if (e.name == 'Esri') {
        if (zoom_level > 17) {
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

    map.on('draw:drawstart', e => {
      $scope.drawAction = true
    })

    map.on('draw:drawstop', e => {

    })

    map.on('draw:created', e => {
      $scope.createStation = true
      $scope.stationName = ""
      $scope.selectStationType = "0"
      $scope.$applyAsync()
      let layer = null
      if (e.layerType == 'circle') {
        $scope.drawType = 'circle'
        layer = e.layer
        // layer.bindPopup('A popup circle' + layer._mRadius)

        const holderLayer = L.geoJson(layer.toGeoJSON())
        const actualLayer = holderLayer._layers[Object.keys(holderLayer._layers)[0]]
        const xradis = layer.getRadius()

        actualLayer.feature.properties["radius"] = xradis
        const _feature = actualLayer.feature
        layer["feature"] = _feature
        $scope.drawLayer = layer
      }
      if (e.layerType == 'polygon') {
        $scope.drawType = 'polygon'
        layer = e.layer
        // layer.bindPopup('A popup polygon' + e.layer._leaflet_id)

        const holderLayer = L.geoJson(layer.toGeoJSON())
        const actualLayer = holderLayer._layers[Object.keys(holderLayer._layers)[0]]
        $scope.drawLayer = actualLayer
      }
      if (e.layerType == 'rectangle') {
        $scope.drawType = 'rectangle'
        layer = e.layer
        // layer.bindPopup('A popup rectangle' + e.layer._leaflet_id)

        const holderLayer = L.geoJson(layer.toGeoJSON())
        const actualLayer = holderLayer._layers[Object.keys(holderLayer._layers)[0]]
        $scope.drawLayer = actualLayer
      }
      if (e.layerType == 'marker') {
        $scope.drawType = 'marker'
        layer = e.layer
        // layer.bindPopup('A popup marker' + e.layer._leaflet_id)

        const xradis = 200
        const _circle = L.circle([layer._latlng.lat, layer._latlng.lng], {
          color: '#FFCC00',
          fillColor: null,
          fillOpacity: 0.2,
          opacity: 0.5,
          radius: xradis,
          stroke: true,
          weight: 4
        })

        const holderLayer = L.geoJson(_circle.toGeoJSON())
        const actualLayer = holderLayer._layers[Object.keys(holderLayer._layers)[0]]

        actualLayer.feature.properties["radius"] = xradis
        const _feature = actualLayer.feature
        _circle["feature"] = _feature
        $scope.drawLayer = _circle
      }
      editableLayers.addLayer($scope.drawLayer)
    })

    map.on('draw:editstart', e => {
      $scope.drawAction = true
    })

    map.on('draw:editmove', e => {

    })

    map.on('draw:editresize', e => {

    })

    map.on('draw:editvertex', e => {

    })

    map.on('draw:editstop', e => {
      $scope.drawAction = false
      if ($scope.xLayer.length > 0) {
        const _data = {
          geom_data: $scope.xLayer
        }
        trackingRealtimeFactory.setGeom(_data, res => {
          if (res.success) {
            const _id = $scope.drawTemp.features.map(data => (data.station_id))
            $scope.xLayer.map((data) => {
              const _layers = JSON.parse(data)
              if (_id.length > 0) {
                const _index = _id.indexOf(_layers.features[0].station_id)
                if (_index != -1) {
                  $scope.drawTemp.features[_index] = _layers.features[0]
                }
              }
            })
            $scope.xLayer = []
            $iService.toggleModalMessage({
              title: $rootScope.text.page_tracking_realtime.alert_title_success,
              detail: $rootScope.text.page_tracking_realtime.alert_detail_success
            })
          } else {
            $iService.toggleModalMessage({
              title: $rootScope.text.page_tracking_realtime.alert_title_error,
              detail: $rootScope.text.page_tracking_realtime.alert_detail_error
            })
          }
        })
      }
    })

    map.on('draw:edited', e => {
      const layers = e.layers
      layers.eachLayer(layer => {
        $scope.setLayer(layer)
      })
    })

    map.on('draw:deletestart', e => {
      $scope.drawAction = true
    })

    map.on('draw:deletestop', e => {
      $scope.drawAction = false
    })

    map.on('draw:deleted', e => {
      $scope.xLayer = []
      let layers = e.layers
      layers.eachLayer(layer => {
        $scope.setLayer(layer)
      })
      if ($scope.xLayer.length > 0) {
        const _data = {
          geom_data: $scope.xLayer
        }
        trackingRealtimeFactory.delGeom(_data, res => {
          if (res.success) {
            const _id = $scope.drawTemp.features.map(data => (data.station_id))
            $scope.xLayer.map(data => {
              const _layers = JSON.parse(data)
              if (_id.length > 0) {
                const _index = _id.indexOf(_layers.features[0].station_id)
                $scope.drawTemp.features.splice(_index, 1)
              }
            })
            $scope.$broadcast('broadcastUpdateListGeom', {})
            $iService.toggleModalMessage({
              title: $rootScope.text.page_tracking_realtime.alert_title_success,
              detail: $rootScope.text.page_tracking_realtime.alert_detail_success
            })
          } else {
            $iService.toggleModalMessage({
              title: $rootScope.text.page_tracking_realtime.alert_title_error,
              detail: $rootScope.text.page_tracking_realtime.alert_detail_error
            })
          }
        })
      }
    })

    $timeout(() => {
      map.panTo($iService.centerMap())
      map.invalidateSize()
      map.setZoom($iService.zoomMap())
    }, 1000)

    $scope.$watch('dataPosition', (newValue, oldValue) => {
      if (typeof newValue !== "undefined" && newValue != null && newValue != "") {
        $scope.drawStation(newValue)
      }
    })



    function GetDataForklift() {
      console.log("start fuction GetDataForklift");

      // trackingRealtimeFactory.getTrackingRealtime(res => {
      dashboardFactory.getDataForklift(res => {
        if (res.length > 0) {
          function compare(a, b) {
            if (a.vehicle_name < b.vehicle_name) {
              return -1
            }
            if (a.vehicle_name > b.vehicle_name) {
              return 1
            }
            return 0
          }
          res.sort(compare)
          $scope.dataTrackingRealtime = res.map(data => {
            let _overtime, _diff = $iService.diffDuration(data.gps_datetime)
            if (_diff.days >= 1 || _diff.months > 0 || _diff.years > 0) {
              _overtime = {
                status_overtime: true,
                status_overtime_text: $rootScope.text.page_tracking_realtime.gps_not_update
              }
            } else {
              _overtime = {
                status_overtime: false,
                status_overtime_text: ''
              }
            }
            let _icon = L.icon({
              iconUrl: `${$iService.host()}static/assets/img/icon/vehicle/v${data.status_angle}.png`,
              iconSize: [28, 28],
              iconAnchor: [12, 12],
              popupAnchor: [3, -5]
            })
            const e = angular.element($iService.setTemplatePopupTrackingRealtime(data))
            $compile(e)($scope.$new(), (element, scope) => {
              $scope.markerTracking.push(L.Marker.movingMarker([
                [parseFloat(data.lat), parseFloat(data.lon)]
              ], [], { modem_id: data.modem_id, icon: _icon, status: data.status })
                .bindPopup(element[0])
                // .bindLabel(data.vehicle_name, { noHide: true, direction: 'auto' })
                .bindTooltip(data.vehicle_name, { direction: 'auto', permanent: true, className: 'label-vehicle' })
                .on('click', function () {
                  $scope.followVehicle(data)
                })
                .on('start', function (e) {
                  if ($scope.followModemId == data.modem_id) {
                    $scope.setMoving = true
                    $scope.setIntervalMoving(data)
                  }
                })
                .on('end', function (e) {
                  if ($scope.followModemId == data.modem_id) {
                    $scope.setMoving = false
                    if (angular.isDefined($scope.movingTimer)) {
                      $interval.cancel($scope.movingTimer)
                    }
                    // map.setZoom(18)
                    map.invalidateSize()
                    map.panTo([parseFloat(e.target._latlng.lat), parseFloat(e.target._latlng.lng)])
                  }
                  const _arr = $scope.dataTrackingRealtime.map((data, index) => (data.modem_id))
                  const _index = _arr.indexOf(data.modem_id)
                  if (parseInt($scope.dataTrackingRealtime[_index]['status']) != parseInt($scope.dataTrackingRealtime[_index]['new_status'])) {
                    $scope.dataTrackingRealtime[_index]['status'] = $scope.dataTrackingRealtime[_index]['new_status']
                    $scope.dataTrackingRealtime[_index]['status_text'] = $scope.dataTrackingRealtime[_index]['new_status_text']
                    $scope.$apply()
                    _icon = L.icon({
                      iconUrl: `${$iService.host()}static/assets/img/icon/vehicle/v${$scope.dataTrackingRealtime[_index].status_angle}.png`,
                      iconSize: [28, 28],
                      iconAnchor: [12, 12],
                      popupAnchor: [3, -5]
                    })
                    $scope.markerTracking[_index].setIcon(_icon)
                    const e = angular.element($iService.setTemplatePopupTrackingRealtime($scope.dataTrackingRealtime[_index]))
                    $compile(e)($scope.$new(), function (element, scope) {
                      $scope.markerTracking[_index]._popup.setContent(element[0])
                    })
                  } else {
                    const e = angular.element($iService.setTemplatePopupTrackingRealtime($scope.dataTrackingRealtime[_index]))
                    $compile(e)($scope.$new(), function (element, scope) {
                      $scope.markerTracking[_index]._popup.setContent(element[0])
                    })
                  }
                })
                .addTo(markers))
            })
            return {
              ...data,
              ..._overtime,
              status_text: $iService.statusTextTracking(data.status)
            }
          })
        }
      })

    }

    function onEachFeatureGeom(feature, layer) {
      const _popup = $iService.setTemplatePopupGeom({
        station_id: feature.station_id,
        station_name: feature.station_name,
        station_type: feature.station_type
      }, true)
      const e = angular.element(_popup)
      $compile(e)($scope.$new(), (element, scope) => {
        layer.bindPopup(element[0]).bindTooltip(feature.station_name, { direction: 'center', permanent: true, className: 'label-geom' })
        editableLayers.addLayer(layer)
      })
    }

    $scope.checkZoomPlotStation = () => {
      if (!$scope.drawAction) {
        if (map.getZoom() >= 9 && $scope.isLoadStation == false) {
          if (drawControl != null) {
            $scope.clearStation()
          }
          $scope.plotStationCustomer()
          $scope.isLoadStation = true
        } else if (map.getZoom() < 9 && $scope.isLoadStation == true) {
          if (drawControl != null) {
            $scope.clearStation()
            $scope.isLoadStation = false
          }
        }
      }
    }

    $scope.drawStation = (value) => {
      if (value.indexOf(',') != -1) {
        const arr_value = value.split(',')
        const lat = arr_value[0].trim()
        const lon = arr_value[1].trim()
        if ($iService.checkDecimal(lat) && $iService.checkDecimal(lon)) {
          map.panTo([parseFloat(lat), parseFloat(lon)])
          $timeout(() => {
            map.setZoom(16)
            map.invalidateSize()

            $scope.createStation = true
            $scope.stationName = ""
            $scope.selectStationType = "0"
            $scope.$applyAsync()
            $scope.drawType = 'marker'

            const xradis = 200
            const _circle = L.circle([lat, lon], {
              color: '#FFCC00',
              fillColor: null,
              fillOpacity: 0.2,
              opacity: 0.5,
              radius: xradis,
              stroke: true,
              weight: 4
            })

            const holderLayer = L.geoJson(_circle.toGeoJSON())
            const actualLayer = holderLayer._layers[Object.keys(holderLayer._layers)[0]]

            actualLayer.feature.properties["radius"] = xradis
            const _feature = actualLayer.feature
            _circle["feature"] = _feature
            $scope.drawLayer = _circle
            editableLayers.addLayer($scope.drawLayer)
          }, 500)
        }
      }
    }

    $scope.plotStationCustomer = () => {
      let _id = []
      if ($scope.drawTemp != null) {
        _id = $scope.drawTemp.features.map(data => {
          return data.station_id
        })
      }
      const bounds = map.getBounds()
      const _data = {
        swlat1: bounds.getSouthWest().lat,
        swlng1: bounds.getSouthWest().lng,
        nelat2: bounds.getNorthEast().lat,
        nelon2: bounds.getNorthEast().lng,
        zoom_level: map.getZoom(),
        all_id: _id.toString(',')
      }
      trackingRealtimeFactory.getGeom(_data, res => {
        if (res.features.length > 0) {
          $scope.drawTemp = res
          L.geoJson(res, {
            onEachFeature: onEachFeatureGeom,
            pointToLayer: (feature, latlng) => {
              return L.circle(latlng, feature.properties.radius)
            },
            style: feature => {
              switch (parseInt(feature.station_type)) {
                case 1:
                  return { color: "blue", weight: 2, opacity: 0.6, fillOpacity: 0.5 }
                case 2:
                  return { color: "green", weight: 2, opacity: 0.6, fillOpacity: 0.5 }
                case 3:
                  return { color: "red", weight: 2, opacity: 0.6, fillOpacity: 0.5 }
              }
            }
          })
        }
      })
    }

    $scope.clearStation = () => {
      $scope.xLayer = []
      editableLayers.clearLayers()
    }

    $scope.updateInfoGeom = (id, name, type) => {
      if (!$scope.createStation) {
        $scope.stationId = id
        $scope.stationName = name
        $scope.selectStationType = type
        $scope.updateStation = !$scope.updateStation
      }
    }

    $scope.confirmStation = () => {
      if ($scope.stationName !== "" && $scope.stationName !== null &&
        $scope.selectStationType !== "" && $scope.selectStationType !== null && $scope.selectStationType !== "0") {
        if ($scope.createStation) {
          $scope.setLayer($scope.drawLayer)
          const _data = {
            station_name: $scope.stationName,
            station_type: $scope.selectStationType,
            geom: $scope.xLayer
          }
          trackingRealtimeFactory.addGeom(_data, res => {
            if (res.success) {
              $scope.createStation = false
              const arr_key = Object.keys(editableLayers._layers)
              const _size = arr_key.length
              const _key = arr_key[_size - 1]
              if ($scope.selectStationType == 1) {
                const _options = { color: "blue", weight: 2, opacity: 0.6, fillOpacity: 0.5 }
                editableLayers._layers[_key].setStyle(_options)
              } else if ($scope.selectStationType == 2) {
                const _options = { color: "green", weight: 2, opacity: 0.6, fillOpacity: 0.5 }
                editableLayers._layers[_key].setStyle(_options)
              } else if ($scope.selectStationType == 3) {
                const _options = { color: "red", weight: 2, opacity: 0.6, fillOpacity: 0.5 }
                editableLayers._layers[_key].setStyle(_options)
              }
              const popupContent = $iService.setTemplatePopupGeom({
                station_id: res.id,
                station_name: $scope.stationName,
                station_type: $scope.selectStationType
              }, true)
              const e = angular.element(popupContent)
              $compile(e)($scope.$new(), (element, scope) => {
                editableLayers._layers[_key].feature.station_id = res.id
                editableLayers._layers[_key].feature.station_name = $scope.stationName
                editableLayers._layers[_key].feature.station_type = $scope.selectStationType
                editableLayers._layers[_key].bindPopup(element[0]).bindTooltip($scope.stationName, { direction: 'center', permanent: true, className: 'label-geom' })
                const _layer = JSON.parse($scope.xLayer)
                _layer.features[0]["station_id"] = res.id
                _layer.features[0]["station_name"] = $scope.stationName
                _layer.features[0]["station_type"] = $scope.selectStationType
                $scope.drawTemp.features.push(_layer.features[0])
                $scope.xLayer = []
                $scope.dataPosition = ""
                $scope.stationName = ""
                $scope.selectStationType = "0"
                $scope.$broadcast('broadcastUpdateListGeom', {})
              })
              $iService.toggleModalMessage({
                title: $rootScope.text.page_tracking_realtime.alert_title_success,
                detail: $rootScope.text.page_tracking_realtime.alert_detail_success
              })
            } else {
              $scope.xLayer = []
              $iService.toggleModalMessage({
                title: $rootScope.text.page_tracking_realtime.alert_title_error,
                detail: $rootScope.text.page_tracking_realtime.alert_detail_error
              })
            }
            $scope.drawAction = false
          })
        }
        if ($scope.updateStation) {
          const _id = $scope.drawTemp.features.map(data => (data.station_id))
          if (_id.length > 0) {
            const _index = _id.indexOf($scope.stationId)
            const _layer = $scope.drawTemp.features[_index]
            _layer.station_name = $scope.stationName
            _layer.station_type = $scope.selectStationType
            const edit_layer = `{ "type": "FeatureCollection", "features": [${JSON.stringify(_layer)}] }`
            $scope.xLayer.push(edit_layer)
            const _data = {
              geom_data: $scope.xLayer
            }
            trackingRealtimeFactory.setGeom(_data, res => {
              if (res.success) {
                $scope.updateStation = false
                $scope.drawTemp.features[_index].station_name = $scope.stationName
                $scope.drawTemp.features[_index].station_type = $scope.selectStationType
                $scope.clearStation()
                L.geoJson($scope.drawTemp, {
                  onEachFeature: onEachFeatureGeom,
                  pointToLayer: (feature, latlng) => {
                    return L.circle(latlng, feature.properties.radius)
                  },
                  style: feature => {
                    switch (parseInt(feature.station_type)) {
                      case 1:
                        return { color: "blue", weight: 2, opacity: 0.6, fillOpacity: 0.5 }
                      case 2:
                        return { color: "green", weight: 2, opacity: 0.6, fillOpacity: 0.5 }
                      case 3:
                        return { color: "red", weight: 2, opacity: 0.6, fillOpacity: 0.5 }
                    }
                  }
                })
                $scope.dataPosition = ""
                $scope.stationName = ""
                $scope.selectStationType = "0"
                $rootScope.$broadcast('broadcastUpdateListGeom', {})
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_tracking_realtime.alert_title_success,
                  detail: $rootScope.text.page_tracking_realtime.alert_detail_success
                })
              } else {
                $scope.xLayer = []
                $iService.toggleModalMessage({
                  title: $rootScope.text.page_tracking_realtime.alert_title_error,
                  detail: $rootScope.text.page_tracking_realtime.alert_detail_error
                })
              }
            })
          }
        }
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_tracking_realtime.alert_title_warning,
          detail: $rootScope.text.page_tracking_realtime.alert_detail_blank
        })
      }
    }

    $scope.cancelStation = () => {
      if ($scope.createStation) {
        $scope.clearStation()
        L.geoJson($scope.drawTemp, {
          onEachFeature: onEachFeatureGeom,
          pointToLayer: (feature, latlng) => {
            return L.circle(latlng, feature.properties.radius)
          },
          style: feature => {
            switch (parseInt(feature.station_type)) {
              case 1:
                return { color: "blue", weight: 2, opacity: 0.6, fillOpacity: 0.5 }
              case 2:
                return { color: "green", weight: 2, opacity: 0.6, fillOpacity: 0.5 }
              case 3:
                return { color: "red", weight: 2, opacity: 0.6, fillOpacity: 0.5 }
            }
          }
        })
      }
      $scope.dataPosition = ""
      $scope.stationName = ""
      $scope.selectStationType = "0"
      $scope.createStation = false
      $scope.updateStation = false
    }

    $scope.setLayer = layer => {
      const _layer = layer.toGeoJSON()
      if (_layer.geometry.type == 'Point') {
        if (typeof layer._mRadius === "undefined" || layer._mRadius == null || layer._mRadius == "") {
          _layer.properties.radius = layer.feature.properties.radius
        } else {
          _layer.properties.radius = layer._mRadius
        }
      }
      const edit_layer = `{ "type": "FeatureCollection", "features": [${JSON.stringify(_layer)}] }`
      $scope.xLayer.push(edit_layer)
    }

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
                title: $rootScope.text.popup_tracking_realtime.alert_title_success,
                detail: $rootScope.text.popup_tracking_realtime.alert_detail_success
              })
            } else {
              $iService.toggleModalMessage({
                title: $rootScope.text.popup_tracking_realtime.alert_title_error,
                detail: $rootScope.text.popup_tracking_realtime.alert_detail_error
              })
            }
          })
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.popup_tracking_realtime.alert_title_warning,
            detail: $rootScope.text.popup_tracking_realtime.alert_detail_blank
          })
        }
      }
    }

    $scope.unfollowVehicle = () => {
      $scope.followModemId = null
      $scope.ListDetail = null
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
      $scope.ListDetail = data.modem_id
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

    $scope.filterData = (data) => {
      if (!$scope.ListDetail) {
        return true
      } else {
        if (data.vehicle_name) {
          if (data.vehicle_name.indexOf($scope.ListDetail) != -1 ||
            data.car_licence.indexOf($scope.ListDetail) != -1 ||
            data.modem_id.indexOf($scope.ListDetail) != -1 ||
            data.status_overtime_text.indexOf($scope.ListDetail) != -1 ||
            (`${$rootScope.text.page_tracking_realtime.limit_speed}${data.speedmax}`).indexOf($scope.ListDetail) != -1 ||
            (`${$rootScope.text.page_tracking_realtime.gps_datetime}${$iService.formatTextDateTime(data.gps_datetime)}`).indexOf($scope.ListDetail) != -1 ||
            (`${$rootScope.text.page_tracking_realtime.place}${$iService.setTextLocation(data)}`).indexOf($scope.ListDetail) != -1 ||
            $iService.formatTextDiff($iService.diffDuration(data.gps_datetime)).indexOf($scope.ListDetail) != -1 ||
            $iService.statusTextTracking(data.status).indexOf($scope.ListDetail) != -1) {
            return true
          } else {
            if (data.hasOwnProperty('model_device')) {
              if (data.model_device) {
                if (data.model_device.indexOf($scope.ListDetail) != -1) {
                  return true
                }
              }
            }
          }
        }
      }
    }

    $scope.$on("broadcastBoundMap", (event, data) => {
      map.flyToBounds([
        data.bound1,
        data.bound2
      ])
      map.invalidateSize()
    })

    $scope.$on('broadcastUpdateTrackingRealtime', (event, data) => {
      $scope.dataTrackingRealtime.map((_data, _index) => {
        if (data.modem_id === _data.modem_id) {
          let _check_repeat = true
          if ($scope.dataTrackingRealtime[_index]['gps_datetime'] != data.gps_datetime) {
            _check_repeat = false
          }
          if (!_check_repeat) {
            const _old_status = $scope.dataTrackingRealtime[_index]['status']
            const _latlon = {
              last_lat: $scope.dataTrackingRealtime[_index]['lat'],
              last_lon: $scope.dataTrackingRealtime[_index]['lon'],
              now_lat: data.lat,
              now_lon: data.lon
            }
            Object.entries(data).forEach(([key, value]) => {
              if ($scope.dataTrackingRealtime[_index].hasOwnProperty(key)) {
                $scope.dataTrackingRealtime[_index][key] = data[key]
                if (key === 'status') {
                  if (parseInt(_old_status) < 3) {
                    $scope.dataTrackingRealtime[_index]['new_status'] = data[key]
                    $scope.dataTrackingRealtime[_index]['new_status_text'] = $iService.statusTextTracking(data[key])
                    $scope.dataTrackingRealtime[_index]['status'] = data[key]
                    $scope.dataTrackingRealtime[_index]['status_text'] = $iService.statusTextTracking(data[key])
                  } else {
                    if (parseInt(data.status) < 3) {
                      $scope.dataTrackingRealtime[_index]['new_status'] = data[key]
                      $scope.dataTrackingRealtime[_index]['new_status_text'] = $iService.statusTextTracking(data[key])
                      $scope.dataTrackingRealtime[_index]['status'] = _old_status
                      $scope.dataTrackingRealtime[_index]['status_text'] = $iService.statusTextTracking(_old_status)
                    } else {
                      $scope.dataTrackingRealtime[_index]['new_status'] = data[key]
                      $scope.dataTrackingRealtime[_index]['new_status_text'] = $iService.statusTextTracking(data[key])
                      $scope.dataTrackingRealtime[_index]['status'] = data[key]
                      $scope.dataTrackingRealtime[_index]['status_text'] = $iService.statusTextTracking(data[key])
                    }
                  }
                }
                if (key === 'gps_datetime') {
                  const _diff = $iService.diffDuration(data[key])
                  if (_diff.days >= 1 || _diff.months > 0 || _diff.years > 0) {
                    $scope.dataTrackingRealtime[_index]['status_overtime'] = true
                    $scope.dataTrackingRealtime[_index]['status_overtime_text'] = $rootScope.text.page_dashboard_harvester.gps_not_update
                  } else {
                    $scope.dataTrackingRealtime[_index]['status_overtime'] = false
                    $scope.dataTrackingRealtime[_index]['status_overtime_text'] = ''
                  }
                }
              } else {
                // console.log(`[${_index}] Not key => ${key}`, data[key])
              }
            })
            $scope.$apply()

            if (parseInt(_old_status) < 3) {
              if (parseInt(data.status) < 3) {
                const _icon = L.icon({
                  iconUrl: `${$iService.host()}static/assets/img/icon/vehicle/v${data.status_angle}.png`,
                  iconSize: [28, 28],
                  iconAnchor: [12, 12],
                  popupAnchor: [3, -5]
                })
                $scope.markerTracking[_index].setIcon(_icon)
                const e = angular.element($iService.setTemplatePopupTrackingRealtime($scope.dataTrackingRealtime[_index]))
                $compile(e)($scope.$new(), function (element, scope) {
                  $scope.markerTracking[_index]._popup.setContent(element[0])
                })
              } else {
                const _icon = L.icon({
                  iconUrl: `${$iService.host()}static/assets/img/icon/vehicle/v${data.status}_${$iService.calIconDirection($iService.calAngle(_latlon))}.png`,
                  iconSize: [28, 28],
                  iconAnchor: [12, 12],
                  popupAnchor: [3, -5]
                })
                $scope.markerTracking[_index].setIcon(_icon)
                $scope.markerTracking[_index].moveTo(new L.LatLng(parseFloat(data.lat), parseFloat(data.lon)), 15000)
                const e = angular.element($iService.setTemplatePopupTrackingRealtime($scope.dataTrackingRealtime[_index]))
                $compile(e)($scope.$new(), function (element, scope) {
                  $scope.markerTracking[_index]._popup.setContent(element[0])
                })
              }
            } else {
              if (parseInt(data.status) < 3) {
                const _icon = L.icon({
                  iconUrl: `${$iService.host()}static/assets/img/icon/vehicle/v${_old_status}_${$iService.calIconDirection($iService.calAngle(_latlon))}.png`,
                  iconSize: [28, 28],
                  iconAnchor: [12, 12],
                  popupAnchor: [3, -5]
                })
                $scope.markerTracking[_index].setIcon(_icon)
                $scope.markerTracking[_index].moveTo(new L.LatLng(parseFloat(data.lat), parseFloat(data.lon)), 15000)
                const e = angular.element($iService.setTemplatePopupTrackingRealtime($scope.dataTrackingRealtime[_index]))
                $compile(e)($scope.$new(), function (element, scope) {
                  $scope.markerTracking[_index]._popup.setContent(element[0])
                })
              } else {
                const _icon = L.icon({
                  iconUrl: `${$iService.host()}static/assets/img/icon/vehicle/v${data.status}_${$iService.calIconDirection($iService.calAngle(_latlon))}.png`,
                  iconSize: [28, 28],
                  iconAnchor: [12, 12],
                  popupAnchor: [3, -5]
                })
                $scope.markerTracking[_index].setIcon(_icon)
                $scope.markerTracking[_index].moveTo(new L.LatLng(parseFloat(data.lat), parseFloat(data.lon)), 15000)
                const e = angular.element($iService.setTemplatePopupTrackingRealtime($scope.dataTrackingRealtime[_index]))
                $compile(e)($scope.$new(), function (element, scope) {
                  $scope.markerTracking[_index]._popup.setContent(element[0])
                })
              }
            }
          }
        }
      })
    })
  }
]).directive('gaugeSpeed', ['$rootScope', '$timeout', '$interval',
  ($rootScope, $timeout, $interval) => {
    return {
      restrict: 'EA',
      template: `<div class="container-gauge">
          <div class="gauge-a"></div>
          <div class="gauge-b"></div>
          <div class="gauge-c"></div>
          <div class="gauge-data">
            <h1>0</h1>
          </div>
        </div>`,
      scope: {
        high: '@',
        value: '@'
      },
      link: (scope, element, attrs) => {
        let ele_speed = element.children().children().eq(3).children()
        let ele_rotate = element.children().children().eq(2)
        let increase, decrease
        let val = parseInt(scope.value)
        let val_min = 0
        let val_max = 200
        let act_min = 0.0
        let act_max = 0.5

        function setRotate(speed) {
          let m2 = (act_max - act_min) / (val_max - val_min)
          let c2 = act_min - (m2 * val_min)
          let val_rotate = ((m2 * speed) + c2).toFixed(4)

          ele_rotate.attr("style", `transform: rotate(${val_rotate}turn);`)
          if (speed <= scope.high) {
            ele_rotate.css("background-color", "#1ABB9C")
          } else if (speed > scope.high) {
            ele_rotate.css("background-color", "#d9534f")
          }
        }

        scope.$watch('value', (newValue, oldValue) => {
          if (typeof newValue !== "undefined" && newValue != null && newValue != "") {
            let new_speed = parseInt(newValue)
            if (typeof oldValue !== "undefined" && oldValue != null && oldValue != "") {
              val = parseInt(oldValue)
            } else {
              val = 0
            }
            increase = setInterval(function () {
              if (val < new_speed) {
                val += 1
              } else if (val > new_speed) {
                val -= 1
              } else if (val == new_speed) {
                setRotate(new_speed)
                ele_speed.css("color", "rgba(86,90,92,1)")
                ele_speed.text(new_speed)
                clearInterval(increase)
              }
              setRotate(val)
              ele_speed.css("color", "rgba(86,90,92,1)")
              ele_speed.text(val)
            }, 50)
          }
        })
      }
    }
  }
])
