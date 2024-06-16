angular.module('setting').config(['$routeProvider',
  ($routeProvider) => {
    $routeProvider
      .when('/:lang/setting_company', {
        templateUrl: 'setting/views/setting_company.client.view.html'
      })
      .when('/:lang/setting_driver', {
        templateUrl: 'setting/views/setting_driver.client.view.html'
      })
      .when('/:lang/setting_vehicle', {
        templateUrl: 'setting/views/setting_vehicle.client.view.html'
      })
      .when('/:lang/setting_group', {
        templateUrl: 'setting/views/setting_group.client.view.html'
      })
      .when('/:lang/setting_staff', {
        templateUrl: 'setting/views/setting_staff.client.view.html'
      })
      .when('/:lang/change_password', {
        templateUrl: 'setting/views/change_password.client.view.html'
      })
      .otherwise({
        redirectTo: '/'
      })
  }
])
