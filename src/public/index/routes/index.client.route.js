angular.module('index').config(['$routeProvider',
  ($routeProvider) => {
    $routeProvider
      .when('/', {
        templateUrl: 'index/views/index.client.view.html'
      })
      .otherwise({
        redirectTo: '/'
      })
  }
])
