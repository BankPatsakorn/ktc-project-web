angular.module('dashboard').controller('DashboardAllController', ['$rootScope', '$scope', '$timeout', '$interval', '$iService', 'dashboardFactory', 'settingVehicleFactory', 'indexFactory',
  ($rootScope, $scope, $timeout, $interval, $iService, dashboardFactory, settingVehicleFactory, indexFactory) => {

  	$scope.$iService = $iService
    $scope.dataSettingVehicle = []
    $scope.dataVehicles = []
  	$scope.dataForklift = []
  	$scope.dataForkliftBatt = []
  	$scope.dataForkliftLpg = []

    $scope.selectTab = 'tab-all'

    settingVehicleFactory.getDataVehicle(res => {
      if (res.length > 0) {
        $scope.dataSettingVehicle = res
      }
    })

    indexFactory.getDataDetailVehicle(res => {
      if (res.length > 0) {
        $scope.dataVehicles = res
      }
    })

    dashboardFactory.getDataForklift(res => {
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
        $scope.dataForklift = res
        $scope.dataForklift.map((_data, _index) => {
          const _diff = $iService.diffDuration(_data.gps_datetime)
          if (_diff.days >= 1 || _diff.months > 0 || _diff.years > 0) {
            $scope.dataForklift[_index]['status_overtime'] = true
            $scope.dataForklift[_index]['status_overtime_text'] = $rootScope.text.page_dashboard_all.gps_not_update
          } else {
            $scope.dataForklift[_index]['status_overtime'] = false
            $scope.dataForklift[_index]['status_overtime_text'] = ''
          }
        })
      }
    })

    $scope.setDataForklift = () => {
      if ($scope.dataForklift.length > 0 && $scope.dataSettingVehicle.length > 0 && $scope.dataVehicles.length > 0) {
        const vehicle_model_id = $scope.dataVehicles.map(_data => parseInt(_data.vehiclemodelid.trim()))
        $scope.dataForklift.map((data, index) => {
          const modem_id = $scope.dataSettingVehicle.map(_data => _data.modem_id)
          const _index = modem_id.indexOf(data.modem_id)
          if (_index != -1) {
            const __index = vehicle_model_id.indexOf(parseInt($scope.dataSettingVehicle[_index].vehicle_model_id.trim()))
            if (__index != -1) {
              if ($scope.dataVehicles[__index].vehicletype == "รถไฟฟ้า") {
              // if ($scope.dataVehicles[__index].vehiclemodel_name == "ECB40-2W450" ||
              //   $scope.dataVehicles[__index].vehiclemodel_name == "ECB35-2W450") {
                $scope.dataForkliftBatt.push({
                  ...data,
                  setting: $scope.dataSettingVehicle[_index],
                  vehicle_detail: $scope.dataVehicles[__index]
                })
              }
              if ($scope.dataVehicles[__index].vehicletype == "รถ LPG") {
              // if ($scope.dataVehicles[__index].vehiclemodel_name == "P1F2A25DU-2W450" ||
              //   $scope.dataVehicles[__index].vehiclemodel_name == "P1F2A25DU-2W500") {
                $scope.dataForkliftLpg.push({
                  ...data,
                  setting: $scope.dataSettingVehicle[_index],
                  vehicle_detail: $scope.dataVehicles[__index]
                })
              }
              return Object.assign(data, data, {
                ...data,
                setting: $scope.dataSettingVehicle[_index],
                vehicle_detail: $scope.dataVehicles[__index]
              })
            } else {
              return Object.assign(data, data, {
                ...data,
                setting: $scope.dataSettingVehicle[_index],
                vehicle_detail: {}
              })
            }
          } else {
            return Object.assign(data, data, {
              ...data,
              setting: {},
              vehicle_detail: {}
            })
          }
        })
      }
    }

    $scope.$watch('dataSettingVehicle', (newValue, oldValue) => {
      if (typeof newValue !== "undefined" && newValue != null && newValue != "" && newValue !== "0") {
        $scope.setDataForklift()
      }
    })

    $scope.$watch('dataForklift', (newValue, oldValue) => {
      if (typeof newValue !== "undefined" && newValue != null && newValue != "" && newValue !== "0") {
        $scope.setDataForklift()
      }
    })

    $scope.$watch('dataVehicles', (newValue, oldValue) => {
      if (typeof newValue !== "undefined" && newValue != null && newValue != "" && newValue !== "0") {
        $scope.setDataForklift()
      }
    })

    let loop = $interval(() => {
      dashboardFactory.getDataForklift(res => {
				if (res.length > 0) {
          const _arr = $scope.dataForklift.map(_data => (_data.modem_id))
          res.map((data, index) => {
            const _index = _arr.indexOf(data.modem_id)
            if (_index != -1) {
              if (data.modem_id === $scope.dataForklift[_index].modem_id) {
                $scope.updateData(data, _index)
              }
            }
          })
        }
			})
    }, 30000)

    $scope.stopLoop = () => {
      if (angular.isDefined(stop)) {
        $interval.cancel(loop)
        loop = undefined
      }
    }

    $scope.$on('$destroy', () => {
      $scope.stopLoop()
    })

    $scope.updateData = (data, _index) => {
      let _check_repeat = true
      if ($scope.dataForklift[_index]['gps_datetime'] != data.gps_datetime) {
        _check_repeat = false
      }
      if (!_check_repeat) {
        const _old_status = $scope.dataForklift[_index]['status']
        const _latlon = {
          last_lat: $scope.dataForklift[_index]['lat'], 
          last_lon: $scope.dataForklift[_index]['lon'],
          now_lat: data.lat,
          now_lon: data.lon
        }
        Object.entries(data).forEach(([key, value]) => {
          if ($scope.dataForklift[_index].hasOwnProperty(key)) {
            $scope.dataForklift[_index][key] = data[key]
            if (key === 'status') {
              if (parseInt(_old_status) < 3) {
                $scope.dataForklift[_index]['new_status'] = data[key]
                $scope.dataForklift[_index]['new_status_text'] = $iService.statusTextTracking(data[key])
                $scope.dataForklift[_index]['status'] = data[key]
                $scope.dataForklift[_index]['status_text'] = $iService.statusTextTracking(data[key])
              } else {
                if (parseInt(data.status) < 3) {
                  $scope.dataForklift[_index]['new_status'] = data[key]
                  $scope.dataForklift[_index]['new_status_text'] = $iService.statusTextTracking(data[key])
                  $scope.dataForklift[_index]['status'] = _old_status
                  $scope.dataForklift[_index]['status_text'] = $iService.statusTextTracking(_old_status)
                } else {
                  $scope.dataForklift[_index]['new_status'] = data[key]
                  $scope.dataForklift[_index]['new_status_text'] = $iService.statusTextTracking(data[key])
                  $scope.dataForklift[_index]['status'] = data[key]
                  $scope.dataForklift[_index]['status_text'] = $iService.statusTextTracking(data[key])
                }
              }
            }
            if (key === 'gps_datetime') {
              const _diff = $iService.diffDuration(data[key])
              if (_diff.days >= 1 || _diff.months > 0 || _diff.years > 0) {
                $scope.dataForklift[_index]['status_overtime'] = true
                $scope.dataForklift[_index]['status_overtime_text'] = $rootScope.text.page_dashboard_all.gps_not_update
              } else {
                $scope.dataForklift[_index]['status_overtime'] = false
                $scope.dataForklift[_index]['status_overtime_text'] = ''
              }
            }
          } else {
            // console.log(`[${_index}] Not key => ${key}`, data[key])
          }
        })
        // $scope.$apply()
      }
    }

    $scope.$on('broadcastUpdateTrackingRealtime', (event, data) => {
      const _arr = $scope.dataForklift.map(_data => (_data.modem_id))
      const _index = _arr.indexOf(data.modem_id)
      if (_index != -1) {
        $scope.updateData(data, _index)
      }
    })

    $scope.$on('broadcastUpdateRFID', (event, data) => {
      const _arr = $scope.dataForklift.map(_data => (_data.modem_id))
      const _index = _arr.indexOf(data.modem_id)
      if (_index != -1) {
        $scope.updateData(data, _index)
      }
    })

    $scope.triggerMasonry = (tab) => {
      $scope.selectTab = tab
      $rootScope.$broadcast('broadcastTriggerMasonry', tab)
    }

    $scope.filterData = (data) => {
      if (!$scope.ListDetail) {
        return true
      } else {
        if (data.vehicle_name.indexOf($scope.ListDetail) != -1 ||
          data.car_licence.indexOf($scope.ListDetail) != -1 ||
          data.modem_id.indexOf($scope.ListDetail) != -1 ||
          data.status_overtime_text.indexOf($scope.ListDetail) != -1 ||
          data.vehicle_detail.vehicletype.indexOf($scope.ListDetail) != -1 ||
          $iService.formatTextDateTime(data.gps_datetime).indexOf($scope.ListDetail) != -1 ||
          $iService.formatTextDiff($iService.diffDuration(data.gps_datetime)).indexOf($scope.ListDetail) != -1 ||
          $iService.statusTextTracking(data.status).indexOf($scope.ListDetail) != -1) {
          return true
        } else {
          if (data.setting.group_zone) {
            if (data.setting.group_zone.indexOf($scope.ListDetail) != -1) {
              return true
            }
          }
        }
      } 
    }

    $scope.filterDataBatt = (data) => {
      if (!$scope.ListDetailBatt) {
        return true
      } else {
        if (data.vehicle_name.indexOf($scope.ListDetailBatt) != -1 ||
          data.car_licence.indexOf($scope.ListDetailBatt) != -1 ||
          data.modem_id.indexOf($scope.ListDetailBatt) != -1 ||
          data.status_overtime_text.indexOf($scope.ListDetailBatt) != -1 ||
          data.vehicle_detail.vehicletype.indexOf($scope.ListDetailBatt) != -1 ||
          $iService.formatTextDateTime(data.gps_datetime).indexOf($scope.ListDetailBatt) != -1 ||
          $iService.formatTextDiff($iService.diffDuration(data.gps_datetime)).indexOf($scope.ListDetailBatt) != -1 ||
          $iService.statusTextTracking(data.status).indexOf($scope.ListDetailBatt) != -1) {
          return true
        } else {
          if (data.setting.group_zone) {
            if (data.setting.group_zone.indexOf($scope.ListDetailBatt) != -1) {
              return true
            }
          }
        }
      } 
    }

    $scope.filterDataLpg = (data) => {
      if (!$scope.ListDetailLpg) {
        return true
      } else {
        if (data.vehicle_name.indexOf($scope.ListDetailLpg) != -1 ||
          data.car_licence.indexOf($scope.ListDetailLpg) != -1 ||
          data.modem_id.indexOf($scope.ListDetailLpg) != -1 ||
          data.status_overtime_text.indexOf($scope.ListDetailLpg) != -1 ||
          data.vehicle_detail.vehicletype.indexOf($scope.ListDetailLpg) != -1 ||
          $iService.formatTextDateTime(data.gps_datetime).indexOf($scope.ListDetailLpg) != -1 ||
          $iService.formatTextDiff($iService.diffDuration(data.gps_datetime)).indexOf($scope.ListDetailLpg) != -1 ||
          $iService.statusTextTracking(data.status).indexOf($scope.ListDetailLpg) != -1) {
          return true
        } else {
          if (data.setting.group_zone) {
            if (data.setting.group_zone.indexOf($scope.ListDetailLpg) != -1) {
              return true
            }
          }
        }
      } 
    }
  }
])
