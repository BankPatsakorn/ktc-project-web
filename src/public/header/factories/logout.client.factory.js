angular.module('header').factory('logoutFactory', ['$rootScope', '$iService',
  ($rootScope, $iService) => {
    return {
      getLogout: (callback) => {
        if ($rootScope.authentication.token) {
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}get_logout_kmp_ksp`, {}, header, (res) => {
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
