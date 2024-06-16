angular.module('header').controller('HeaderController', ['$rootScope', '$scope', '$window', '$iService', 'headerFactory',
  ($rootScope, $scope, $window, $iService, headerFactory) => {

    $scope.$iService = $iService

    $scope.volume = $window.localStorage.volume === 'true' ? true : false
    
    $scope.listNotifications = []

    $scope.toggleVolume = () => {
      if ($scope.volume) {
        $window.localStorage.volume = 'false'
        $scope.volume = false
      } else {
        $window.localStorage.volume = 'true'
        $scope.volume = true
      }
    }

    headerFactory.getNotification(res => {
      // if (res.data.length > 0) {
      //   $scope.listNotifications = res.data
      if (res.length > 0) {
        $scope.listNotifications = res
        $scope.countNotification = res.total_unread
      } else {
        $scope.listNotifications = []
        $scope.countNotification = 0
      }
    })

    $scope.getListGeom = () => {
      headerFactory.getGeomList(res => {
        if (res.length > 0) {
          $scope.list_geom = res
        }
      })
    }
    $scope.getListGeom()

    $scope.clearAllNotification = () => {
      headerFactory.clearAllNotification(res => {
        if (res.success) {
          $scope.countNotification = 0
          $iService.toggleModalMessage({
            title: $rootScope.text.header.alert_title_success,
            detail: $rootScope.text.header.alert_detail_success
          })
        } else {
          $iService.toggleModalMessage({
            title: $rootScope.text.header.alert_title_error,
            detail: $rootScope.text.header.alert_detail_error
          })
        }
      })
    }

    $scope.callBoundMap = (bound1, bound2) => {
      $scope.$emit("broadcastBoundMap", {
        bound1: JSON.parse(bound1),
        bound2: JSON.parse(bound2)
      })
    }
    
    $scope.$on('broadcastNotification', (event, data) => {
      const _json = data
      _json["date_event"] = moment().format()
      $scope.listNotifications.push(_json)
      $scope.countNotification = ++$scope.countNotification
    })
    
    $scope.$on('broadcastUpdateListGeom', (event, data) => {
      $scope.getListGeom()
    })
  }
]).directive('menuToggle', ['$timeout', '$window',
  ($timeout, $window) => {
    return {
      restrict: 'AC',
      link: (scope, element, attrs) => {
        const $BODY = $('body')
        const $SIDEBAR_MENU = $('#sidebar-menu')

        angular.element($window).bind('resize', () => {
          scope.triggerSizeMenuToggle()
          // manuall $digest required as resize event
          // is outside of angular
          scope.$digest()
        })

        element.on('click', () => {
          if ($BODY.hasClass('nav-md')) {
            $SIDEBAR_MENU.find('li.active ul').hide()
            $SIDEBAR_MENU.find('li.active').addClass('active-sm').removeClass('active')
          } else {
            $SIDEBAR_MENU.find('li.active-sm ul').show()
            $SIDEBAR_MENU.find('li.active-sm').addClass('active').removeClass('active-sm')
          }
          
          $BODY.toggleClass('nav-md nav-sm')
          
          $('.dataTable').each(function() { $(this).dataTable().fnDraw() })
        })

        scope.triggerSizeMenuToggle = () => {
          const _width = $(window).width()
          if (_width >= 991) {
            $BODY.removeClass('nav-sm')
            $BODY.addClass('nav-md')
          } else {
            $BODY.removeClass('nav-md')
            $BODY.addClass('nav-sm')
            $BODY.toggleClass('nav-md nav-sm')
          }
        }

        $timeout(() => {
          scope.triggerSizeMenuToggle()
        })
      }
    }
  }
]).directive('modalLogout', ['$rootScope',
  ($rootScope) => {
    return {
      templateUrl: 'header/views/modal_logout.client.view.html',
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

        $rootScope.$on('modalLogout:toggle', () => {
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
]).directive('logout', [ '$rootScope', '$iService', 'logoutFactory',
  ($rootScope, $iService, logoutFactory) => {
    return {
      restrict: 'CA',
      link: (scope, element, attrs) => {

        $rootScope.$on('logout', () => {
          logoutFactory.getLogout(res => {
            if (res.success) {
              $iService.clearToken()
            } else {
              if (res.error === "Expired Token" || res.error === "Invalid Token") {
                $iService.clearToken()
              } else {
                $iService.toggleModalMessage({
                  title: $rootScope.text.modal_logout.title_error,
                  detail: $rootScope.text.modal_logout.detail_error
                })
              }
            }
          })
        })
      }
    }
  }
])
