angular.module('AngularGMExample', ['components', 'homepage'])

.config(['$routeProvider', function($routeProvider) {
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
    });
}]).

config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode(false);
}]);

