'use strict';

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
        var objectHash = {};

        angular.forEach(objects, function(object, i) {
          var path = scope.gmGetPath({object: object});
          var lineLatLngs = [];

          angular.forEach(path, function(latlng, j) {
            var position = objToLatLng(latlng);
            if (null === position) {
                $log.warn('Unable to generate lat/lng from ', latlng);
                return;
            }

            lineLatLngs.push(position);
          });

          var hash = angulargmUtils.createHash(lineLatLngs, controller.precision);
          var polylineOptions = scope.gmGetPolylineOptions({object: object});
          objectHash[hash] = object;

          // check if the polyline exists first (methods needs to be created)
          if (!controller.hasPolyline(scope.$id, hash)) {
            var options = {};
            angular.extend(options, polylineOptions, {path: lineLatLngs});

            controller.addPolyline(scope.$id, options);
            var polyline = controller.getPolyline(scope.$id, hash);

            angular.forEach(handlers, function(handler, event) {
              controller.addListener(polyline, event, function() {
                $timeout(function() {
                  handler(scope.$parent.$parent, {
                    object: object,
                    polyline: polyline
                  });
                });
              });
            });
          }
        });

        // remove 'orphaned' polylines
        controller.forEachPolylineInScope(scope.$id, function(polyline, hash) {
          if (!(hash in objectHash)) {
            controller.removePolylineByHash(scope.$id, hash);
          }
        });

        scope.$emit('gmPolylinesUpdated', attrs.gmObjects);
      }; // end updatePolylines()

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
        if (undefined === objectsName) {
          updatePolylines(scope);
        } else if (objectsName === attrs.gmObjects) {
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
