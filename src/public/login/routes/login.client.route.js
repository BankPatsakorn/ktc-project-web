angular.module('login').config(['$routeProvider',
  ($routeProvider) => {
    $routeProvider
      .when('/:lang/login', {
        templateUrl: 'login/views/login.client.view.html'
      })
      .otherwise({
        redirectTo: '/'
      })
  }
])
