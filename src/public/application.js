const mainApplicationModulename = 'mean'

const mainApplicationModule = angular.module(mainApplicationModulename , [
  'ngRoute',
  'lang',
  'index',
  'login',
  'header',
  'sidebar',
  'dashboard',
  'tracking',
  // 'camera',
  'report',
  'graph',
  'maintenance',
  'setting'
])

mainApplicationModule.config(['$locationProvider', '$httpProvider',
  ($locationProvider, $httpProvider) => {
    $locationProvider.html5Mode(true).hashPrefix('!')

    $httpProvider.interceptors.push('LoadingListener')
  }
])

mainApplicationModule.run(['$rootScope', '$location', '$window', '$iLanguageEN', '$iLanguageTH', '$iService', 'indexFactory',
  ($rootScope, $location, $window, $iLanguageEN, $iLanguageTH, $iService, indexFactory) => {

    $rootScope.$on("$routeChangeStart", (event, next, current) => {
      $rootScope.setLanguage()
      $rootScope.authentication = $window.sessionStorage
      if (!$rootScope.authentication.token) {
        $location.path(`/${$rootScope.url_lang}/login`)
      } else {
        if ($location.path() == `/${$rootScope.url_lang}/login` || $location.path() == '/' || $location.path() == `/${$rootScope.url_lang}`) {
          $location.path(`/${$rootScope.url_lang}/dashboard_all`)
        }
      }
    })

    $rootScope.$watch('authentication.token', (newValue, oldValue) => {
      //cyclelog
      if (typeof newValue !== "undefined" && newValue != null && newValue != "") {
        if ($rootScope.sock == null) {
          $rootScope.openConnection()
        }
      } else {
        $rootScope.closeConnection()
      }
    })

    $rootScope.setLanguage = () => {
      const _url_lang = $location.path().split('/')
      const lang = _url_lang[1]
      if (lang == 'en') {
        $window.localStorage.lang = 'en'
        $rootScope.text = $iLanguageEN.lang()
        $rootScope.image_lang = 'static/assets/img/en.png'
      } else if (lang == 'th') {
        $window.localStorage.lang = 'th'
        $rootScope.text = $iLanguageTH.lang()
        $rootScope.image_lang = 'static/assets/img/th.png'
      } else {
        $window.localStorage.lang = $window.localStorage.lang == null ? 'th' : $window.localStorage.lang
        $rootScope.text = $iLanguageTH.lang()
        $rootScope.image_lang = 'static/assets/img/th.png'
      }
      const _url_path = $location.path().split(`/${lang}/`)
      $rootScope.url_path = _url_path[1]
      $rootScope.url_lang = $window.localStorage.lang
      $rootScope.image_lang_en = 'static/assets/img/en.png'
      $rootScope.image_lang_th = 'static/assets/img/th.png'
    }

    //cyclelog
    $rootScope.openConnection = () => {
      if ($rootScope.authentication.token) {

        $rootScope.sock = $iService.sock()

        const sound = new Howl({
          src: ['static/assets/sound/SOUND38.WAV']
        })

        indexFactory.getVehicleByFleet(res => {
          if (res.length > 0) {
            $rootScope.modemIdVehicle = res.map(data => (data.modem_id))
          } else {
            $rootScope.modemIdVehicle = []
          }
        })

        $rootScope.sock.onmessage = e => {
          const args = JSON.parse(e.data)
          // console.log(JSON.parse(e.data))
          switch (args.header) {
            case 'tracking': {
              delete args.header
              $rootScope.$broadcast('broadcastUpdateTrackingRealtime', args)
              break
            } case 'noti_camera': {
              delete args.header;
              $rootScope.$broadcast('broadcastUpdateCameraRealtime', args)
              break
            } case 'noti': {
              if ($rootScope.authentication.role == 'admin') {
                const _index = $rootScope.modemIdVehicle.indexOf(args.modem_id)
                if (_index != -1) {
                  delete args.header
                  $rootScope.$broadcast('broadcastNotification', args)
                  let message = ''
                  if ($rootScope.url_lang === 'en') {
                    message = args.message_en
                  } else if ($rootScope.url_lang === 'th') {
                    message = args.message_th
                  }
                  $iService.toggleAlertMessage({
                    status: args.colour,
                    title: $rootScope.text.alert.title_warning,
                    detail: message
                  })
                  if ($window.localStorage.volume === 'true') {
                    sound.play()
                  }
                }
              }
              break
            } case 'noti_rfid': {
              delete args.header;
              $rootScope.$broadcast('broadcastUpdateRFID', args)
              break
            }
          }
        }

        $rootScope.sock.onopen = () => {
          const send_msg = {
            room: $rootScope.authentication.fleetid,
            header: 'handshake'
          }
          $rootScope.sock.send(JSON.stringify(send_msg))
        }
      }
    }

    $rootScope.sendMessage = msg => {
      if ($rootScope.sock != null) {
        const send_msg = {
          room: $rootScope.authentication.fleetid,
          message: msg,
          username: $rootScope.authentication.fleetname
        }
        $rootScope.sock.send(JSON.stringify(send_msg))
      }
    }

    $rootScope.closeConnection = () => {
      if ($rootScope.sock != null) {
        $rootScope.sock.close()
        $rootScope.sock = null
      }
    }
  }
])

angular.element(document).ready(() => {
	angular.bootstrap(document, [mainApplicationModulename])
})
