angular.module('camera').controller('CameraSnapshotController', ['$rootScope', '$scope', '$iService', 'cameraRealtimeFactory', 'cameraSnapshotFactory',
  ($rootScope, $scope, $iService, cameraRealtimeFactory, cameraSnapshotFactory) => {

  	$scope.$iService = $iService
  	$scope.vehicles = []
  	$scope.imagePlayBack = []
  	$scope.imageName = ""
  	$scope.noImage = `${$iService.host()}static/assets/img/noimage.jpg`;

  	$scope.getCameraHarvester = () => {
			cameraRealtimeFactory.getCameraHarvester(res => {
				if (res.length > 0) {
          function compare(a, b) {
            if (a.vehicle_name < b.vehicle_name) {
              return -1
            }
            if (a.vehicle_name > b.vehicle_name) {
              return 1
            }
            return 0
          }
          res.sort(compare)
          $scope.vehicles = res.map(data => {
            return {
              id: data.modem_id,
              text: data.vehicle_name
            }
          })
        }
			})
    }

    $scope.getCameraHarvester()

    $scope.searchImageHistory = () => {
      if ($scope.selectVehicle != "" && $scope.selectVehicle != null && $scope.selectVehicle !== '0' &&
        $scope.startDate != "" && $scope.startDate != null &&
        $scope.stopDate != "" && $scope.stopDate != null) {
        const _data = {
          modem_id: $scope.selectVehicle,
          start: $scope.startDate,
          stop: $scope.stopDate
        }
        cameraSnapshotFactory.getListPicture(_data, res => {
          if (res.length > 0) {
            $scope.imagePlayBack = res
          } else {
            $iService.toggleModalMessage({
              title: $rootScope.text.page_camera_snapshot.alert_title,
              detail: $rootScope.text.page_camera_snapshot.alert_no_data
            })
          }
        })
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_camera_snapshot.alert_title,
          detail: $rootScope.text.page_camera_snapshot.alert_blank
        })
      }
  	}

  	$scope.getViewImage = (image_name) => {
      if ($scope.selectVehicle != "" && $scope.selectVehicle != null && $scope.selectVehicle !== '0') {
      	$scope.imageName = image_name
        const _data = {
          modem_id: $scope.selectVehicle,
          name_img: image_name
        }
        cameraSnapshotFactory.getPicture(_data, res => {
          if (res != null) {
            $scope.imageView = `data:image/jpeg;base64,${res.img_base64}`
          } else {
            $iService.toggleModalMessage({
              title: $rootScope.text.page_camera_snapshot.alert_title,
              detail: $rootScope.text.page_camera_snapshot.alert_no_data
            })
          }
        })
      } else {
        $iService.toggleModalMessage({
          title: $rootScope.text.page_camera_snapshot.alert_title,
          detail: $rootScope.text.page_camera_snapshot.alert_blank
        })
      }
    }

  	$scope.setTextDate = (str) => {
      const res = str.split(" - ")
      $scope.startDate = res[0]
      $scope.stopDate = res[1]
    }
  }
]).directive('displayImage', ['$window',
  ($window) => {
    return {
      restrict: 'AC',
      link: (scope, element, attrs) => {

        angular.element($window).bind('resize', () => {
          scope.triggerSizeDisplayImage(element)
          // manuall $digest required as resize event
          // is outside of angular
          scope.$digest()
        })

        scope.triggerSizeDisplayImage = (_element) => {
        	const _height = $(window).height() - 210
          _element.css('min-height', _height)
        }

        scope.triggerSizeDisplayImage(element)
      }
    }
  }
])
