angular.module('camera').controller('CameraRealtimeController', ['$rootScope', '$scope', '$sce', '$iService', 'cameraRealtimeFactory',
  ($rootScope, $scope, $sce, $iService, cameraRealtimeFactory) => {

  	$scope.$iService = $iService
  	$scope.dataCameraRealtime = []

  	$scope.getCameraHarvester = () => {
			cameraRealtimeFactory.getCameraHarvester(res => {
				if (res.length > 0) {
          $scope.dataCameraRealtime = res.map(data => {
            return {
              id: data.id,
              modem_id: data.modem_id,
              status: data.status,
              camera_url: $sce.trustAsResourceUrl(data.camera_url),
              vehicle_name: data.vehicle_name,
              car_licence: data.car_licence,
              lastupdate: data.lastupdate
            }
          })
        }
			})
    }

    $scope.getCameraHarvester()

    $scope.filterData = (data) => {
      if (!$scope.ListDetail) {
        return true
      } else {
        if (data.vehicle_name.indexOf($scope.ListDetail) != -1 ||
          data.car_licence.indexOf($scope.ListDetail) != -1 ||
          data.modem_id.indexOf($scope.ListDetail) != -1 ||
          $iService.statusTextTracking(data.status).indexOf($scope.ListDetail) != -1) {
          return true
        }
      } 
    }
  }
])
