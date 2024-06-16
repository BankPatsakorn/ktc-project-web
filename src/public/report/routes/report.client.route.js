angular.module('report').config(['$routeProvider',
  ($routeProvider) => {
    $routeProvider
      .when('/:lang/report_usage_vehicle', {
        templateUrl: 'report/views/report_usage_vehicle.client.view.html'
      })
      .when('/:lang/report_idling', {
        templateUrl: 'report/views/report_idling.client.view.html'
      })
      .when('/:lang/report_parking', {
        templateUrl: 'report/views/report_parking.client.view.html'
      })
      .when('/:lang/report_over_speed', {
        templateUrl: 'report/views/report_over_speed.client.view.html'
      })
      .when('/:lang/report_inout_station', {
        templateUrl: 'report/views/report_inout_station.client.view.html'
      })
      .when('/:lang/report_sliding_card', {
        templateUrl: 'report/views/report_sliding_card.client.view.html'
      })
      .when('/:lang/report_scan_card', {
        templateUrl: 'report/views/report_scan_card.client.view.html'
      })
      .when('/:lang/report_usage_vehicle_and_driver', {
        templateUrl: 'report/views/report_usage_vehicle_and_driver.client.view.html'
      })
      .when('/:lang/report_summary', {
        templateUrl: 'report/views/report_summary.client.view.html'
      })
      .otherwise({
        redirectTo: '/'
      })
  }
])
