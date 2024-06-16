angular.module('login').controller('LoginController', ['$rootScope', '$scope', '$location', '$window', '$iService', 'loginFactory',
  ($rootScope, $scope, $location, $window, $iService, loginFactory) => {

    $rootScope.authentication = $window.sessionStorage

    $scope.remember = $window.localStorage.remember === 'true' ? true : false
    $scope.volume = $window.localStorage.volume === 'true' ? true : false

    if ($scope.remember) {
      $scope.username = $window.localStorage.username
      $scope.password = $window.localStorage.password
    } else {
      $scope.username = ""
      $scope.password = ""
      $window.localStorage.username = ""
      $window.localStorage.password = ""
    }

    $scope.getLogin = (username, password, remember, volume) => {
      if ($.trim(username) && $.trim(password)) {

        const _data = {
          user: username,
          pass: password
        }

        loginFactory.getLogin(_data, function(res) {
          if (res.success) {
            if ($scope.remember) {
              $window.localStorage.username = username
              $window.localStorage.password = password
            }
            $window.localStorage.remember = remember == null ? false : remember
            $window.localStorage.volume = volume == null ? false : volume

            $window.sessionStorage.token = res.token
            $window.sessionStorage.role = res.role
            $window.sessionStorage.fleetid = res.fleetid
            $window.sessionStorage.fleetname = res.fleetname

            // $window.sessionStorage.user_id = res.data.user_id
            // $window.sessionStorage.token = res.data.token
            // $window.sessionStorage.role_id = res.data.role_id
            // $window.sessionStorage.role_name = res.data.role_name
            // $window.sessionStorage.group_id = res.data.group_id
            // $window.sessionStorage.group_name = res.data.group_name
            // $window.sessionStorage.sub_group_id = res.data.sub_group_id
            // $window.sessionStorage.sub_group_name = res.data.sub_group_name
            $window.sessionStorage.url_avatar = null // res.data.url_avatar
            $window.sessionStorage.first_name = res.fleetname // res.data.first_name
            $window.sessionStorage.last_name = '' // res.data.last_name
            // $window.sessionStorage.email = res.data.email
            // $window.sessionStorage.phone_number = res.data.phone_number

            $rootScope.authentication = $window.sessionStorage

            $location.path('/')
          } else {
            $iService.toggleModalMessage({
              title: $rootScope.text.modal_login.title_error,
              detail: $rootScope.text.modal_login.detail_error
            })
          }
        })
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.modal_login.title_blank,
          detail: $rootScope.text.modal_login.detail_blank
        })
      }
    }
  }
]).directive('loginBgBlur', ['$window',
  ($window) => {
    return {
      restrict: 'AC',
      link: (scope, element, attrs) => {

        angular.element($window).bind('resize', () => {
          scope.triggerSizeLoginPanel(element)
          // manuall $digest required as resize event
          // is outside of angular
          scope.$digest()
        })

        scope.triggerSizeLoginPanel = (_element) => {
          const _width = $(window).width()
          if (_width <= 991) {
            const login_width_1 = _width
            const login_width_2 = 0
            _element.attr('style',  `clip: rect(0px, ${login_width_1}px, 800px, ${login_width_2}px`)
          } else {
            const login_width_1 = (((_width - 1000) - (_width - 1000) / 2) + 600) + 400
            const login_width_2 = ((_width - 1000) - (_width - 1000) / 2) + 600
            _element.attr('style',  `clip: rect(0px, ${login_width_1}px, 800px, ${login_width_2}px`)
          }
        }

        scope.triggerSizeLoginPanel(element)
      }
    }
  }
])
