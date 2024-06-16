angular.module('setting').factory('changePasswordFactory', ['$rootScope', '$iService',
  ($rootScope, $iService) => {
    return {
      setDataChangePassword: (data, callback) => {
        if ($rootScope.authentication.token) {
          const strJson = {
            fleetid: $rootScope.authentication.fleetid,
            fleetname: $rootScope.authentication.fleetname,
            old_pwd: data.old_pwd,
            new_pwd: data.new_pwd,
            confirm_pwd: data.confirm_pwd
          }
          const header = {
            token: $rootScope.authentication.token
          }
          $iService.postByHeader(`${$iService.url()}set_password`, strJson, header, (res) => {
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
