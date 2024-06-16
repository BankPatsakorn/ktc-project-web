angular.module('setting').controller('ChangePasswordController', ['$rootScope', '$scope', '$window','$iService', 'changePasswordFactory',
  ($rootScope, $scope, $window, $iService, changePasswordFactory) => {

    $scope.$iService = $iService
  	$scope.checkNewPassword = true
  	$scope.checkConfirmNewPassword = true

  	$scope.$watch('newPassword', value => {
      if (value !== "" && value !== null && value !== undefined) {
        // if (value.length >= 8 && value.length <= 12) {
        //   $scope.checkNewPassword = true
        // } else {
        //   $scope.checkNewPassword = false
        // }
        if ($scope.confirmNewPassword == value) {
          $scope.checkConfirmNewPassword = true
        } else {
          $scope.checkConfirmNewPassword = false
        }
      }
    })

    $scope.$watch('confirmNewPassword', value => {
      if (value !== "" && value !== null && value !== undefined) {
        if (value == $scope.newPassword) {
          $scope.checkConfirmNewPassword = true
        } else {
          $scope.checkConfirmNewPassword = false
        }
      }
    })

  	$scope.submit = () => {
  		if ($scope.currentPassword !== "" && $scope.currentPassword !== null && $scope.currentPassword !== undefined &&
        $scope.newPassword !== "" && $scope.newPassword !== null && $scope.newPassword !== undefined &&
        $scope.confirmNewPassword !== "" && $scope.confirmNewPassword !== null && $scope.confirmNewPassword !== undefined &&
        // $scope.newPassword.length >= 8 && $scope.newPassword.length <= 12 &&
        $scope.confirmNewPassword == $scope.newPassword) {
  			const _data = {
          old_pwd: $scope.currentPassword,
          new_pwd: $scope.newPassword,
          confirm_pwd: $scope.confirmNewPassword
        }
        changePasswordFactory.setDataChangePassword(_data, res => {
          if (res.success) {
            $scope.currentPassword = null
            $scope.newPassword = null
            $scope.confirmNewPassword = null
            $iService.toggleModalMessage({
              title: $rootScope.text.page_change_password.alert_title_success,
              detail: $rootScope.text.page_change_password.alert_detail_success
            })
          } else {
            if (res.error === "Expired Token" || res.error === "Invalid Token") {
              $iService.clearToken()
            }
            $iService.toggleModalMessage({
              title: $rootScope.text.page_change_password.alert_title_error,
              detail: $rootScope.text.page_change_password.alert_detail_error
            })
          }
        })
  		} else {
  			$iService.toggleModalMessage({
          title: $rootScope.text.page_change_password.alert_title_warning,
          detail: $rootScope.text.page_change_password.alert_detail_blank
        })
  		}
  	}

    $scope.back = () => {
      $window.history.back()
    }
  }
])
