/**
 * @ngdoc directive
 * @name angulargm.directive:gmPolylines
 * @element ANY
 *
 * @description
 * A directive for adding polylines to a `gmMap`. You may have multiple per `gmMap`.
 *
 * To use, you specify an array of custom objects and tell the directive how to
 * extract location data from them. A polyline will be created for each of your
 * objects. If you assign a new array to your scope variable or change the
 * array's length, the polylines will also update.
 *
 * Only the `gm-objects` and `gm-get-path` attributes are required.
 *
 * @param {expression} gm-objects an array of objects in the current scope.
 * These can be any objects you wish to attach to polylines, the only requirement
 * is that they have a uniform method of accessing a lat and lng.
 *
 *
 * @param {expression} gm-get-path an angular expression that given an object
 * from `gm-objects`, evaluates to an array of objects with lat and lng
 * properties. Your object can be accessed through the variable `object`.  For
 * example, if your controller has
 * ```js
 * ...
 * $scope.myObjects = [
 *   { id: 0, path: [ { lat: 5, lng: 5}, {lat: 4, lng: 4} ]},
 *   { id: 1, path: [ { lat: 6, lng: 6}, {lat: 7, lng: 7} ]}
 * ]
 * ...
 * ```
 * then in the `gm-polylines` directive you would put
 * ```js
 * ...
 * gm-objects="myObjects"
 * gm-get-path="object.path"
 * ...
 * ```
 *
 * @param {expression} gm-get-polyline-options an angular expression that given
 * an object from `gm-objects`, evaluates to a
 * [google.maps.PolylineOptions](https://developers.google.com/maps/documentation/javascript/reference#PolylineOptions)
 * object.  Your object can be accessed through the variable `object`. If
 * unspecified, google maps api defaults will be used.
 *
 */

/**
 * @ngdoc event
 * @name angulargm.directive:gmPolylines#gmPolylinesRedraw
 * @eventOf angulargm.directive:gmPolylines
 * @eventType listen on current gmPolylines scope
 *
 * @description Force the gmPolylines directive to clear and redraw all polylines.
 *
 * @param {string} objects Not required. The name of the scope variable which
 * holds the objects to redraw polylines for, i.e. what you set `gm-objects` to.
 * It is useful because there may be multiple instances of the `gmPolylines`
 * directive. If not specified, all instances of gmPolylines which are child
 * scopes will redraw their polylines.
 *
 * @example
 * ```js
 * $scope.$broadcast('gmPolylinesRedraw', 'myObjects');
 * ```
 */

/**
 * @ngdoc event
 * @name angulargm.directive:gmPolylines#gmPolylinesUpdated
 * @eventOf angulargm.directive:gmPolylines
 * @eventType emit on current gmPolylines scope
 *
 * @description Emitted when polylines are updated.
 *
 * @param {string} objects the name of the scope variable which holds the
 * objects the gmPolylines directive was constructed with. This is what
 * `gm-objects` was set to.
 *
 * @example
 * ```js
 * $scope.$on('gmPolylinesUpdated', function(event, objects) {
 *     if (objects === 'myObjects') {
 *       ...
 *     }
 * });
 * ```
 */

(function () {
'use strict';

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

      scope.$watch('gmObjects()', function(newValue, oldValue) {
        if (undefined !== newValue && newValue !== oldValue) {
            updatePolylines(scope, scope.gmObjects());
        }
      });

      scope.$on('gmPolylinesRedraw', function(event, objectsName) {
        if (undefined === objectsName || objectsName === attrs.gmObjects) {
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
      },
      require: '^gmMap',
      link: link
    };
  }]);
})();
