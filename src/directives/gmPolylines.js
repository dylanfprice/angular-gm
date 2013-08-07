'use strict';

// lines
// lat/lng per
// Stroke opts: colour, opacity, weight

(function () {

  angular.module('AngularGM').

  directive('gmPolylines', ['$parse', '$compile', '$timeout', '$log', 'angulargmUtils',
    function ($parse, $compile, $timeout, $log, angulargmUtils) {
    /** aliases */
    var latLngEqual = angulargmUtils.latLngEqual;
    var objToLatLng = angulargmUtils.objToLatLng;
    var getEventHandlers = angulargmUtils.getEventHandlers;

    function link(scope, element, attrs, controller) {
      // check attrs
      if (!('gmObjects' in attrs)) {
        throw 'gmObjects attribute required';
      } else if (!('gmGetPath' in attrs)) {
        throw 'gmGetPath attribute required';
      }

      var handlers = getEventHandlers(attrs); // map events -> handlers

      // fn for updating polylines from objects
      var updatePolylines = function(scope, objects) {
          console.log('updating lines?', objects);

          var objectHash = {};

          angular.forEach(objects, function(object, i) {
            var path = scope.gmGetPath({object: object});
            var lineLatLngs = [];
            var hash = '';

            angular.forEach(path, function(latlng, j) {
              var position = objToLatLng(latlng);
              if (null === position) {
                  $log.warn('Unable to generate lat/lng from ', latlng);
                  return;
              }

              lineLatLngs.push(position);
              hash += position.toUrlValue(controller.precision);
            });

            var polylineOptions = scope.gmGetPolylineOptions({object: object});
            objectHash[hash] = object;

            // check if the polyline exists first
            {
              var options = {};
              angular.extend(options, polylineOptions, {path: lineLatLngs});

              controller.addPolyline(scope.$id, options);
            }
          });
      }

      // remove 'orphaned' polylines

      scope.$watch('gmObjects().length', function(newValue, oldValue) {
        if (newValue != null && newValue !== oldValue) {
            updatePolylines(scope, scope.gmObjects());
        }
      });

      scope.$watch('gmObjects', function(newValue, oldValue) {
        if (newValue != null && newValue !== oldValue) {
            updatePolylines(scope, scope.gmObjects());
        }
      });

      // watch gmEvents

      scope.$on('gmPolylinesRedraw', function(event, objectsName) {
        if (objectsName == null || objectsName === attrs.gmObjects) {
          updatePolylines(scope);
          updatePolylines(scope, scope.gmObjects());
        }
      });

      $timeout(angular.bind(null, updatePolylines, scope, scope.gmObjects()));
    }

    return {
      restrict: 'AE',
      priority: 100,
      scope: {
        gmObjects: '&',
        gmGetPath: '&',
        gmGetPolylineOptions: '&',
        gmEvents: '&'
      },
      require: '^gmMap',
      link: link
    };
  }]);
})();
