angular.module('graph').config(['$routeProvider',
  ($routeProvider) => {
    $routeProvider
      .when('/:lang/graph_usage_vehicle', {
        templateUrl: 'graph/views/graph_usage_vehicle.client.view.html'
      })
      .when('/:lang/graph_efficient', {
        templateUrl: 'graph/views/graph_efficient.client.view.html'
      })
      .when('/:lang/graph_over_speed', {
        templateUrl: 'graph/views/graph_over_speed.client.view.html'
      })
      .when('/:lang/graph_fuel', {
        templateUrl: 'graph/views/graph_fuel.client.view.html'
      })
      .when('/:lang/graph_battery', {
        templateUrl: 'graph/views/graph_battery.client.view.html'
      })
      .when('/:lang/graph_work_time', {
        templateUrl: 'graph/views/graph_work_time.client.view.html'
      })
      .when('/:lang/graph_vibration', {
        templateUrl: 'graph/views/graph_vibration.client.view.html'
      })
      .otherwise({
        redirectTo: '/'
      })
  }
])
