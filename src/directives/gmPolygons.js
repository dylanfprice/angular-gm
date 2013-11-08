/**
 * @ngdoc directive
 * @name angulargm.directive:gmPolygons
 * @element ANY
 *
 * @description
 * A directive for adding polygons to a `gmMap`. You may have multiple per `gmMap`.
 *
 * To use, you specify an array of custom objects and tell the directive how to
 * extract location data from them. A polygon will be created for each of your
 * objects. If you assign a new array to your scope variable or change the
 * array's length, the polygons will also update.
 *
 * Only the `gm-objects` and `gm-get-path` attributes are required.
 *
 * @param {expression} gm-objects an array of objects in the current scope.
 * These can be any objects you wish to attach to polygons, the only requirement
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
 * then in the `gm-polygons` directive you would put
 * ```js
 * ...
 * gm-objects="myObjects"
 * gm-get-path="object.path"
 * ...
 * ```
 *
 * @param {expression} gm-get-polygon-options an angular expression that given
 * an object from `gm-objects`, evaluates to a
 * [google.maps.PolygonOptions](https://developers.google.com/maps/documentation/javascript/reference#PolygonOptions)
 * object.  Your object can be accessed through the variable `object`. If
 * unspecified, google maps api defaults will be used.
 *
 */

/**
 * @ngdoc event
 * @name angulargm.directive:gmPolygons#gmPolygonsRedraw
 * @eventOf angulargm.directive:gmPolygons
 * @eventType listen on current gmPolygons scope
 *
 * @description Force the gmPolygons directive to clear and redraw all polygons.
 *
 * @param {string} objects Not required. The name of the scope variable which
 * holds the objects to redraw polygons for, i.e. what you set `gm-objects` to.
 * It is useful because there may be multiple instances of the `gmPolygons`
 * directive. If not specified, all instances of gmPolygons which are child
 * scopes will redraw their polygons.
 *
 * @example
 * ```js
 * $scope.$broadcast('gmPolygonsRedraw', 'myObjects');
 * ```
 */

/**
 * @ngdoc event
 * @name angulargm.directive:gmPolygons#gmPolygonsUpdated
 * @eventOf angulargm.directive:gmPolygons
 * @eventType emit on current gmPolygons scope
 *
 * @description Emitted when polygons are updated.
 *
 * @param {string} objects the name of the scope variable which holds the
 * objects the gmPolygons directive was constructed with. This is what
 * `gm-objects` was set to.
 *
 * @example
 * ```js
 * $scope.$on('gmPolygonsUpdated', function(event, objects) {
 *     if (objects === 'myObjects') {
 *       ...
 *     }
 * });
 * ```
 */

(function () {
    'use strict';

    angular.module('AngularGM').

        directive('gmPolygons', ['$parse', '$compile', '$timeout', '$log', 'angulargmUtils',
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

                    // fn for updating polygons from objects
                    var updatePolygons = function(scope, objects) {
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
                            var polygonOptions = scope.gmGetPolygonOptions({object: object});
                            objectHash[hash] = object;

                            // check if the polygon exists first (methods needs to be created)
                            if (!controller.hasPolygon(scope.$id, hash)) {
                                var options = {};
                                angular.extend(options, polygonOptions, {path: lineLatLngs});

                                controller.addPolygon(scope.$id, options);
                                var polygon = controller.getPolygon(scope.$id, hash);

                                angular.forEach(handlers, function(handler, event) {
                                    controller.addListener(polygon, event, function() {
                                        $timeout(function() {
                                            handler(scope.$parent.$parent, {
                                                object: object,
                                                polygon: polygon
                                            });
                                        });
                                    });
                                });
                            }
                        });

                        // remove 'orphaned' polygons
                        controller.forEachPolygonInScope(scope.$id, function(polygon, hash) {
                            if (!(hash in objectHash)) {
                                controller.removePolygonByHash(scope.$id, hash);
                            }
                        });

                        scope.$emit('gmPolygonsUpdated', attrs.gmObjects);
                    }; // end updatePolygons()

                    scope.$watch('gmObjects().length', function(newValue, oldValue) {
                        if (newValue != null && newValue !== oldValue) {
                            updatePolygons(scope, scope.gmObjects());
                        }
                    });

                    scope.$watch('gmObjects()', function(newValue, oldValue) {
                        if (undefined !== newValue && newValue !== oldValue) {
                            updatePolygons(scope, scope.gmObjects());
                        }
                    });

                    scope.$on('gmPolygonsRedraw', function(event, objectsName) {
                        if (undefined === objectsName || objectsName === attrs.gmObjects) {
                            updatePolygons(scope);
                            updatePolygons(scope, scope.gmObjects());
                        }
                    });

                    $timeout(angular.bind(null, updatePolygons, scope, scope.gmObjects()));
                }

                return {
                    restrict: 'AE',
                    priority: 100,
                    scope: {
                        gmObjects: '&',
                        gmGetPath: '&',
                        gmGetPolygonOptions: '&',
                    },
                    require: '^gmMap',
                    link: link
                };
            }]);
})();
