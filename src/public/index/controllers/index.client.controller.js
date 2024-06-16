angular.module('index').controller('IndexController', ['$scope',
  ($scope) => {

    $scope.$on('$locationChangeStart', (event, newLoc, oldLoc) => {
      // console.log('changing to: ' + newLoc)
    })

    $scope.$on('$locationChangeSuccess', (event, newLoc, oldLoc) => {
      // console.log('changed to: ' + newLoc)
    })
  }
]).directive('modalMessage', ['$rootScope', 
  ($rootScope) => {
    return {
      templateUrl: 'index/views/modal_message.client.view.html',
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: true,
      link: (scope, element, attrs) => {

        scope.$watch(attrs.visible, (newValue, oldValue) => {
          if (typeof newValue !== "undefined" && newValue != null && newValue != "") {
            if (newValue) {
              element.modal('show')
            } else {
              element.modal('hide')
            }
          }
        })

        $rootScope.$on('modalMessage:toggle', (event, data) => {
          scope.title = data.title
          scope.detail = data.detail
          scope.$parent[attrs.visible] = !scope.$parent[attrs.visible]
        })

        element.on('shown.bs.modal', () => {
          scope.$apply(() => {
            scope.$parent[attrs.visible] = true
          })
        })

        element.on('hidden.bs.modal', () => {
          scope.$apply(() => {
            scope.$parent[attrs.visible] = false
          })
        })
      }
    }
  }
]).directive('alertMessage', ['$rootScope', '$timeout',
  ($rootScope, $timeout) => {
    return {
      templateUrl: 'index/views/alert_message.client.view.html',
      restrict: 'E',
      scope: {
        data: '@'
      },
      link: (scope, element, attrs) => {

        scope.dataAlerts = []

        $rootScope.$on('alertMessage:toggle', (event, data) => {
          scope.setAlertMessage(JSON.stringify(data))
        })

        scope.setAlertMessage = (data) => {
          if (data && typeof data === 'string') {
            const _data = JSON.parse(data)
            scope.dataAlerts.push(_data)
            scope.$apply()
            let _index = scope.dataAlerts.length - 1
            $timeout(() => {
              $(".alert").eq(_index).addClass("in")
            }, 100)
            $timeout(() => {
              $(".alert").eq(_index).removeClass("in")
            }, 4000)
            $timeout(() => {
              scope.dataAlerts.splice(_index)
            }, 4300)
          }
        }
      }
    }
  }
]).directive('tooltip', () => {
  return {
    restrict: 'AC',
    scope: {
      title: '@'
    },
    link: (scope, element, attrs) => {

      element.tooltip({
        title: attrs.title,
        placement: attrs.placement
      })

      scope.$watch('title', (value) => {
        if (typeof value !== "undefined" && value != null && value != "") {
          element.tooltip().attr('data-original-title', value)
        }
      })
    }
  }
}).directive('popover', () => {
  return {
    restrict: 'AC',
    scope: {
      title: '@',
      content: '@'
    },
    link: (scope, element, attrs) => {

      element.popover({
        title: attrs.title,
        content: attrs.content,
        placement: attrs.placement
      })

      scope.$watch('title', (value) => {
        if (typeof value !== "undefined" && value != null && value != "") {
          element.popover().attr('data-original-title', value)
        }
      })

      scope.$watch('content', (value) => {
        if (typeof value !== "undefined" && value != null && value != "") {
          element.popover().attr('data-original-content', value)
        }
      })
    }
  }
}).directive('loadingListener', [ '$rootScope', 'LoadingListener',
  ($rootScope, LoadingListener) => {

    const tpl = `<div class="page-loadding">
      <div class="loader">
        <ul class="hexagon-container">
          <li class="hexagon hex_1"></li>
          <li class="hexagon hex_2"></li>
          <li class="hexagon hex_3"></li>
          <li class="hexagon hex_4"></li>
          <li class="hexagon hex_5"></li>
          <li class="hexagon hex_6"></li>
          <li class="hexagon hex_7"></li>
        </ul>
      </div>
    </div>`

    return {
      restrict: 'CA',
      link: (scope, element, attrs) => {

        const indicator = angular.element(tpl)
        element.prepend(indicator)
        element.css('position', 'relative')
        
        if (!LoadingListener.isLoadingActive()) {
          indicator.css('display', 'none')
          NProgress.remove()
        }

        $rootScope.$on('loading:started', () => {
          indicator.css('display', 'block')
          NProgress.start()
        })

        $rootScope.$on('loading:completed', () => {
          indicator.css('display', 'none')
          NProgress.done()
        })
      }
    }
  }
]).directive('currentLogin', [ '$timeout', '$iService', 'currentLoginFactory',
  ($timeout, $iService, currentLoginFactory) => {
    return {
      restrict: 'CA',
      link: (scope, element, attrs) => {

        // $timeout(() => {
        //   currentLoginFactory.getCurrentLogin(res => {
        //     if (!res.success) {
        //       if (res.error === "Expired Token" || res.error === "Invalid Token") {
        //         $iService.clearToken()
        //       }
        //     }
        //   })
        // })
      }
    }
  }
]).directive('select2', ['$rootScope',
  ($rootScope) => {
    return {
      restrict: 'AC',
      require: 'ngModel',
      scope: {
        title: '@',
        data: '@',
        multiple: '@'
      },
      link: (scope, element, attrs, ngModel) => {

        scope.clearDataSelect2 = () => {
          if (!scope.multiple) {
            element.val('0').trigger('change.select2')
            ngModel.$setViewValue('0')
          } else {
            element.val([]).trigger('change.select2')
            ngModel.$setViewValue([])
          }
        }

        scope.setDataSelect2 = data => {
          element.show()
          if (!scope.multiple) {
            element.html("<option value='0' disabled>" + attrs.title + "</option>")
            element.select2({
              data: data,
            }).on("change", function (e) {
              ngModel.$setViewValue(element.val())
            })
          } else {
            element.html('')
            element.select2({
              multiple: true,
              data: data,
              placeholder: attrs.title
            }).on("change", function (e) {
              ngModel.$setViewValue(element.val())
            })
          }
        }

        scope.$watch('title', value => {
          if (typeof value !== "undefined" && value != null && value != "" &&
            attrs.data !== "undefined" && attrs.data != "") {
            scope.setDataSelect2(JSON.parse(attrs.data))
            scope.clearDataSelect2()
          }
        })

        scope.$watch('data', value => {
          if (typeof value !== "undefined" && value != null && value != "") {
            scope.setDataSelect2(JSON.parse(value))
            scope.clearDataSelect2()
          }
        })

        scope.$watch(() => {
          return ngModel.$modelValue
        }, (value) => {
          if (typeof value !== "undefined" && value != null && value != "") {
            element.val(value).trigger('change.select2')
            ngModel.$setViewValue(value)
          } else if (value === "0") {
            scope.clearDataSelect2()
          }
        })
      }
    }
  }
]).directive('dateRangePickerYearMonth', () => {
  return {
    restrict: 'AC',
    link: (scope, element, attrs) => {
      element.show()
      element.daterangepicker({
        singleDatePicker: true,
        timePicker12Hour: false,
        locale: {
          format: 'YYYY-MM'
        },
      })
      element.val(moment().format('YYYY-MM'))
    }
  }
}).directive('dateRangePickerYearMonthDate', () => {
  return {
    restrict: 'AC',
    link: (scope, element, attrs) => {
      element.show()
      element.daterangepicker({
        singleDatePicker: true,
        timePicker12Hour: false,
        locale: {
          format: 'YYYY-MM-DD'
        },
      })
      element.val(moment().format('YYYY-MM-DD'))
    }
  }
}).directive('dateRangePickerYearMonthDateTime', () => {
  return {
    restrict: 'AC',
    link: (scope, element, attrs) => {
      element.show()
      element.daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        timePicker: true,
        timePicker24Hour: true,
        timePickerIncrement: 59,
        autoUpdateInput: true,
        locale: {
          format: 'YYYY-MM-DD HH:mm'
        }
      })
      element.val(moment().format('YYYY-MM-DD HH:mm'))
    }
  }
}).directive('dateRangePickerYearMonthDateTimeStartEnd', () => {
  return {
    restrict: 'AC',
    link: (scope, element, attrs) => {
      element.show()
      element.daterangepicker({
        timePicker: true,
        timePicker24Hour: true,
        // timePickerIncrement: 59,
        locale: {
          format: 'YYYY-MM-DD HH:mm'
        },
        dateLimit: {
          months: 1
        }
      })
      element.val(moment().format('YYYY-MM-DD') + ' 00:00 - ' + moment().format('YYYY-MM-DD') + ' 23:59')
    }
  }
}).directive('inputTypeNumber', () => {
  return {
    restrict: 'AC',
    link: (scope, element, attrs) => {
      element.keypress((event) => {
        if ((event.metaKey || event.ctrlKey) && ( String.fromCharCode(event.which).toLowerCase() === 'c') ) {
          // console.log("You pressed CTRL + C")
          return true
        }
        if ((event.metaKey || event.ctrlKey) && ( String.fromCharCode(event.which).toLowerCase() === 'v') ) {
          // console.log("You pressed CTRL + V")
          return true
        }
        if ((event.metaKey || event.ctrlKey) && ( String.fromCharCode(event.which).toLowerCase() === 'a') ) {
          // console.log("You pressed CTRL + A")
          return true
        }
        if (event.which == 45 || event.which == 46) {
          return true
        }
        if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {
          return false
        }
      })
    }
  }
}).directive('autoHeight', ['$window',
  ($window) => {
    return {
      restrict: 'AC',
      link: (scope, element, attrs) => {

        angular.element($window).bind('resize', () => {
          scope.triggerSize(element)
          // manuall $digest required as resize event
          // is outside of angular
          scope.$digest()
        })

        scope.triggerSize = (_element) => {
          const _height = $(window).height()
          _element.css('min-height', _height)
        }

        scope.triggerSize(element)
      }
    }
  }
]).directive('panelHeight', ['$window',
  ($window) => {
    return {
      restrict: 'AC',
      link: (scope, element, attrs) => {

        angular.element($window).bind('resize', () => {
          scope.triggerSizePanel(element)
          // manuall $digest required as resize event
          // is outside of angular
          scope.$digest()
        })

        scope.triggerSizePanel = (_element) => {
          const _height = $(window).height() - 200
          _element.css('min-height', _height)
        }

        scope.triggerSizePanel(element)
      }
    }
  }
]).directive('masonryGrid', [ '$timeout',
  ($timeout) => {
    return {
      restrict: 'CA',
      scope: {
        data: '@',
        search: '@',
        toggle: '@'
      },
      link: (scope, element, attrs) => {

        let _masonry = null

        scope.$watch('data', (newValue, oldValue) => {
          if (typeof newValue !== "undefined" && newValue != null && newValue != "") {
            const _data = JSON.parse(newValue)
            if (_data.length > 0) {
              if (_masonry == null) {
                $timeout(() => {
                  scope.setMasonry()
                })
              }
            }
          } else {
            if (_masonry != null) {
              element.masonry('destroy')
              _masonry = null
            }
          }
        })

        scope.$watch('search', value => {
          if (_masonry != null) {
            $timeout(() => {
              element.masonry('destroy')
              scope.setMasonry()
            })
          }
        })

        scope.$watch('toggle', value => {
          if (_masonry != null) {
            $timeout(() => {
              scope.setMasonry()
            })
          }
        })

        scope.setMasonry = () => {
          _masonry = element.masonry({
            itemSelector: '.grid-item',
            columnWidth: '.grid-sizer',
            percentPosition: true
          })
        }

        scope.$on('broadcastTriggerMasonry', (event, data) => {
          if (_masonry != null) {
            $timeout(() => {
              scope.setMasonry()
            })
          }
        })
      }
    }
  }
]).directive('mapFullPage', ['$window',
  ($window) => {
    return {
      restrict: 'AC',
      link: (scope, element, attrs) => {

        angular.element($window).bind('resize', () => {
          scope.triggerSizeTrackingMap(element)
          // manuall $digest required as resize event
          // is outside of angular
          scope.$digest()
        })

        scope.triggerSizeTrackingMap = (_element) => {
          const _height = $(window).height() - 130
          _element.css('min-height', _height)
        }

        scope.triggerSizeTrackingMap(element)
      }
    }
  }
]).directive('mapPanel', ['$window',
  ($window) => {
    return {
      restrict: 'AC',
      link: (scope, element, attrs) => {

        element.css('min-height', 400)
      }
    }
  }
])
.directive('modalMap', ['$rootScope', '$timeout', '$compile', '$iService', 'trackingRealtimeFactory',
  ($rootScope, $timeout, $compile, $iService, trackingRealtimeFactory) => {
    return {
      templateUrl: 'index/views/modal_map.client.view.html',
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: true,
      link: (scope, element, attrs) => {

        scope.drawAction = false

        scope.isLoadStation = false

        const markers = new L.LayerGroup()
        const editableLayers = $iService.editableLayers()

        const osm = $iService.layerOsm(), esri = $iService.layerEsri()

        const map = L.map('map-modal', {
          center: $iService.centerMap(),
          zoom: $iService.zoomMap(),
          layers: [osm, markers, editableLayers],
          fullscreenControl: true,
          editable: false
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

        map.on('movestart', e => {
          map.invalidateSize()
        })

        map.on('moveend', e => {
          scope.checkZoomPlotStation()
          map.invalidateSize()
        })

        $timeout(() => {
          map.panTo($iService.centerMap())
          map.invalidateSize()
          map.setZoom($iService.zoomMap())
        }, 1000)

        function onEachFeatureGeom(feature, layer) {
          const _popup = $iService.setTemplatePopupGeom({
            station_id: feature.station_id,
            station_name: feature.station_name,
            station_type: feature.station_type
          })
          const e = angular.element(_popup)
          $compile(e)(scope.$new(), (element, scope) => {
            layer.bindPopup(element[0]).bindTooltip(feature.station_name, { direction: 'center', permanent: true, className: 'label-geom' })
            editableLayers.addLayer(layer)
          })
        }

        scope.checkZoomPlotStation = () => {
          if (!scope.drawAction) {
            if (map.getZoom() >= 9 && scope.isLoadStation == false) {
              scope.clearStation()
              scope.plotStationCustomer()
              scope.isLoadStation = true
            } else if (map.getZoom() < 9 && scope.isLoadStation == true) {
              scope.clearStation()
              scope.isLoadStation = false
            }
          }
        }

        scope.plotStationCustomer = () => {
          let _id = []
          if (scope.drawTemp != null) {
            _id = scope.drawTemp.features.map(data => {
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
              scope.drawTemp = res
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

        scope.clearStation = () => {
          scope.xLayer = []
          editableLayers.clearLayers()
        }

        scope.$watch(attrs.visible, value => {
          if (value == true)
            element.modal('show')
          else
            element.modal('hide')
        })

        element.on('shown.bs.modal', () => {
          scope.$apply(() => {
            scope.showModalMap = true
            map.panTo($iService.centerMap())
            map.invalidateSize()
            map.setZoom($iService.zoomMap())
          })
        })

        element.on('hidden.bs.modal', () => {
          scope.$apply(() => {
            scope.showModalMap = false
            map.panTo($iService.centerMap())
            map.invalidateSize()
            map.setZoom($iService.zoomMap())
            markers.clearLayers()
          })
        })

        $rootScope.$on('toggleModalMap', (event, data) => {
          scope.showModalMap = !scope.showModalMap
          const arr_bounds = []
          if (data.length == 2) {
            arr_bounds.push([data[0].latitude, data[0].longitude])
            arr_bounds.push([data[1].latitude, data[1].longitude])
            $timeout(() => {
              L.marker([data[0].latitude, data[0].longitude])
                .bindPopup(data[0].address)
                .bindLabel($rootScope.text.text_location.position_start, { noHide: true, direction: 'auto' })
                .addTo(markers)
              L.marker([data[1].latitude, data[1].longitude])
                .bindPopup(data[1].address)
                .bindLabel($rootScope.text.text_location.position_end, { noHide: true, direction: 'auto' })
                .addTo(markers)
            }, 2500)
          } else if (data.length == 1) {
            arr_bounds.push([data[0].latitude, data[0].longitude])
            $timeout(() => {
              L.marker([data[0].latitude, data[0].longitude])
                .bindPopup(data[0].address)
                .addTo(markers)
                .openPopup()
            }, 2500)
          }
          $timeout(() => {
            map.fitBounds(arr_bounds)
          }, 2000)
        })
      }
    }
  }
]).directive('slimScrollListRight', ['$window',
  ($window) => {
    return {
      restrict: 'AC',
      link: (scope, element, attrs) => {

        let slim = null

        angular.element($window).bind('resize', () => {
          scope.triggerSizeListRight(element)
          // manuall $digest required as resize event
          // is outside of angular
          scope.$digest()
        })

        scope.setScrollerListRight = (_element) => {
          const _height = $(window).height() - 220
          slim = _element.slimScroll({
            height: _height
          })
        }

        scope.destroySlimscroll = (_element) => {
          if (slim) {
            _element.parent().replaceWith(_element)
            slim = null
          }
        }

        scope.triggerSizeListRight = (_element) => {
          scope.destroySlimscroll(_element)
          scope.setScrollerListRight(_element)
        }

        scope.triggerSizeListRight(element)
      }
    }
  }
]).directive('iCheckboxSquare', ['$timeout', '$parse',
  ($timeout, $parse) => {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: (scope, element, attr, ngModel) => {

        $timeout(() => {
          let value = attr.value
        
          function update(checked) {
            if (attr.type==='radio') { 
              ngModel.$setViewValue(value)
            } else {
              ngModel.$setViewValue(checked)
            }
          }
          
          element.iCheck({
            checkboxClass: attr.checkboxClass || 'icheckbox_square-green',
            radioClass: attr.radioClass || 'iradio_square-green'
          }).on('ifChanged', (e) => {
            scope.$apply(() => {
              update(e.target.checked)
            })
          })

          scope.$watch(attr.ngModel, (model) => {
            element.iCheck('update')
          }, true)
        })
      }
    }
  }
]).directive('cameraView', ['$interval', '$parse', '$iService',
  ($interval, $parse, $iService) => {
    return {
      restrict: 'A',
      link: (scope, element, attrs) => {
        let image_black = `${$iService.host()}static/assets/img/black.png`
        let fn = $parse(attrs.cameraView)
        let temp_url = scope.src
        let promise

        element.bind('load', (event) => {
          scope.$apply(() => {
            fn(scope, { $event: event })
          })
        }).bind('error', () => {
          attrs.$set("src", image_black)
        })

        scope.startInterval = function() {
          scope.stopInterval()
          promise = $interval(function() {
            attrs.$set("src", `${attrs.ngSrc}?_ts=${new Date().getTime()}`)
          }, 60000 * 1)
        }

        scope.stopInterval = function() {
          $interval.cancel(promise)
        }

        scope.startInterval()
      }
    }
  }
]).directive('screenfull', ['$timeout',
  ($timeout) => {
    return {
      restrict: 'A',
      scope: {
        id: '@'
      },
      link: (scope, element, attrs) => {
        $timeout(() => {
          $('#toggle-' + scope.id).click(() => {
            const target = element[0]
            if (screenfull.enabled) {
                screenfull.request(target)
            }
          })
        })
      }
    }
  }
]).directive('lazy', ['$timeout',
  ($timeout) => {
    return {
      restrict: 'A',
      scope: {
        src: '@'
      },
      link: (scope, element, attrs) => {
        $timeout(() => {
          element.Lazy({
            scrollDirection: 'vertical',
            effect: 'fadeIn',
            effectTime: 1000,
            visibleOnly: true,
            onError: (e) => {
              console.log(`error loading ${e.data('src')}`)
            }
          })
        }, 1000)

        scope.$watch('src', (newValue, oldValue) => {
          if (typeof newValue !== "undefined" && newValue != null && newValue != "") {
            if (newValue != oldValue) {
              element.attr('src', newValue)
            }
          }
        }, true)
      }
    }
  }
]).directive('dropzone', ['$timeout', '$iService', '$log',
  ($timeout, $iService, $log) => {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: (scope, element, attr, ngModel) => {

        scope.dropzone = element.dropzone({
          addRemoveLinks: true,
          url: "#",
          maxFiles: 1,
          acceptedFiles: 'image/*',
          thumbnailWidth: 240,
          thumbnailHeight: 240,
          resizeWidth: 240,
          resizeheight: 240,
          resizeQuality: 0.5,
          addRemoveLinks: true,
          accept: function(file, done) {
            const reader = new FileReader()
            // Closure to capture the file information.
            const fileName = file.name
            reader.onload = function(e) {
              const img = new Image()
              img.src = e.target.result
              img.onload = () => {
                const canvas = document.createElement("canvas")
            
                const ctx = canvas.getContext("2d")
                ctx.drawImage(img, 0, 0)

                let MAX_WIDTH = 480
                let MAX_HEIGHT = 480
                let width = img.width
                let height = img.height

                if (width > height) {
                  if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width
                    width = MAX_WIDTH
                  }
                } else {
                  if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height
                    height = MAX_HEIGHT
                  }
                }
                canvas.width = width
                canvas.height = height
                const _ctx = canvas.getContext("2d")
                _ctx.drawImage(img, 0, 0, width, height)

                _ctx.canvas.toBlob((blob) => {
                  const newFile = new File([blob], fileName, {
                    type: 'image/png',
                    lastModified: Date.now()
                  })
                  const _reader = new FileReader()
                  _reader.onload = function(event) {
                    var base64URL = event.target.result
                    ngModel.$setViewValue(base64URL)
                  }
                  _reader.readAsDataURL(newFile)
                }, 'image/png', 0)
              }
            }
            reader.readAsDataURL(file)
            done()
          },
          init: function() {
            this.on("maxfilesexceeded", function(file) {
              this.removeAllFiles()
              this.addFile(file)
            })
            this.on("complete", function(file) {
              this.removeFile(file)
            })
          }
        })

        // scope.$watch(
        //   function() {
        //     return ngModel.$modelValue
        //   }, function(newValue, oldValue) {
        //     $log.info('in *thisDirective* model value changed...', newValue, oldValue)
        //   }, true)
      }
    }
  }
])
