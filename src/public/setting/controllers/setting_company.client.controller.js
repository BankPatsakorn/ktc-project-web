angular.module('setting').controller('SettingCompanyController', ['$rootScope', '$scope', '$location', '$iService', 'settingCompanyFactory',
  ($rootScope, $scope, $location, $iService, settingCompanyFactory) => {

    if ($rootScope.authentication.role != 'admin') {
      $location.path(`/${$rootScope.url_lang}/`)
    }

    $scope.$iService = $iService
    $scope.dataCompany = {}
    
    settingCompanyFactory.getDataCompany(res => {
      if (res.length > 0) {
        $scope.company_id = res[0].company_id
        $scope.inputCompanyName = res[0].company_name
        $scope.inputAddress = res[0].location_address
        $scope.inputPhone = res[0].contract_number
        $scope.inputFax = res[0].fax
        $scope.inputInstallLocation = res[0].location_install
      }
    })

    $scope.submit = () => {
      if ($scope.inputCompanyName != "" && $scope.inputCompanyName != null &&
        $scope.inputAddress != "" && $scope.inputAddress != null &&
        $scope.inputPhone != "" && $scope.inputPhone != null &&
        $scope.inputFax != "" && $scope.inputFax != null &&
        $scope.inputInstallLocation != "" && $scope.inputInstallLocation != null) {
        const _data = {
          company_id: $scope.company_id,
          company_name: $scope.inputCompanyName,
          location_address: $scope.inputAddress,
          contract_number: $scope.inputPhone,
          fax: $scope.inputFax,
          location_install: $scope.inputInstallLocation
        }
        settingCompanyFactory.editDataCompany(_data, res => {
          if (res.success) {
            $iService.toggleModalMessage({
              title: $rootScope.text.page_setting_company.alert_title_success,
              detail: $rootScope.text.page_setting_company.alert_detail_success
            })
          } else {
            $iService.toggleModalMessage({
              title: $rootScope.text.page_setting_company.alert_title_error,
              detail: $rootScope.text.page_setting_company.alert_detail_error
            })
          }
        })
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_setting_company.alert_title_warning,
          detail: $rootScope.text.page_setting_company.alert_detail_blank
        })
      }
    }
  }
])
