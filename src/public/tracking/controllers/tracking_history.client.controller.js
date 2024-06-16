angular.module('tracking').controller('TrackingHistoryController', ['$rootScope', '$scope', '$timeout', '$compile', '$iService', 'trackingHistoryFactory', 'trackingRealtimeFactory', 'indexFactory',
  ($rootScope, $scope, $timeout, $compile, $iService, trackingHistoryFactory, trackingRealtimeFactory, indexFactory) => {

  	$scope.$iService = $iService
    $scope.dataTrackingHistory = []
    
    $scope.createStation = false
    $scope.updateStation = false
    $scope.createRoute = false
    $scope.updateRoute = false

    $scope.drawAction = false
    $scope.drawTemp = null
    $scope.drawLayer = null
    $scope.drawType = null
    $scope.drawType = null

    $scope.xLayer = []
    $scope.isLoadStation = false

    // const markers = new L.markerClusterGroup()
    const markers = new L.LayerGroup()
    const polyline = new L.LayerGroup()
    const editableLayers = $iService.editableLayers()

    const osm = $iService.layerOsm(), esri = $iService.layerEsri()

    const map = L.map('map-history', {
      center: $iService.centerMap(),
      zoom: $iService.zoomMap(),
      layers: [osm, markers, polyline, editableLayers],
      fullscreenControl: true,
      editable: $rootScope.authentication.role == 'admin' ? true : false
    })

    const baseLayers = {
      OpenStreetMap: osm,
      Esri: esri
    }

    const overlays = {
      Marker: markers,
      Polyline: polyline,
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
          $scope.clearStation()
          $scope.plotStationCustomer()
          $scope.isLoadStation = true
        } else if (map.getZoom() < 9 && $scope.isLoadStation == true) {
          $scope.clearStation()
          $scope.isLoadStation = false
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
              const _key = arr_key[_size-1]
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
                title: $rootScope.text.page_tracking_history.alert_title_success,
                detail: $rootScope.text.page_tracking_history.alert_detail_success
              })
            } else {
              $scope.xLayer = []
              $iService.toggleModalMessage({
                title: $rootScope.text.page_tracking_history.alert_title_error,
                detail: $rootScope.text.page_tracking_history.alert_detail_error
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
          title: $rootScope.text.page_tracking_history.alert_title_warning,
          detail: $rootScope.text.page_tracking_history.alert_detail_blank
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
    
    indexFactory.getVehicleByFleet(res => {
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
        $scope.dataSelectVehicle = res.map(data => {
          return {
            id: data.modem_id,
            text: data.vehicle_name
          }
        })
      } else {
        $scope.dataSelectVehicle = []
      }
    })

    $scope.setTextDate = (str) => {
      let res = str.split(" - ")
      $scope.startDate = res[0]
      $scope.stopDate = res[1]
    }

  	$scope.searchVehicleHistory = () => {
      if ($scope.selectVehicle != "" && $scope.selectVehicle != null && $scope.selectVehicle !== '0' &&
        $scope.startDate != "" && $scope.startDate != null &&
        $scope.stopDate != "" && $scope.stopDate != null) {
        const _data = {
          modemid: $scope.selectVehicle,
          start: $scope.startDate,
          stop: $scope.stopDate
        }
        trackingHistoryFactory.getTrackingHistory(_data, res => {
          if (res.length > 0) {
            $scope.dataTrackingHistory = res.map(data => {
              return Object.assign({}, data, {
                ...data,
                status_text: $iService.statusTextTracking(data.status)
              })
            })
            markers.clearLayers()
            polyline.clearLayers()
            $scope.markers = []
            $scope.setMarkerHistory(res)
          } else {
            $iService.toggleModalMessage({
              title: $rootScope.text.page_tracking_history.alert_title,
              detail: $rootScope.text.page_tracking_history.alert_no_data
            })
          }
        })
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_tracking_history.alert_title,
          detail: $rootScope.text.page_tracking_history.alert_blank
        })
      }
    }

    $scope.addRoute = () => {
      if ($scope.dataTrackingHistory.length > 0) {
        $scope.createRoute = true
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_tracking_history.alert_title,
          detail: $rootScope.text.page_tracking_history.alert_blank
        })
      }
    }

    $scope.confirmRoute = () => {
      if ($scope.selectVehicle != "" && $scope.selectVehicle != null && $scope.selectVehicle !== '0' &&
        $scope.startDate != "" && $scope.startDate != null &&
        $scope.stopDate != "" && $scope.stopDate != null &&
        $scope.routeName != "" && $scope.routeName != null) {
        const _data = {
          modemid: $scope.selectVehicle,
          start: $scope.startDate,
          stop: $scope.stopDate,
          route_name: $scope.routeName
        }
        trackingHistoryFactory.addRoute(_data, res => {
          if (res.success) {
            $scope.routeName = ""
            $scope.createRoute = false
            $scope.updateRoute = false
            $rootScope.$broadcast('broadcastUpdateListGeom', {})
            $iService.toggleModalMessage({
              title: $rootScope.text.page_tracking_realtime.alert_title_success,
              detail: $rootScope.text.page_tracking_realtime.alert_detail_success
            })
          } else {
            $iService.toggleModalMessage({
              title: $rootScope.text.page_tracking_history.alert_title,
              detail: $rootScope.text.page_tracking_history.alert_no_data
            })
          }
        })
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_tracking_history.alert_title,
          detail: $rootScope.text.page_tracking_history.alert_blank
        })
      }
    }

    $scope.cancelRoute = () => {
      $scope.routeName = ""
      $scope.createRoute = false
      $scope.updateRoute = false
    }

    $scope.setMarkerHistory = (data) => {
      const latlng = []
      data.map(_data => {
        const _icon = L.icon({
          iconUrl: `${$iService.host()}static/assets/img/icon/arrow/v${_data.heading}.png`,
          iconSize: [28, 28],
          iconAnchor: [12, 12],
          popupAnchor: [3, -5]
        })
        latlng.push([_data.lat, _data.lon])
        const e = angular.element($iService.setTemplatePopupTrackingHistory(_data))
        $compile(e)($scope.$new(), (element, scope) => {
          $scope.markers.push(L.marker([_data.lat, _data.lon], { id: _data.id, icon: _icon }).addTo(markers).bindPopup(element[0]))
        })
      })
      L.polyline(latlng, {color: '#FF1493', weight: 12, opacity: 0.7}).addTo(polyline)
      L.polyline(latlng, {color: '#FFF', weight: 4, opacity: 0.8, dashArray: '20,15', lineJoin: 'round'}).addTo(polyline)
      map.fitBounds(latlng)
    }

    $scope.focusPosition = (id) => {
      const _id = $scope.markers.map(data => (data.options.id))
      if (_id.length > 0) {
        const _index = _id.indexOf(id)
        const latlng = []
        latlng.push([$scope.markers[_index]._latlng.lat, $scope.markers[_index]._latlng.lng])
        latlng.push([$scope.markers[_index]._latlng.lat, $scope.markers[_index]._latlng.lng])
        map.fitBounds(latlng)
        $scope.markers[_index].openPopup()
      }
    }

    $scope.exportVehicleHistory = () => {
      if ($scope.dataTrackingHistory.length > 0) {
        const convertToCSV = (objArray) => {
          const _array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray
          let str = ''
          for (let i = 0; i < _array.length; i++) {
            let line = ''
            for (let index in _array[i]) {
              if (line != '') line += ','
              line += _array[i][index]
            }
            str += line + '\r\n'
          }
          return str
        }
        const exportCSVFile = (headers, items, fileTitle) => {
          if (headers) {
            items.unshift(headers)
          }
          const jsonObject = JSON.stringify(items)
          const csv = convertToCSV(jsonObject)
          const exportedFilenmae = fileTitle + '.csv' || 'export.csv'
          const blob = new Blob(["\uFEFF"+csv], { type: 'text/csv;charset=utf-8;' })
          if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, exportedFilenmae)
          } else {
            const link = document.createElement("a")
            if (link.download !== undefined) {
              const url = URL.createObjectURL(blob)
              link.setAttribute("href", url)
              link.setAttribute("download", exportedFilenmae)
              link.style.visibility = 'hidden'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }
          }
        }
        const headers = {
          lat: $rootScope.text.page_tracking_history.export_title.lat,
          lon: $rootScope.text.page_tracking_history.export_title.lon,
          box_model: $rootScope.text.page_tracking_history.export_title.box_model,
          box_no: $rootScope.text.page_tracking_history.export_title.box_no,
          analog_input1: $rootScope.text.page_tracking_history.export_title.analog_input1,
          analog_input2: $rootScope.text.page_tracking_history.export_title.analog_input2,
          gps_datetime: $rootScope.text.page_tracking_history.export_title.gps_datetime,
          server_datetime: $rootScope.text.page_tracking_history.export_title.server_datetime,
          tambol: $rootScope.text.page_tracking_history.export_title.tambol,
          amphur: $rootScope.text.page_tracking_history.export_title.amphur,
          province: $rootScope.text.page_tracking_history.export_title.province,
          speed: $rootScope.text.page_tracking_history.export_title.speed,
          mileage: $rootScope.text.page_tracking_history.export_title.mileage,
          status: $rootScope.text.page_tracking_history.export_title.status
        }
        const itemsFormatted = []
        $scope.dataTrackingHistory.map(_data => {
          itemsFormatted.push({
            lat: _data.lat,
            lon: _data.lon,
            box_model: _data.model_device,
            box_no: _data.modem_id,
            analog_input1: _data.analog_input1,
            analog_input2: _data.analog_input2,
            gps_datetime: _data.gps_datetime,
            server_datetime: _data.time_server_recive,
            // gps_datetime: moment(_data.gps_datetime).format('YYYY-MM-DD HH:mm:ss'),
            // server_datetime: moment(_data.time_server_recive).format('YYYY-MM-DD HH:mm:ss'),
            tambol: $rootScope.url_lang == 'th' ? _data.tambol : _data.etambol,
            amphur: $rootScope.url_lang == 'th' ? _data.amphur : _data.eamphur,
            province: $rootScope.url_lang == 'th' ? _data.province : _data.eprovince,
            speed: _data.speed,
            mileage: _data.mileage,
            status: $iService.statusTextTracking(_data.status)
          })
        })
        const fileTitle = `${$scope.selectVehicle}_${$scope.startDate.replace(' ', '-').replace(':', '-')}_${$scope.stopDate.replace(' ', '-').replace(':', '-')}`
        exportCSVFile(headers, itemsFormatted, fileTitle)
      } else {
        $scope.toggleModalMessage({
          title: $rootScope.text.page_tracking_history.alert_title,
          detail: $rootScope.text.page_tracking_history.alert_no_data
        })
      }
    }

    $scope.calWorkTime = (value) => {
      const hours = Math.floor(value / 60)        
      const minutes = value % 60
      return `${hours}:${minutes}`
    }

    $scope.filterData = (data) => {
      if (!$scope.ListDetail) {
        return true
      } else {
        if (data.modem_id.indexOf($scope.ListDetail) != -1 ||
          (`${$rootScope.text.page_tracking_history.gps_datetime}${$iService.formatTextDateTime(data.gps_datetime)}`).indexOf($scope.ListDetail) != -1 ||
          (`${$rootScope.text.page_tracking_history.place}${$iService.setTextLocation(data)}`).indexOf($scope.ListDetail) != -1 ||
          (`${$rootScope.text.page_tracking_history.speed}${data.speed} ${$rootScope.text.page_tracking_history.km_hr}`).indexOf($scope.ListDetail) != -1 ||
          (`${data.mileage} ${$rootScope.text.page_tracking_history.km}`).indexOf($scope.ListDetail) != -1 ||
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

    $scope.$on("broadcastBoundMap", (event, data) => {
      map.flyToBounds([
        data.bound1,
        data.bound2
      ])
      map.invalidateSize()
    })
  }
])
