angular.module('index').factory('currentLoginFactory', ['$rootScope', '$location', '$iService',
  ($rootScope, $location, $iService) => {
    return {
      getCurrentLogin: (callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            url_path: $location.path()
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}getCurrentLogin`, strJson, header, (res) => {
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
