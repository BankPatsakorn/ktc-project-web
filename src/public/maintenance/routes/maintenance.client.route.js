angular.module('maintenance').config(['$routeProvider',
  ($routeProvider) => {
    $routeProvider
      // .when('/:lang/maintenance_lubricant', {
      //   templateUrl: 'maintenance/views/maintenance_lubricant.client.view.html'
      // })
      // .when('/:lang/maintenance_tire', {
      //   templateUrl: 'maintenance/views/maintenance_tire.client.view.html'
      // })
      .when('/:lang/maintenance_work_time_batt', {
        templateUrl: 'maintenance/views/maintenance_work_time_batt.client.view.html'
      })
      .when('/:lang/maintenance_work_time_lpg', {
        templateUrl: 'maintenance/views/maintenance_work_time_lpg.client.view.html'
      })
      .otherwise({
        redirectTo: '/'
      })
  }
])
