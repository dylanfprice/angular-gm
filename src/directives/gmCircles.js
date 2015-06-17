/**
 * @ngdoc directive
 * @name angulargm.directive:gmCircles
 * @element ANY
 *
 * @description
 * A directive for adding circles to a `gmMap`. You may have multiple per `gmMap`.
 *
 * To use, you specify an array of custom objects and tell the directive how to
 * extract the center point for the circle from them. A circle will be created
 * for each of your objects. If you assign a new array to your scope variable
 * or change the array's length, the circles will also update.  The one case
 * where `gmCircles` can not automatically detect changes to your objects is
 * when you mutate objects in the array. To inform the directive of such
 * changes, see the `gmCirclesUpdate` event below.
 *
 * Only the `gm-objects`, `gm-id` and `gm-circle-center` attributes are required.
 *
 * @param {expression} gm-objects an array of objects in the current scope.
 * These can be any objects you wish to attach to circles, the only requirement
 * is that they have a uniform method of accessing an id and a center.
 *
 * @param {expression} gm-circle-center an angular expression that given an object
 * from `gm-objects`, evaluates to an object with lat and lng
 * properties. Your object can be accessed through the variable `object`.  For
 * example, if your controller has
 * ```js
 * ...
 * $scope.myObjects = [
 *   { id: 0, center: { lat: 5, lng: 5}},
 *   { id: 1, center: { lat: 6, lng: 6}}
 * ]
 * ...
 * ```
 * then in the `gm-circles` directive you would put
 * ```js
 * ...
 * gm-objects="myObjects"
 * gm-circle-center="object.center"
 * ...
 * ```
 *
 * @param {expression} gm-circle-options an angular expression that given
 * an object from `gm-objects`, evaluates to a
 * [google.maps.CircleOptions](https://developers.google.com/maps/documentation/javascript/reference#CircleOptions)
 * object.  Your object can be accessed through the variable `object`. If
 * unspecified, google maps api defaults will be used.
 *
 * @param {expression} gm-events a variable in the current scope that is used to
 * simulate events on circles. Setting this variable to an object of the form
 * ```js
 *     [
 *       {
 *         event: 'click',
 *         ids: [id1, ...]
 *       },
 *       ...
 *     ]
 * ```
 * will generate the named events on the circles with the given ids, if a
 * circle with each id exists. Note: when setting the `gm-events` variable, you
 * must set it to a new object for the changes to be detected.  Code like
 * ```js
 * myEvents[0]["ids"] = [0]
 * ```
 * will not work.
 *
 *
 * @param {expression} gm-on-*event* an angular expression which evaluates to
 * an event handler. This handler will be attached to each circle's \*event\*
 * event.  The variables 'object' and 'circle' evaluate to your object and the
 * [google.maps.circle](https://developers.google.com/maps/documentation/javascript/reference#Circle),
 * respectively. For example:
 * ```html
 * gm-on-click="myClickFn(object, circle)"
 * ```
 * will call your `myClickFn` whenever a circle is clicked.  You may have
 * multiple `gm-on-*event*` handlers, but only one for each type of event.
 * For events that have an underscore in their name, such as
 * 'position_changed', write it as 'gm-on-position-changed'.
 */

/**
 * @ngdoc event
 * @name angulargm.directive:gmCircles#gmCirclesUpdate
 * @eventOf angulargm.directive:gmCircles
 * @eventType listen on current gmCircles scope
 *
 * @description Manually tell the `gmCircles` directive to update the circles.
 * This is useful to tell the directive when an object from `gm-objects` is
 * mutated--`gmCircles` can not pick up on such changes automatically.
 *
 * @param {string} objects Not required. The name of the scope variable which
 * holds the objects to update circles for, i.e. what you set `gm-objects` to.
 * It is useful because there may be multiple instances of the `gmCircles`
 * directive. If not specified, all instances of `gmCircles` which are child
 * scopes will update their circles.
 *
 * @example
 * ```js
 * $scope.$broadcast('gmCirclesUpdate', 'myObjects');
 * ```
 */

/**
 * @ngdoc event
 * @name angulargm.directive:gmCircles#gmCirclesRedraw
 * @eventOf angulargm.directive:gmCircles
 * @eventType listen on current gmCircles scope
 *
 * @description Force the gmCircles directive to clear and redraw all circles.
 *
 * @param {string} objects Not required. The name of the scope variable which
 * holds the objects to redraw circles for, i.e. what you set `gm-objects` to.
 * It is useful because there may be multiple instances of the `gmCircles`
 * directive. If not specified, all instances of gmCircles which are child
 * scopes will redraw their circles.
 *
 * @example
 * ```js
 * $scope.$broadcast('gmCirclesRedraw', 'myObjects');
 * ```
 */

/**
 * @ngdoc event
 * @name angulargm.directive:gmCircles#gmCirclesUpdated
 * @eventOf angulargm.directive:gmCircles
 * @eventType emit on current gmCircles scope
 *
 * @description Emitted when circles are updated.
 *
 * @param {string} objects the name of the scope variable which holds the
 * objects the gmCircles directive was constructed with. This is what
 * `gm-objects` was set to.
 *
 * @example
 * ```js
 * $scope.$on('gmCirclesUpdated', function(event, objects) {
 *     if (objects === 'myObjects') {
 *       ...
 *     }
 * });
 * ```
 */

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
