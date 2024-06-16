angular.module('dashboard').config(['$routeProvider',
  ($routeProvider) => {
    $routeProvider
      .when('/:lang/dashboard_all', {
        templateUrl: 'dashboard/views/dashboard_all.client.view.html'
      })
      .when('/:lang/dashboard/:udid', {
        templateUrl: 'dashboard/views/dashboard.client.view.html'
      })
      .otherwise({
        redirectTo: '/'
      })
  }
])
