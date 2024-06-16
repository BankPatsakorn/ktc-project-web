angular.module('camera').config(['$routeProvider',
  ($routeProvider) => {
    $routeProvider
      .when('/:lang/camera_realtime', {
        templateUrl: 'camera/views/camera_realtime.client.view.html'
      })
      .when('/:lang/camera_snapshot', {
        templateUrl: 'camera/views/camera_snapshot.client.view.html'
      })
      .otherwise({
        redirectTo: '/'
      })
  }
])
