(function () {
    'use strict';
    
    angular.module('AngularGM').

  directive('gmCircles', ['$parse', '$compile', '$timeout', '$log', 'angulargmUtils', 'angulargmShape',
    function ($parse, $compile, $timeout, $log, angulargmUtils, angulargmShape) {
     
        var objToLatLng = angulargmUtils.objToLatLng;

        function link(scope, element, attrs, controller) {
            if (!('gmCircleCenter' in attrs)) {
                throw 'gmCircleCenter attribute required';
            }

            var circleOptions = function (object) {
                var latLngObj = scope.gmCircleCenter({ object: object });    
                var center = objToLatLng(latLngObj);
                if (center == null) {
                    return null;
                }
                var circleOptions = scope.gmCircleOptions({ object: object });
                var options = {};
                angular.extend(options, circleOptions, { center: center });
                return options;
            };
                
            angulargmShape.createShapeDirective(
                'circle', scope, attrs, controller, circleOptions
            );
        }
            
        return {
            restrict: 'AE',
            priority: 100,
            scope: {
                gmObjects: '&',
                gmId: '&',
                gmCircleCenter: '&',
                gmCircleOptions: '&'
            },
            require: '^gmMap',
            link: link
        };
    }]);
})();