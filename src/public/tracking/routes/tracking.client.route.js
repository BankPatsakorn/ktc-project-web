angular.module('tracking').config(['$routeProvider',
  ($routeProvider) => {
    $routeProvider
      .when('/:lang/tracking_realtime', {
        templateUrl: 'tracking/views/tracking_realtime.client.view.html'
      })
      .when('/:lang/tracking_history', {
        templateUrl: 'tracking/views/tracking_history.client.view.html'
      })
      .otherwise({
        redirectTo: '/'
      })
  }
])
