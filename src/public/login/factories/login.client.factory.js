angular.module('login').factory('loginFactory', ['$rootScope', '$iService',
  ($rootScope, $iService) => {
    return {
      getLogin: (data, callback) => {
        $iService.postParameter(`${$iService.url()}get_login`, data, (res) => {
          if ($.trim(res)) {
            callback(res)
          } else {
            callback(null)
          }
        })
      }
    }
  }
])
