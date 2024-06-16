angular.module('index').factory('LoadingListener', ['$q', '$rootScope',
  ($q, $rootScope) => {
    let reqsActive = 0;

    function onResponse() {
      reqsActive--;
      if (reqsActive < 0) {
        reqsActive = 0
      }
      if (reqsActive === 0) {
        $rootScope.$broadcast('loading:completed')
      }
    }

    return {
      request: (config) => {
        if (config.url.indexOf('/api/get_noti_details') == -1 &&
          config.url.indexOf('/api/list_geom') == -1 &&
          config.url.indexOf('/api/get_geom') == -1 &&
          config.url.indexOf('/api/tracking_realtime_forklift') == -1) {
          if (reqsActive >= 0) {
            $rootScope.$broadcast('loading:started')
          }
          reqsActive++
        }
        return config
      },
      response: (response) => {
        if (!response || !response.config) {
          return response
        }
        onResponse()
        return response
      },
      responseError: (rejection) => {
        if (!rejection || !rejection.config) {
          return $q.reject(rejection)
        }
        onResponse()
        return $q.reject(rejection)
      },
      isLoadingActive : () => {
        return reqsActive === 0
      }
    }
  }
])
