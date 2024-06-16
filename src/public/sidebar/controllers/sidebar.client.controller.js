angular.module('sidebar').controller('SidebarController', ['$scope',
  ($scope) => {

  }
]).directive('sidebarSelect', ['$location', '$timeout',
  ($location, $timeout) => {
    return {
      restrict: 'AC',
      link: (scope, element, attrs) => {

        let CURRENT_URL = window.location.href.split('#')[0].split('?')[0]
        let path = $location.path()

        if (path == '/') {
          CURRENT_URL = CURRENT_URL + 'monitoring'
        }

        element.find('a').on('click', function(ev) {
          let $li = $(this).parent()

          if ($li.is('.active')) {
            $li.removeClass('active active-sm')
            $('ul:first', $li).slideUp()
          } else {
            // prevent closing menu if we are on child menu
            if (!$li.parent().is('.child_menu')) {
              element.find('li').removeClass('active active-sm')
              element.find('li ul').slideUp()
            } else {
              if ($('body').is('.nav-sm')) {
                $li.parent().find('li').removeClass('active active-sm')
                $li.parent().find('li ul').slideUp()
              }
            }
            $li.addClass('active')

            $('ul:first', $li).slideDown()
          }
        })

        $timeout(() => {
          element.find(`a[href="${CURRENT_URL}"]`).parent('li').addClass('current-page')

          element.find('a').filter(function () {
            return this.href == CURRENT_URL
          }).parent('li').addClass('current-page').parents('ul').slideDown().parent().addClass('active')
        })
      }
    }
  }
])
