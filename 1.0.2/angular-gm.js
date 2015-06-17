/**
 * AngularGM - Google Maps Directives for AngularJS
 * @version v1.0.2 - 2015-06-17
 * @link http://dylanfprice.github.com/angular-gm
 * @author Dylan Price <the.dylan.price@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
/**
 * @doc module
 * @name angulargm
 *
 * @description
 * Module for embedding Google Maps into AngularJS applications.
 *
 * # Example Plunkers ([fullscreen](http://embed.plnkr.co/PYDYjVuRHaJpdntoJtqL))
 *
 * <iframe style="width: 100%; height: 400px" src="http://embed.plnkr.co/PYDYjVuRHaJpdntoJtqL" frameborder="0" allowfullscreen="allowfullscreen">
 * </iframe>
 *
 * Author: Dylan Price <the.dylan.price@gmail.com>
 */
(function() {
'use strict';

  angular.module('AngularGM', []).

  /**
   * @ngdoc service
   * @name angulargm.service:angulargmDefaults
   *
   * @description
   * Default configuration.
   *
   * To provide your own default config, use the following
   * ```js
   * angular.module('myModule').config(function($provide) {
   *   $provide.decorator('angulargmDefaults', function($delegate) {
   *     return angular.extend($delegate, {
   *       'precision': 3,
   *       'markerConstructor': myCustomMarkerConstructor,
   *       'polylineConstructor': myCustomPolylineConstructor,
   *       'mapOptions': {
   *         center: new google.maps.LatLng(55, 111),
   *         mapTypeId: google.maps.MapTypeId.SATELLITE,
   *         ...
   *       }
   *     });
   *   });
   * });
   * ```
   */
  factory('angulargmDefaults', function() {
    return {
      'precision': 3,
      'markerConstructor': google.maps.Marker,
      'polylineConstructor': google.maps.Polyline,
      'circleConstructor': google.maps.Circle,
      'mapOptions': {
        zoom : 8,
        center : new google.maps.LatLng(46, -120),
        mapTypeId : google.maps.MapTypeId.ROADMAP
      }
    };
  });

})();

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
/**
 * @ngdoc directive
 * @name angulargm.directive:gmInfoWindow
 * @element ANY
 *
 * @description
 * A directive for creating a google.maps.InfoWindow.
 *
 * @param {expression} gm-info-window scope variable to store the
 * [google.maps.InfoWindow](https://developers.google.com/maps/documentation/javascript/reference#InfoWindow)
 * in. Does not have to already exist.
 *
 * @param {expression} gm-info-window-options object in the current scope
 * that is a
 * [google.maps.InfoWindowOptions](https://developers.google.com/maps/documentation/javascript/reference#InfoWindowOptions)
 * object. If unspecified, google maps api defaults will be used.
 *
 * @param {expression} gm-on-*event* an angular expression which evaluates to an
 * event handler. This handler will be attached to the InfoWindow's \*event\*
 * event.  The variable `infoWindow` evaluates to the InfoWindow.  For example:
 * ```html
 * gm-on-closeclick="myCloseclickFn(infoWindow)"
 * ```
 * will call your myCloseclickFn whenever the InfoWindow is clicked closed. You
 * may have multiple `gm-on-*event*` handlers, but only one for each type of
 * event.
 */
(function () {
'use strict';

  angular.module('AngularGM').

  /*
   * Much of this code is taken from the Angular UI team, see:
   * https://github.com/angular-ui/ui-map/blob/master/ui-map.js
   */
  directive('gmInfoWindow',
    ['$parse', '$compile', '$timeout', 'angulargmUtils',
    function ($parse, $compile, $timeout, angulargmUtils) {

    /** aliases */
    var getEventHandlers = angulargmUtils.getEventHandlers;

    function link(scope, element, attrs, controller) {
      var opts = angular.extend({}, scope.$eval(attrs.gmInfoWindowOptions));
      opts.content = element[0];
      var model = $parse(attrs.gmInfoWindow);
      var infoWindow = model(scope);

      if (!infoWindow) {
        infoWindow = new google.maps.InfoWindow(opts);
        model.assign(scope, infoWindow);
      }

      var handlers = getEventHandlers(attrs);

      // set up info window event handlers
      angular.forEach(handlers, function(handler, event) {
        google.maps.event.addListener(infoWindow, event, function() {
          $timeout(function() {
            handler(scope, {
              infoWindow: infoWindow
            });
          });
        });
      });
    }

    return {
      restrict: 'A',
      priority: 100,
      scope: false,
      link: link
    };

  }]);
})();

/**
 * @ngdoc directive
 * @name angulargm.directive:gmMap
 * @element ANY
 *
 * @description
 * A directive for embedding google maps into your app.
 *
 * `gm-map-id` is required. The `gm-center`, `gm-zoom`, `gm-bounds`, and
 * `gm-map-type-id` variables do not have to exist in the current scope--they
 * will be created if necessary. All three have bi-directional association,
 * i.e.  drag or zoom the map and they will update, update them and the map
 * will change.  However, any initial state of these three variables will be
 * ignored.
 *
 * If you need to get a handle on the google.maps.Map object, see
 * {@link angulargm.service:angulargmContainer angulargmContainer}
 *
 * @param {expression} gm-map-id angular expression that evaluates to a unique
 * string id for the map, e.g. `'map_canvas'` or `myMapId` where myMapId is a
 * variable in the current scope. This allows you to have multiple
 * maps/instances of the directive.
 *
 *
 * @param {expression} gm-center center variable in the current scope.  The
 * value will be a google.maps.LatLng object.
 *
 *
 * @param {expression} gm-zoom zoom variable in the current scope.  Value will
 * be an integer.
 *
 *
 * @param {expression} gm-bounds bounds variable in the current scope.  Value
 * will be a google.maps.LatLngBounds object.
 *
 *
 * @param {expression} gm-map-type-id mapTypeId variable in the current scope.
 * Value will be a string.
 *
 *
 * @param {expression} gm-map-options object in the current scope that is a
 * google.maps.MapOptions object. If unspecified, will use the values in
 * angulargmDefaults.mapOptions. {@link angulargm.service:angulargmDefaults angulargmDefaults} is a service, so it is
 * both injectable and overrideable (using $provide.decorator).
 *
 * @param {expression} gm-on-*event* an angular expression which evaluates to
 * an event handler. This handler will be attached to each marker's \*event\*
 * event.  The variables 'map' and 'event' evaluate to the map and the
 * [google.maps.MouseEvent](https://developers.google.com/maps/documentation/javascript/reference#MouseEvent),
 * respectively. The map is always passed in, but the MouseEvent is only passed in if the event emits it.  For example:
 * ```html
 * gm-on-click="myClickFn(map, event)"
 * ```
 * will call your `myClickFn` whenever the map is clicked.  You may have
 * multiple `gm-on-*event*` handlers, but only one for each type of event.  For events that have an underscore in their
 * name, such as 'center_changed', write it as 'gm-on-center-changed'.
 *
 *
 */

/**
 * @ngdoc event
 * @name angulargm.directive:gmMap#gmMapResize
 * @eventOf angulargm.directive:gmMap
 * @eventType listen on current gmMap scope
 *
 * @description Alias for google.maps.event.trigger(map, 'resize')
 *
 * @param {string} mapId Required. The id of your map.
 * @example
 * ```js
 * $scope.$broadcast('gmMapResize', 'myMapId')
 * ```
 */

/**
 * @ngdoc event
 * @name angulargm.directive:gmMap#gmMapIdle
 * @eventOf angulargm.directive:gmMap
 * @eventType emit on current gmMap scope
 *
 * @description Emitted when the map is finished loading (when the map fires
 * the 'idle' event).
 *
 * @param {string} mapId the id of the map which finished loading.
 *
 * @example
 * ```js
 * $scope.$on('gmMapIdle', function(event, mapId) {
 *     if (mapId === 'myMapId') {
 *       ...
 *     }
 * });
 * ```
 */

(function () {
'use strict';

  angular.module('AngularGM').


  directive('gmMap', ['$timeout', 'angulargmUtils', 'debounce', function ($timeout, angulargmUtils, debounce) {

    /** aliases **/
    var getEventHandlers = angulargmUtils.getEventHandlers;

    /** link function **/
    function link(scope, element, attrs, controller) {
      // initialize scope
      if (!angular.isDefined(scope.gmCenter)) {
        scope.center = {};
      }
      if (!angular.isDefined(scope.gmBounds)) {
        scope.bounds = {};
      }

      // Make sure gmMapId is defined
      // Note: redundant check in MapController. Can't hurt.
      if (!angular.isDefined(scope.gmMapId)) {
        throw 'angulargm must have non-empty gmMapId attribute';
      }

      // Check what's defined in attrs
      // Note: this is also redundant since angular will throw an exception if
      // these attributes are not set. I may make these optional in the future
      // (pending angular support).
      var hasCenter = false;
      var hasZoom = false;
      var hasBounds = false;
      var hasMapTypeId = false;

      if (attrs.hasOwnProperty('gmCenter')) {
        hasCenter = true;
      }
      if (attrs.hasOwnProperty('gmZoom')) {
        hasZoom = true;
      }
      if (attrs.hasOwnProperty('gmBounds')) {
        hasBounds = true;
      }
      if (attrs.hasOwnProperty('gmMapTypeId')) {
        hasMapTypeId = true;
      }

      var _updateScope = function() {
        $timeout(function () {
          if (hasCenter || hasZoom || hasBounds || hasMapTypeId) {
            scope.$apply(function (s) {
              if (hasCenter) {
                scope.gmCenter = controller.center;
              }
              if (hasZoom) {
                scope.gmZoom = controller.zoom;
              }
              if (hasBounds) {
                var b = controller.bounds;
                if (b) {
                  scope.gmBounds = b;
                }
              }
              if (hasMapTypeId) {
                scope.gmMapTypeId = controller.mapTypeId;
              }
            });
          }
        });
      };

      var updateScope = debounce(_updateScope, 100);

      // Add event listeners to the map
      controller.addMapListener('drag', updateScope);
      controller.addMapListener('zoom_changed', updateScope);
      controller.addMapListener('center_changed', updateScope);
      controller.addMapListener('bounds_changed', updateScope);
      controller.addMapListener('maptypeid_changed', updateScope);
      controller.addMapListener('resize', updateScope);

      // Add user supplied callbacks
      var map = controller.getMap(attrs.gmMapId);
      var handlers = getEventHandlers(attrs); // map events -> handlers
      angular.forEach(handlers, function(handler, event) {
        controller.addMapListener(event, function(ev) {
          // pass the map in
          var locals = {
            map: map
          };
          // And optionally a MouseEvent object if it exists
          if (ev !== undefined) {
            locals.event = ev;
          }

          $timeout(function() {
            handler(scope.$parent, locals);
          });
        });
      });



      if (hasCenter) {
        scope.$watch('gmCenter', function (newValue, oldValue) {
          var changed = (newValue !== oldValue);
          if (changed && !controller.dragging) {
            var latLng = newValue;
            if (latLng)
              controller.center = latLng;
          }
        }, true);
      }

      if (hasZoom) {
        scope.$watch('gmZoom', function (newValue, oldValue) {
          var ok = (newValue != null && !isNaN(newValue));
          if (ok && newValue !== oldValue) {
            controller.zoom = newValue;
          }
        });
      }

      if (hasBounds) {
        scope.$watch('gmBounds', function(newValue, oldValue) {
          var changed = (newValue !== oldValue);
          if (changed && !controller.dragging) {
            var bounds = newValue;
            if (bounds)
              controller.bounds = bounds;
          }
        });
      }

      if (hasMapTypeId) {
        scope.$watch('gmMapTypeId', function(newValue, oldValue) {
          var changed = (newValue !== oldValue);
          if (changed && newValue) {
            controller.mapTypeId = newValue;
          }
        });
      }

      scope.$on('gmMapResize', function(event, gmMapId) {
        if (scope.gmMapId() === gmMapId) {
          controller.mapTrigger('resize');
        }
      });

      controller.addMapListenerOnce('idle', function() {
        scope.$emit('gmMapIdle', scope.gmMapId());
      });
      controller.mapTrigger('resize');
    }


    return {
      restrict: 'AE',
      priority: 100,
      template: '<div>' +
                  '<div id="" style="width:100%;height:100%;"></div>' +
                  '<div ng-transclude></div>' +
                '</div>',
      transclude: true,
      replace: true,
      scope: {
        gmCenter: '=',
        gmZoom: '=',
        gmBounds: '=',
        gmMapTypeId: '=',
        gmMapOptions: '&',
        gmMapId: '&'
      },
      controller: 'angulargmMapController',
      link: link
    };
  }]);
})();

/**
 * @ngdoc directive
 * @name angulargm.directive:gmMarkers
 * @element ANY
 *
 * @description
 * A directive for adding markers to a `gmMap`. You may have multiple per `gmMap`.
 *
 * To use, you specify an array of custom objects and tell the directive how to
 * extract an id and position from them. A marker will be created for each of
 * your objects. If you assign a new array to your scope variable or change the
 * array's length (i.e. add or remove an object), the markers will also update.
 * The one case where `gmMarkers` can not automatically detect changes to your
 * objects is when you mutate objects in the array. To inform the directive of
 * such changes, see the `gmMarkersUpdate` event below.
 *
 * Only the `gm-objects`, `gm-id` and `gm-position` attributes are required.
 *
 * @param {expression} gm-objects an array of objects in the current scope.
 * These can be any objects you wish to attach to markers, the only requirement
 * is that they have a uniform method of accessing an id and a position.
 *
 * @param {expression} gm-id an angular expression that given an object from
 * `gm-objects`, evaluates to a unique identifier for that object. Your object
 * can be accessed through the variable `object`. See `gm-position` below for
 * an example.
 *
 * @param {expression} gm-position an angular expression that given an object from
 * `gm-objects`, evaluates to an object with lat and lng properties. Your
 * object can be accessed through the variable `object`.  For example, if
 * your controller has
 * ```js
 * ...
 * $scope.myObjects = [
 *   { id: 0, location: { lat: 5, lng: 5} },
 *   { id: 1, location: { lat: 6, lng: 6} }
 * ]
 * ...
 * ```
 * then in the `gm-markers` directive you would put
 * ```js
 * ...
 * gm-objects="myObjects"
 * gm-id="object.id"
 * gm-position="{ lat: object.location.lat, lng: object.location.lng }"
 * ...
 * ```
 *
 *
 * @param {expression} gm-marker-options an angular expression that given
 * an object from `gm-objects`, evaluates to a
 * [google.maps.MarkerOptions](https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions)
 * object.  Your object can be accessed through the variable `object`. If
 * unspecified, google maps api defaults will be used.
 *
 *
 * @param {expression} gm-events a variable in the current scope that is used to
 * simulate events on markers. Setting this variable to an object of the form
 * ```js
 *     [
 *       {
 *         event: 'click',
 *         ids: [id1, ...]
 *       },
 *       ...
 *     ]
 * ```
 * will generate the named events on the markers with the given ids, if a
 * marker with each id exists. Note: when setting the `gm-events` variable, you
 * must set it to a new object for the changes to be detected.  Code like
 * ```js
 * myEvents[0]["ids"] = [0]
 * ```
 * will not work.
 *
 *
 * @param {expression} gm-on-*event* an angular expression which evaluates to
 * an event handler. This handler will be attached to each marker's \*event\*
 * event.  The variables 'object' and 'marker' evaluate to your object and the
 * [google.maps.Marker](https://developers.google.com/maps/documentation/javascript/reference#Marker),
 * respectively. For example:
 * ```html
 * gm-on-click="myClickFn(object, marker)"
 * ```
 * will call your `myClickFn` whenever a marker is clicked.  You may have
 * multiple `gm-on-*event*` handlers, but only one for each type of event.
 * For events that have an underscore in their name, such as
 * 'position_changed', write it as 'gm-on-position-changed'.
 */

/**
 * @ngdoc event
 * @name angulargm.directive:gmMarkers#gmMarkersUpdate
 * @eventOf angulargm.directive:gmMarkers
 * @eventType listen on current gmMarkers scope
 *
 * @description Manually tell the `gmMarkers` directive to update the markers.
 * This is useful to tell the directive when an object from `gm-objects` is
 * mutated--`gmMarkers` can not pick up on such changes automatically.
 *
 * @param {string} objects Not required. The name of the scope variable which
 * holds the objects to update markers for, i.e. what you set `gm-objects` to.
 * It is useful because there may be multiple instances of the `gmMarkers`
 * directive. If not specified, all instances of `gmMarkers` which are child
 * scopes will update their markers.
 *
 * @example
 * ```js
 * $scope.$broadcast('gmMarkersUpdate', 'myObjects');
 * ```
 */

/**
 * @ngdoc event
 * @name angulargm.directive:gmMarkers#gmMarkersRedraw
 * @eventOf angulargm.directive:gmMarkers
 * @eventType listen on current gmMarkers scope
 *
 * @description Force the `gmMarkers` directive to clear and redraw all markers.
 *
 * @param {string} objects Not required. The name of the scope variable which
 * holds the objects to redraw markers for, i.e. what you set `gm-objects` to.
 * It is useful because there may be multiple instances of the `gmMarkers`
 * directive. If not specified, all instances of `gmMarkers` which are child
 * scopes will redraw their markers.
 *
 * @example
 * ```js
 * $scope.$broadcast('gmMarkersRedraw', 'myObjects');
 * ```
 */

/**
 * @ngdoc event
 * @name angulargm.directive:gmMarkers#gmMarkersUpdated
 * @eventOf angulargm.directive:gmMarkers
 * @eventType emit on current gmMarkers scope
 *
 * @description Emitted when markers are updated.
 *
 * @param {string} objects the name of the scope variable which holds the
 * objects the `gmMarkers` directive was constructed with. This is what
 * `gm-objects` was set to.
 *
 * @example
 * ```js
 * $scope.$on('gmMarkersUpdated', function(event, objects) {
 *     if (objects === 'myObjects') {
 *       ...
 *     }
 * });
 * ```
 */

(function () {
'use strict';

  angular.module('AngularGM').

  directive('gmMarkers',
    ['$log', '$parse', '$timeout', 'angulargmUtils', 'angulargmShape',
    function($log, $parse, $timeout, angulargmUtils, angulargmShape) {

    /** aliases */
    var objToLatLng = angulargmUtils.objToLatLng;

    function link(scope, element, attrs, controller) {
      // check marker attrs
      if (!('gmPosition' in attrs)) {
        throw 'gmPosition attribute required';
      }

      var markerOptions = function(object) {
        var latLngObj = scope.gmPosition({object: object});
        var position = objToLatLng(latLngObj);
        if (position == null) {
          return null;
        }

        var markerOptions = scope.gmMarkerOptions({object: object});
        var options = {};
        angular.extend(options, markerOptions, {position: position});
        return options;
      };

      angulargmShape.createShapeDirective(
        'marker', scope, attrs, controller, markerOptions
      );
    }

    return {
      restrict: 'AE',
      priority: 100,
      scope: {
        gmObjects: '&',
        gmId: '&',
        gmPosition: '&',
        gmMarkerOptions: '&',
        gmEvents: '&'
      },
      require: '^gmMap',
      link: link
    };
  }]);
})();

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

/**
 * @ngdoc service
 * @name angulargm.service:angulargmContainer
 *
 * @description
 * A container which maps mapIds to google.maps.Map instances, and additionally
 * allows getting a promise of a map for custom configuration of the map.
 *
 * If you want a handle to the map, you should use the `getMapPromise(mapId)`
 * method so you can guarantee the map will be initialized. For example,
 *
 * ```js
 * angular.module('myModule').
 *
 * run(function(angulargmContainer) {
 *   var gmapPromise = angulargmContainer.getMapPromise('myMapid');
 *
 *   gmapPromise.then(function(gmap) {
 *     // google map configuration here
 *   });
 * });
 * ```
 */
(function () {
'use strict';

  angular.module('AngularGM').

  factory('angulargmContainer', ['$q', function($q) {
    var maps = {};
    var defers = {};

    /**
     * Add a map to the container.
     * @param {string} mapId the unique identifier for the map
     * @param {google.maps.Map} map the google map
     * @throw if there is already a map with mapId, or if map is not a
     *   google.maps.Map
     */
    function addMap(mapId, map) {
      if (!(map instanceof google.maps.Map)) {
        throw 'map not a google.maps.Map: ' + map;
      } else if (mapId in maps) {
        throw 'already contain map with id ' + mapId;
      }
      maps[mapId] = map;
      if (mapId in defers) {
        defers[mapId].resolve(map);
      }
    }

    /**
     * Get a map from the container.
     * @param {string} mapId the unique id of the map
     * @return {google.maps.Map|undefined} the map, or undefined if there is no
     *   map for mapId
     */
    function getMap(mapId) {
      return maps[mapId];
    }

    /**
     * Returns a promise of a map for the given mapId
     * @param {string} mapId the unique id of the map that may or may not have
     *   been created yet
     * @return {angular.q.promise} a promise of a map that will be resolved
     *   when the map is added
     */
    function getMapPromise(mapId) {
      var defer = defers[mapId] || $q.defer();
      var map = getMap(mapId);
      defers[mapId] = defer;
      if (map !== undefined) {
        defer.resolve(map);
      }
      return defer.promise;
    }

    /**
     * Removes map with given mapId from this container, and deletes the map.
     * In order for this to work you must ensure there are no references to the
     * map object. Note: this will likely cause a memory leak, see
     * http://stackoverflow.com/questions/10485582/what-is-the-proper-way-to-destroy-a-map-instance
     *
     * @param {string} mapId the unique id of the map to remove
     */
    function removeMap(mapId) {
      if (mapId in maps) {
        delete maps[mapId];
      }
      if (mapId in defers) {
        delete defers[mapId];
      }
    }

    /**
     * Removes all maps and unresolved map promises. Only for testing, see
     * #removeMap(mapId).
     */
    function clear() {
      maps = {};
      defers = {};
    }

    return {
      addMap: addMap,
      getMap: getMap,
      getMapPromise: getMapPromise,
      removeMap: removeMap,
      clear: clear
    };
  }]);
})();

/**
 * @ngdoc service
 * @name angulargm.service:angulargmShape
 *
 * @description
 * Directive functions for map shapes (marker, polyline, etc.)
 */
(function () {
'use strict';

  angular.module('AngularGM').

  factory('angulargmShape',
    ['$timeout', 'angulargmUtils',
    function($timeout, angulargmUtils) {

    /**
     * Check required attributes of a shape.
     */
    function checkRequiredAttributes(attrs) {
      if (!('gmObjects' in attrs)) {
        throw 'gmObjects attribute required';
      } else if (!('gmId' in attrs)) {
        throw 'gmId attribute required';
      }
    }

    /**
     * Create a mapping from object id -> object.
     * The object id is retrieved using scope.gmId
     */
    function _generateObjectCache(scope, objects) {
      var objectCache = {};
      angular.forEach(objects, function(object) {
        // cache objects for quick access
        var id = scope.gmId({object: object});
        objectCache[id] = object;
      });
      return objectCache;
    }

    /**
     * Create new shapes and add them to the map for objects which are not
     * currently on the map.
     */
    function _addNewElements(type, scope, controller, handlers, objectCache, optionsFn) {
      angular.forEach(objectCache, function(object, id) {
        var element = controller.getElement(type, scope.$id, id);

        var options = optionsFn(object);
        if (options == null) {
          return;
        }

        if (element) {
          controller.updateElement(type, scope.$id, id, options);
        } else {
          controller.addElement(type, scope.$id, id, options);
          element = controller.getElement(type, scope.$id, id);

          // set up element event handlers
          angular.forEach(handlers, function(handler, event) {
            controller.addListener(element, event, function() {
              $timeout(function() {
                var context = {object: object};
                context[type] = element;
                if ((angular.version.major <= 1) && (angular.version.minor <= 2)) {
                  // scope is this directive's isolate scope
                  // scope.$parent is the scope of ng-transclude
                  // scope.$parent.$parent is the one we want
                  handler(scope.$parent.$parent, context);
                } else {
                  handler(scope.$parent.$parent.$parent , context);
                }    
              });
            });
          });
        }
      });
    }

    /**
     * Remove shape elements from the map which are no longer in objects.
     */
    function _removeOrphanedElements(type, scope, controller, objectCache) {
      var orphaned = [];

      controller.forEachElementInScope(type, scope.$id, function(element, id) {
        if (!(id in objectCache)) {
          orphaned.push(id);
        }
      });

      angular.forEach(orphaned, function(id) {
        controller.removeElement(type, scope.$id, id);
      });
    }

    /**
     * _formatEventName('gmShapesUpdated', 'marker') -> 'gmMarkersUpdated'
     */
    function _formatEventName(template, type) {
      var uppercasePluralType = type.charAt(0).toUpperCase() + type.slice(1) + 's';
      return template.replace('Shapes', uppercasePluralType);
    }

    /**
     * Attach necessary watchers and listeners to scope to deal with:
     * - updating objects
     * - handling gmEvents
     * - listening for events
     */
    function _attachEventListeners(type, scope, attrs, controller, updateElements) {

      // watch objects
      scope.$watch('gmObjects().length', function(newValue, oldValue) {
        if (newValue != null && newValue !== oldValue) {
          updateElements(scope, scope.gmObjects());
        }
      });

      scope.$watch('gmObjects()', function(newValue, oldValue) {
        if (newValue != null && newValue !== oldValue) {
          updateElements(scope, scope.gmObjects());
        }
      });

      // watch gmEvents
      scope.$watch('gmEvents()', function(newValue, oldValue) {
        if (newValue != null && newValue !== oldValue) {
          angular.forEach(newValue, function(eventObj) {
            var event = eventObj.event;
            var ids = eventObj.ids;
            angular.forEach(ids, function(id) {
              var element = controller.getElement(type, scope.$id, id);
              if (element != null) {
                $timeout(angular.bind(this, controller.trigger, element, event));
              }
            });
          });
        }
      });

      scope.$on(_formatEventName('gmShapesRedraw', type), function(event, objectsName) {
        if (objectsName == null || objectsName === attrs.gmObjects) {
          updateElements(scope);
          updateElements(scope, scope.gmObjects());
        }
      });

      scope.$on(_formatEventName('gmShapesUpdate', type), function(event, objectsName) {
        if (objectsName == null || objectsName === attrs.gmObjects) {
          updateElements(scope, scope.gmObjects());
        }
      });
    }

    /**
     * Takes care of setting up the directive for the given type of shape.
     * Assumes the following directive scope:
     *   scope: {
     *     gmId: '&',
     *     gmObjects: '&',
     *     gmEvents: '&'
     *   },
     *
     * And the angulargmMapController:
     *   require: '^gmMap',
     *
     * Also supports the following attributes:
     *   gmOn* (though some of this knowledge is in angulargmUtils as well)
     *
     * As well as the following events
     *   gmShapesUpdated
     *   gmShapesRedraw
     *
     * (e.g. gmMarkersUpdated and gmMarkersRedraw)
     *
     * See gmMarkers for a complete example.
     */
    function createShapeDirective(type, scope, attrs, controller, elementOptions) {
      checkRequiredAttributes(attrs);

      var updateElements = function(scope, objects) {
        var objectCache = _generateObjectCache(scope, objects);
        var handlers = angulargmUtils.getEventHandlers(attrs); // map events -> handlers

        _addNewElements(
          type, scope, controller, handlers,
          objectCache, elementOptions
        );

        _removeOrphanedElements(type, scope, controller, objectCache);

        scope.$emit(_formatEventName('gmShapesUpdated', type), attrs.gmObjects);
      };

      _attachEventListeners(type, scope, attrs, controller, updateElements);

      // initialize elements
      $timeout(angular.bind(null, updateElements, scope, scope.gmObjects()));
    }

    return {
      createShapeDirective: createShapeDirective
    };
  }]);
})();

/**
 * @ngdoc service
 * @name angulargm.service:angulargmUtils
 *
 * @description
 * Common utility functions.
 */
(function () {
'use strict';

  angular.module('AngularGM').

  factory('angulargmUtils', ['$parse', function($parse) {

    /**
     * Check if two floating point numbers are equal.
     *
     * @param {number} f1 first number
     * @param {number} f2 second number
     * @return {boolean} true if f1 and f2 are 'very close' (within 0.000001)
     */
    function floatEqual (f1, f2) {
      return (Math.abs(f1 - f2) < 0.000001);
    }

    /**
     * @ngdoc function
     * @name #latLngEqual
     * @methodOf angulargm.service:angulargmUtils
     *
     * @param {google.maps.LatLng} l1 first
     * @param {google.maps.LatLng} l2 second
     * @return {boolean} true if l1 and l2 are 'very close'. If either are null
     * or not google.maps.LatLng objects returns false.
     */
    function latLngEqual(l1, l2) {
      if (!(l1 instanceof google.maps.LatLng &&
            l2 instanceof google.maps.LatLng)) {
        return false;
      }
      return floatEqual(l1.lat(), l2.lat()) && floatEqual(l1.lng(), l2.lng());
    }

    /**
     * @ngdoc function
     * @name #boundsEqual
     * @methodOf angulargm.service:angulargmUtils
     *
     * @param {google.maps.LatLngBounds} b1 first
     * @param {google.maps.LatLngBounds} b2 second
     * @return {boolean} true if b1 and b2 are 'very close'. If either are null
     * or not google.maps.LatLngBounds objects returns false.
     */
    function boundsEqual(b1, b2) {
      if (!(b1 instanceof google.maps.LatLngBounds &&
            b2 instanceof google.maps.LatLngBounds)) {
        return false;
      }
      var sw1 = b1.getSouthWest();
      var sw2 = b2.getSouthWest();
      var ne1 = b1.getNorthEast();
      var ne2 = b2.getNorthEast();

      return latLngEqual(sw1, sw2) && latLngEqual(ne1, ne2);
    }

    /**
     * @ngdoc function
     * @name #latLngToObj
     * @methodOf angulargm.service:angulargmUtils
     *
     * @param {google.maps.LatLng} latLng the LatLng
     * @return {Object} object literal with 'lat' and 'lng' properties.
     * @throw if latLng not instanceof google.maps.LatLng
     */
    function latLngToObj(latLng) {
      if (!(latLng instanceof google.maps.LatLng))
        throw 'latLng not a google.maps.LatLng';

      return {
        lat: latLng.lat(),
        lng: latLng.lng()
      };
    }

    /**
     * @ngdoc function
     * @name #objToLatLng
     * @methodOf angulargm.service:angulargmUtils
     *
     * @param {Object} obj of the form { lat: 40, lng: -120 }
     * @return {google.maps.LatLng} returns null if problems with obj (null,
     * NaN, etc.)
     */
    function objToLatLng(obj) {
      if (obj != null) {
        var lat = obj.lat;
        var lng = obj.lng;
        var ok = !(lat == null || lng == null) && !(isNaN(lat) ||
            isNaN(lng));
        if (ok) {
          return new google.maps.LatLng(lat, lng);
        }
      }
      return null;
    }

    /**
     * @ngdoc function
     * @name #hasNaN
     * @methodOf angulargm.service:angulargmUtils
     *
     * @param {google.maps.LatLng} latLng the LatLng
     * @return {boolean} true if either lat or lng of latLng is null or isNaN
     */
    function hasNaN(latLng) {
      if (!(latLng instanceof google.maps.LatLng))
        throw 'latLng must be a google.maps.LatLng';

      // google.maps.LatLng converts NaN to null, so check for both
      var isNull = (latLng.lat() == null || latLng.lng() == null);
      var isNotaN =  isNaN(latLng.lat()) || isNaN(latLng.lng());
      return isNull || isNotaN;
    }

    /**
     * @param {Object} attrs directive attributes
     * @return {Object} mapping from event names to handler fns
     */
    function getEventHandlers(attrs) {
      var handlers = {};

      // retrieve gm-on-___ handlers
      angular.forEach(attrs, function(value, key) {
        if (key.lastIndexOf('gmOn', 0) === 0) {
          var event = angular.lowercase(
            key.substring(4)
              .replace(/(?!^)([A-Z])/g, '_$&')
          );
          var fn = $parse(value);
          handlers[event] = fn;
        }
      });

      return handlers;
    }

    function assertDefined(value, name) {
      if (value === undefined || value === null) {
        if (name) {
          throw name + ' was: ' + value;
        } else {
          throw 'value was: ' + value;
        }
      }
    }

    return {
      latLngEqual: latLngEqual,
      boundsEqual: boundsEqual,
      latLngToObj: latLngToObj,
      objToLatLng: objToLatLng,
      hasNaN: hasNaN,
      getEventHandlers: getEventHandlers,
      assertDefined: assertDefined
    };
  }]);
})();

/**
 * @ngdoc service
 * @name angulargm.service:debounce
 *
 * @description
 * Debounce function. Stolen from https://github.com/shahata/angular-debounce
 */
(function () {
'use strict';

  angular.module('AngularGM').

  factory('debounce', ['$timeout', function ($timeout) {
    return function (func, wait, immediate) {
      var timeout, args, context, result;
      function debounce() {
        /* jshint validthis:true */
        context = this;
        args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
          }
        };
        var callNow = immediate && !timeout;
        if (timeout) {
          $timeout.cancel(timeout);
        }
        timeout = $timeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
        }
        return result;
      }
      debounce.cancel = function () {
        $timeout.cancel(timeout);
        timeout = null;
      };
      return debounce;
    };
  }]);

})();

/**
 * Directive controller which is owned by the [gmMap]{@link module:gmMap}
 * directive and shared among all other angulargm directives.
 */
(function () {
'use strict';

  angular.module('AngularGM').

  controller('angulargmMapController',
    ['$scope', '$element', 'angulargmUtils', 'angulargmDefaults',
    'angulargmContainer',

    function ($scope, $element, angulargmUtils, angulargmDefaults,
      angulargmContainer) {

    /** aliases */
    var latLngEqual = angulargmUtils.latLngEqual;
    var boundsEqual = angulargmUtils.boundsEqual;
    var hasNaN = angulargmUtils.hasNaN;
    var assertDefined = angulargmUtils.assertDefined;

    /*
     * Construct a new controller for the gmMap directive.
     * @param {angular.Scope} $scope
     * @param {angular.element} $element
     * @constructor
     */
    var constructor = function($scope, $element) {

      var mapId = $scope.gmMapId();
      if (!mapId) { throw 'angulargm must have non-empty gmMapId attribute'; }

      var mapDiv = angular.element($element[0].firstChild);
      mapDiv.attr('id', mapId);

      var config = this._getConfig($scope, angulargmDefaults);

      // 'private' properties
      this._map = this._createMap(mapId, mapDiv, config, angulargmContainer, $scope);
      this._elements = {};
      this._listeners = {};

      // 'public' properties
      this.dragging = false;

      Object.defineProperties(this, {
        'precision': {
          value: angulargmDefaults.precision,
          writeable: false
        },

        'center': {
          configurable: true, // for testing so we can mock
          get: function() {
             return this._map.getCenter();
           },
          set: function(center) {
            if (hasNaN(center))
              throw 'center contains null or NaN';
            var changed = !latLngEqual(this.center, center);
            if (changed) {
              this._map.panTo(center);
            }
          }
        },

        'zoom': {
          configurable: true, // for testing so we can mock
          get: function() {
            return this._map.getZoom();
          },
          set: function(zoom) {
            if (!(zoom != null && !isNaN(zoom)))
              throw 'zoom was null or NaN';
            var changed = this.zoom !== zoom;
            if (changed) {
              this._map.setZoom(zoom);
            }
          }
        },

        'bounds': {
          configurable: true, // for testing so we can mock
          get: function() {
            return this._map.getBounds();
          },
          set: function(bounds) {
            var numbers = !hasNaN(bounds.getSouthWest()) &&
                          !hasNaN(bounds.getNorthEast());
            if (!numbers)
              throw 'bounds contains null or NaN';

            var changed = !(boundsEqual(this.bounds, bounds));
            if (changed) {
              this._map.fitBounds(bounds);
            }
          }
        },

        'mapTypeId': {
          configurable: true, // for testing so we can mock
          get: function() {
            return this._map.getMapTypeId();
          },
          set: function(mapTypeId) {
            if (mapTypeId == null)
              throw 'mapTypeId was null or unknown';
            var changed = this.mapTypeId !== mapTypeId;
            if (changed) {
              this._map.setMapTypeId(mapTypeId);
            }
          }
        }
      });

      this._initDragListeners();
      $scope.$on('$destroy', angular.bind(this, this._destroy));
    };


    // Retrieve google.maps.MapOptions
    this._getConfig = function($scope, angulargmDefaults) {
      // Get config or defaults
      var defaults = angulargmDefaults.mapOptions;
      var config = {};
      angular.extend(config, defaults, $scope.gmMapOptions());
      return config;
    };


    // Create the map and add to angulargmContainer
    this._createMap = function(id, element, config, angulargmContainer) {
      var map = angulargmContainer.getMap(id);
      if (!map) {
        map = new google.maps.Map(element[0], config);
        angulargmContainer.addMap(id, map);
      } else {
        var div = map.getDiv();
        element.replaceWith(div);
        this._map = map;
        this.mapTrigger('resize');
        map.setOptions(config);
      }
      return map;
    };


    // Set up listeners to update this.dragging
    this._initDragListeners = function() {
      var self = this;
      this.addMapListener('dragstart', function () {
        self.dragging = true;
      });

      this.addMapListener('idle', function () {
        self.dragging = false;
      });
    };


    this._destroy = function() {
      angular.forEach(this._listeners, function(listener) {
        angular.forEach(listener, function(l) {
          google.maps.event.removeListener(l);
        });
      });
      this._listeners = {};

      var self = this;
      var types = Object.keys(this._elements);
      angular.forEach(types, function(type) {
        var scopeIds = Object.keys(self._getElements(type));
        angular.forEach(scopeIds, function(scopeId) {
          self.forEachElementInScope(type, scopeId, function(element, id) {
            self.removeElement(type, scopeId, id);
          });
        });
      });

      var streetView = this._map.getStreetView();
      if (streetView && streetView.getVisible()) {
        streetView.setVisible(false);
      }
    };


    /**
     * Alias for google.maps.event.addListener(map, event, handler)
     * @param {string} event an event defined on google.maps.Map
     * @param {Function} a handler for the event
     */
    this.addMapListener = function(event, handler) {
      var listener = google.maps.event.addListener(this._map, event, handler);

      if (this._listeners[event] === undefined) {
        this._listeners[event] = [];
      }

      this._listeners[event].push(listener);
    };


    /**
     * Alias for google.maps.event.addListenerOnce(map, event, handler)
     * @param {string} event an event defined on google.maps.Map
     * @param {Function} a handler for the event
     */
    this.addMapListenerOnce = function(event, handler) {
      var listener = google.maps.event.addListenerOnce(this._map, event, handler);

      if (this._listeners[event] === undefined) {
        this._listeners[event] = [];
      }

      this._listeners[event].push(listener);
    };


    /**
     * Alias for google.maps.event.addListener(object, event, handler)
     */
    this.addListener = function(object, event, handler) {
      google.maps.event.addListener(object, event, handler);
    };


    /**
     * Alias for google.maps.event.addListenerOnce(object, event, handler)
     */
    this.addListenerOnce = function(object, event, handler) {
      google.maps.event.addListenerOnce(object, event, handler);
    };


    /**
     * Alias for google.maps.event.trigger(map, event)
     * @param {string} event an event defined on google.maps.Map
     */
    this.mapTrigger = function(event) {
      google.maps.event.trigger(this._map, event);
    };


    /**
     * Alias for google.maps.event.trigger(object, event)
     */
    this.trigger = function(object, event) {
      google.maps.event.trigger(object, event);
    };

    this._newElement = function(type, opts) {
        if (type === 'marker') {
            if (!(opts.position instanceof google.maps.LatLng)) {
              throw 'markerOptions did not contain a position';
            }
            return new angulargmDefaults.markerConstructor(opts);
        } else if (type === 'polyline') {
            if (!(opts.path instanceof Array)) {
                throw 'polylineOptions did not contain a path';
            }
            return new angulargmDefaults.polylineConstructor(opts);
        } else if (type === 'circle') {
            if (!(opts.center instanceof google.maps.LatLng)) {
                throw 'circleOptions did not contain a marker position';
            }
            return new angulargmDefaults.circleConstructor(opts);
        }
        else {
          throw 'unrecognized type ' + type;
        }
    };

    this._getElements = function(type) {
        if (!(type in this._elements)) {
            this._elements[type] = {};
        }
        return this._elements[type];
    };

    /**
     * Adds a new element to the map.
     * @return {boolean} true if an element was added, false if there was already
     *   an element with the given id
     * @throw if any arguments are null/undefined or elementOptions does not
     *   have all the required options (i.e. position)
     */
    this.addElement = function(type, scopeId, id, elementOptions) {
        assertDefined(type, 'type');
        assertDefined(scopeId, 'scopeId');
        assertDefined(id, 'id');
        assertDefined(elementOptions, 'elementOptions');

        if (this.hasElement(type, scopeId, id)) {
          return false;
        }

        var elements = this._getElements(type);
        if (elements[scopeId] == null) {
          elements[scopeId] = {};
        }

        // google maps munges passed in options, so copy it first
        // extend instead of copy to preserve value objects
        var opts = {};
        angular.extend(opts, elementOptions);
        var element = this._newElement(type, opts);
        elements[scopeId][id] = element;
        element.setMap(this._map);

        return true;
    };

    /**
     * Updates an element on the map with new options.
     * @return {boolean} true if an element was updated, false if there was no
     *   element with the given id to update
     * @throw if any arguments are null/undefined or elementOptions does not
     *   have all the required options (i.e. position)
     */

    this.updateElement = function(type, scopeId, id, elementOptions) {
      assertDefined(type, 'type');
      assertDefined(scopeId, 'scopeId');
      assertDefined(id, 'id');
      assertDefined(elementOptions, 'elementOptions');

      var element = this.getElement(type, scopeId, id);
      if (element) {
        element.setOptions(elementOptions);
        return true;
      } else {
        return false;
      }
    };

    this.hasElement = function(type, scopeId, id) {
      assertDefined(type, 'type');
      assertDefined(scopeId, 'scopeId');
      assertDefined(id, 'id');
      return (this.getElement(type, scopeId, id) != null);
    };

    /**
     * @return {google maps element} the element with the given id, or null if no
     *   such element exists
     */
    this.getElement = function (type, scopeId, id) {
      assertDefined(type, 'type');
      assertDefined(scopeId, 'scopeId');
      assertDefined(id, 'id');

      var elements = this._getElements(type);
      if (elements[scopeId] != null && id in elements[scopeId]) {
        return elements[scopeId][id];
      } else {
        return null;
      }
    };

    /**
     * @return {boolean} true if an element was removed, false if nothing
     *   happened
     */
    this.removeElement = function(type, scopeId, id) {
      assertDefined(type, 'type');
      assertDefined(scopeId, 'scopeId');
      assertDefined(id, 'id');

      var elements = this._getElements(type);
      var removed = false;
      var element = elements[scopeId][id];
      if (element) {
          element.setMap(null);
          removed = true;
      }
      elements[scopeId][id] = null;
      delete elements[scopeId][id];
      return removed;
    };

    /**
     * Applies a function to each element on the map.
     * @param {String} type of element, e.g. 'marker'
     * @param {Function} fn will be called with element as first argument
     * @throw if an argument is null or undefined
     */
    this.forEachElement = function(type, fn) {
      assertDefined(type, 'type');
      assertDefined(fn, 'fn');

      var elements = this._getElements(type);
      var scopeIds = Object.keys(elements);
      var allElements = scopeIds.reduce(function(accumulator, scopeId) {
        angular.forEach(elements[scopeId], function(element) {
          accumulator.push(element);
        });
        return accumulator;
      }, []);

      angular.forEach(allElements, function(element, id) {
        if (element != null) {
          fn(element, id);
        }
      });
    };


    /**
     * Applies a function to each element in a scope.
     * @param {String} type of element, e.g. 'marker'
     * @param {number} scope id
     * @param {Function} fn will called with marker as first argument
     * @throw if an argument is null or undefined
     */
    this.forEachElementInScope = function(type, scopeId, fn) {
      assertDefined(type, 'type');
      assertDefined(scopeId, 'scopeId');
      assertDefined(fn, 'fn');

      var elements = this._getElements(type);
      angular.forEach(elements[scopeId], function(element, id) {
        if (element != null) {
          fn(element, id);
        }
      });
    };

    this.getMap = function() {
      return this._map;
    };

    /** Instantiate controller */
    angular.bind(this, constructor)($scope, $element);

  }]);
})();

