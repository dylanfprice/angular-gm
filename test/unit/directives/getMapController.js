
(function() {
  var mapCtrl;
  angular.module('googleMaps-test', ['googleMaps']).

  factory('gmtestMapController', function() {
    return function() {
      return mapCtrl;
    };
  }).

  directive('gmtestGetMapController', function() {
    return {
      restrict: 'AE',
      require: '^gmMap',
      link: function(scope, element, attrs, controller) {
        mapCtrl = controller;
      }
    };
  });
})();
