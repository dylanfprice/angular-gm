angular.module('AngularGMExample', ['ngRoute', 'components', 'homepage'])

.config(function($routeProvider) {
  $routeProvider.
    when('/map/', {
      templateUrl: 'partials/map.html',
      active: 'map',
    }).
    when('/infowindows/', {
      templateUrl: 'partials/infowindows.html',
      active: 'infowindows',
    }).
    when('/markers/', {
      templateUrl: 'partials/markers.html',
      active: 'markers',
    }).
    when('/polylines/', {
      templateUrl: 'partials/polylines.html',
      active: 'polylines',
    }).
    when('/circles/', {
        templateUrl: 'partials/circles.html',
        active: 'circles',
    }).
    otherwise({
      redirectTo: '/map/'
    });
})

.config(function($locationProvider) {
  $locationProvider.html5Mode(false);
})

.controller('BodyCtrl', function($scope, $route) {
  $scope.$route = $route;
});

