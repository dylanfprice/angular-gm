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
 * array's length, the polylines will also update.  The one case where
 * `gmPolylines` can not automatically detect changes to your objects is when
 * you mutate objects in the array. To inform the directive of such changes,
 * see the `gmPolylinesUpdate` event below.
 *
 * Only the `gm-objects`, `gm-id` and `gm-path` attributes are required.
 *
 * @param {expression} gm-objects an array of objects in the current scope.
 * These can be any objects you wish to attach to polylines, the only requirement
 * is that they have a uniform method of accessing an id and a path.
 *
 * @param {expression} gm-path an angular expression that given an object
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
 * @param {expression} gm-polyline-options an angular expression that given
 * an object from `gm-objects`, evaluates to a
 * [google.maps.PolylineOptions](https://developers.google.com/maps/documentation/javascript/reference#PolylineOptions)
 * object.  Your object can be accessed through the variable `object`. If
 * unspecified, google maps api defaults will be used.
 *
 * @param {expression} gm-events a variable in the current scope that is used to
 * simulate events on polylines. Setting this variable to an object of the form
 * ```js
 *     [
 *       {
 *         event: 'click',
 *         ids: [id1, ...]
 *       },
 *       ...
 *     ]
 * ```
 * will generate the named events on the polylines with the given ids, if a
 * polyline with each id exists. Note: when setting the `gm-events` variable, you
 * must set it to a new object for the changes to be detected.  Code like
 * ```js
 * myEvents[0]["ids"] = [0]
 * ```
 * will not work.
 *
 *
 * @param {expression} gm-on-*event* an angular expression which evaluates to
 * an event handler. This handler will be attached to each polyline's \*event\*
 * event.  The variables 'object' and 'polyline' evaluate to your object and the
 * [google.maps.Polyline](https://developers.google.com/maps/documentation/javascript/reference#Polyline),
 * respectively. For example:
 * ```html
 * gm-on-click="myClickFn(object, polyline)"
 * ```
 * will call your `myClickFn` whenever a polyline is clicked.  You may have
 * multiple `gm-on-*event*` handlers, but only one for each type of event.
 * For events that have an underscore in their name, such as
 * 'position_changed', write it as 'gm-on-position-changed'.
 */

/**
 * @ngdoc event
 * @name angulargm.directive:gmPolylines#gmPolylinesUpdate
 * @eventOf angulargm.directive:gmPolylines
 * @eventType listen on current gmPolylines scope
 *
 * @description Manually tell the `gmPolylines` directive to update the polylines.
 * This is useful to tell the directive when an object from `gm-objects` is
 * mutated--`gmPolylines` can not pick up on such changes automatically.
 *
 * @param {string} objects Not required. The name of the scope variable which
 * holds the objects to update polylines for, i.e. what you set `gm-objects` to.
 * It is useful because there may be multiple instances of the `gmPolylines`
 * directive. If not specified, all instances of `gmPolylines` which are child
 * scopes will update their polylines.
 *
 * @example
 * ```js
 * $scope.$broadcast('gmPolylinesUpdate', 'myObjects');
 * ```
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

  directive('gmPolylines', ['$parse', '$compile', '$timeout', '$log', 'angulargmUtils', 'angulargmShape',
    function ($parse, $compile, $timeout, $log, angulargmUtils, angulargmShape) {
    /** aliases */
    var objToLatLng = angulargmUtils.objToLatLng;

    function link(scope, element, attrs, controller) {
      if (!('gmPath' in attrs)) {
        throw 'gmPath attribute required';
      }

      var polylineOptions = function(object) {
        var lineLatLngs = scope.gmPath({object: object});
        var path = [];

        angular.forEach(lineLatLngs, function(latlng) {
          var position = objToLatLng(latlng);
          if (position == null) {
              $log.warn('Unable to generate lat/lng from ', latlng);
              return;
          }
          path.push(position);
        });

        var polylineOptions = scope.gmPolylineOptions({object: object});
        var options = {};
        angular.extend(options, polylineOptions, {path: path});
        return options;
      };

      angulargmShape.createShapeDirective(
        'polyline', scope, attrs, controller, polylineOptions
      );
    }

    return {
      restrict: 'AE',
      priority: 100,
      scope: {
        gmObjects: '&',
        gmId: '&',
        gmPath: '&',
        gmPolylineOptions: '&',
        gmEvents: '&'
      },
      require: '^gmMap',
      link: link
    };
  }]);
})();
