/**
 * AngularGM - Google Maps Directives for AngularJS
 * @version v0.1.1 - 2013-08-06
 * @link http://dylanfprice.github.com/angular-gm
 * @author Dylan Price <the.dylan.price@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';

/**
 * Module for embedding Google Maps into AngularJS applications. 
 *
 * ## API Documentation
 * See...
 *
 * + {@link module:gmMap}               for usage of the `<gm-map>` directive
 * + {@link module:gmMarkers}           for usage of the `<gm-markers>` directive
 * + {@link module:gmInfoWindow}        for usage of the `<div gm-info-window="...>` directive
 * + {@link module:angulargmContainer}  if you need to run custom configuration on the map, e.g. add new map types
 * + {@link module:angulargmDefaults}   to override the default map options
 *
 * ## Example Plunkers ([fullscreen](http://embed.plnkr.co/PYDYjVuRHaJpdntoJtqL))
 *  
 * <iframe style="width: 100%; height: 400px" src="http://embed.plnkr.co/PYDYjVuRHaJpdntoJtqL" frameborder="0" allowfullscreen="allowfullscreen">
 * </iframe>
 *
 * (JSDoc is escaping my iframe so for the time being just click the link.)
 *  
 * @module AngularGM
 * @author Dylan Price <the.dylan.price@gmail.com>
 */
(function() {
  angular.module('AngularGM', []).

  /**
   * Default configuration.
   *
   * To provide your own default config, use the following
   * ```
   * angular.module('myModule').config(function($provide) {
   *   $provide.decorator('angulargmDefaults', function($delegate) {
   *     return angular.extend($delegate, {
   *       // Note: markerConstructor must implement getPosition() and setMap()
   *       // like google.maps.Marker
   *       'markerConstructor': myCustomMarkerConstructor,
   *       'mapOptions': {
   *         center: new google.maps.LatLng(55, 111),
   *         mapTypeId: google.maps.MapTypeId.SATELLITE,
   *         ...
   *       }
   *     });
   *   });
   * });
   * ```
   *
   * @module angulargmDefaults
   */
  value('angulargmDefaults', {
    'markerConstructor': google.maps.Marker,
    'mapOptions': {
      zoom : 8,
      center : new google.maps.LatLng(46, -120),
      mapTypeId : google.maps.MapTypeId.ROADMAP
    }
  });

})();

'use strict';

/**
 * A directive for creating a google.maps.InfoWindow.  
 *
 * Usage:
 * ```html
 * <div gm-info-window="myInfoWindow"
 *      gm-info-window-options="myInfoWindowOptions"
 *      gm-on-*event*="myEventHandler">
 * </div>
 * ```
 *
 *   + `gm-info-window`: name of scope variable to store the
 *   google.maps.InfoWindow in. Does not have to already exist.
 *
 *   + `gm-info-window-options`: object in the current scope that is a
 *   google.maps.InfoWindowOptions object. If unspecified, google maps api
 *   defaults will be used.
 *
 *   + `gm-on-*event*`: an angular expression which evaluates to an event
 *   handler. This handler will be attached to the InfoWindow's \*event\*
 *   event.  The variable 'infoWindow' evaluates to the InfoWindow.  For
 *   example: `gm-on-closeclick="myCloseclickFn(infoWindow)"` will call your
 *   myCloseclickFn whenever the InfoWindow is clicked closed. You may have
 *   multiple `gm-on-*event*` handlers, but only one for each type of event.
 *
 * @module gmInfoWindow
 */
(function () {

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

      /**
       * The info window's contents dont' need to be on the dom anymore,
       * google maps has them stored. So we just replace the infowindow
       * element with an empty div. (we don't just straight remove it from
       * the dom because straight removing things from the dom can mess up
       * angular) 
       */
      element.replaceWith('<div></div>');

      //Decorate infoWindow.open to $compile contents before opening
      var _open = infoWindow.open;
      infoWindow.open = function open(map, anchor) {
        $compile(element.contents())(scope);
        _open.call(infoWindow, map, anchor);
      };
    }

    return {
      restrict: 'A',
      priority: 100,
      scope: false,
      link: link
    };

  }]);
})();

'use strict';

/**
 * A directive for embedding google maps into your app. 
 *
 * Usage:
 * ```html
 * <gm-map gm-map-id="myMapId" 
 *         gm-center="myCenter" 
 *         gm-zoom="myZoom" 
 *         gm-bounds="myBounds" 
 *         gm-map-type-id="myMapTypeId"
 *         gm-map-options="myMapOptions">
 * </gm-map>
 * ```
 *
 *   + `gm-map-id`: angular expression that evaluates to a unique string id for
 *   the map, e.g. "'map_canvas'" or "myMapId" where myMapId is a variable in
 *   the current scope. This allows you to have multiple maps/instances of the
 *   directive.
 *
 *   + `gm-center`: name for a center variable in the current scope.  The value
 *   will be a google.maps.LatLng object.
 *
 *   + `gm-zoom`: name for a zoom variable in the current scope.  Value will be
 *   an integer.
 *
 *   + `gm-bounds`: name for a bounds variable in the current scope.  Value will
 *   be a google.maps.LatLngBounds object.
 *
 *   + `gm-map-type-id`: name for a mapTypeId variable in the current scope.
 *   Value will be a string.
 *
 *   + `gm-map-options`: object in the current scope that is a
 *   google.maps.MapOptions object. If unspecified, will use the values in
 *   angulargmDefaults.mapOptions. [angulargmDefaults]{@link module:angulargmDefaults}
 *   is a service, so it is both injectable and overrideable (using
 *   $provide.decorator).
 *
 * All attributes except `gm-map-options` are required. The `gm-center`,
 * `gm-zoom`, `gm-bounds`, and `gm-map-type-id` variables do not have to exist in
 * the current scope--they will be created if necessary. All three have
 * bi-directional association, i.e.  drag or zoom the map and they will update,
 * update them and the map will change.  However, any initial state of these
 * three variables will be ignored.
 *
 * If you need to get a handle on the google.maps.Map object, see
 * [angulargmContainer]{@link module:angulargmContainer}
 *
 * Events:
 *
 *   + `gmMapResize`: google.maps.event.trigger(map, 'resize') To use:
 *   `$scope.$broadcast('gmMapResize', 'myMapId')`
 *
 *   Parameters:
 *
 *       + `mapId`: required. The id of your map.  This is what you set
 *       `gm-map-id` to.  It is necessary because there may be multiple
 *       instances of the `gmMap` directive.
 *
 * @module gmMap
 */
(function () {
  angular.module('AngularGM').

  directive('gmMap', ['$timeout', function ($timeout) {
  
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

      var updateScope = function() {
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

      controller.addMapListener('drag', updateScope);
      controller.addMapListener('zoom_changed', updateScope);
      controller.addMapListener('center_changed', updateScope);
      controller.addMapListener('bounds_changed', updateScope);
      controller.addMapListener('maptypeid_changed', updateScope);
      controller.addMapListener('resize', updateScope);
      
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

'use strict';

/**
 * A directive for adding markers to a `gmMap`. You may have multiple per `gmMap`.
 *
 * To use, you specify an array of custom objects and tell the directive how to
 * extract location data from them. A marker will be created for each of your
 * objects. If you assign a new array to your scope variable or change the
 * array's length, the markers will also update.
 *
 * Usage:
 * ```html
 * <gm-map ... >
 *   <gm-markers gm-objects="myObjects" 
 *               gm-get-lat-lng="myGetLatLng" 
 *               gm-get-marker-options="myGetMarkerOptions" 
 *               gm-events="myEvents"
 *               gm-on-*event*="myEventHandler">
 *   </gm-markers>
 * </gm-map>
 * ```
 *
 *   + `gm-objects`: an array of objects in the current scope. These can be any
 *   objects you wish to attach to markers, the only requirement is that they
 *   have a uniform method of accessing a lat and lng.
 *
 *   + `gm-get-lat-lng`: an angular expression that given an object from
 *   `gm-objects`, evaluates to an object with lat and lng properties. Your
 *   object can be accessed through the variable 'object'.  For example, if
 *   your controller has
 *   ```
 *   ...
 *   $scope.myObjects = [
 *     { id: 0, location: { lat: 5, lng: 5} }, 
 *     { id: 1, location: { lat: 6, lng: 6} }
 *   ]
 *   ...
 *   ```
 *   then in the `gm-markers` directive you would put
 *   ```
 *   ...
 *   gm-objects="myObjects"
 *   gm-get-lat-lng="{ lat: object.location.lat, lng: object.location.lng }"
 *   ...
 *   ```
 *
 *   + `gm-get-marker-options`: an angular expression that given an object from
 *   `gm-objects`, evaluates to a google.maps.MarkerOptions object. Your object
 *   can be accessed through the variable 'object'. If unspecified, google maps
 *   api defaults will be used.
 *
 *   + `gm-events`: a variable in the current scope that is used to simulate
 *   events on markers. Setting this variable to an object of the form 
 *   ```
 *       [
 *         {
 *           event: 'click',
 *           locations: [new google.maps.LatLng(45, -120), ...]
 *         },
 *         ...
 *       ]
 *   ```
 *   will generate the named events on the markers at the given locations, if a
 *   marker at each location exists. Note: when setting the `gm-events`
 *   variable, you must set it to a new object for the changes to be detected.
 *   Code like `myEvent[0]["locations"] = [new google.maps.LatLng(45,-120)]`
 *   will not work.
 *                        
 *
 *   + `gm-on-*event*`: an angular expression which evaluates to an event
 *   handler. This handler will be attached to each marker's \*event\* event.
 *   The variables 'object' and 'marker' evaluate to your object and the
 *   google.maps.Marker, respectively. For example:
 *   `gm-on-click="myClickFn(object, marker)"` will call your myClickFn
 *   whenever a marker is clicked.  You may have multiple `gm-on-*event*`
 *   handlers, but only one for each type of event.
 *
 *
 * Only the `gm-objects` and `gm-get-lat-lng` attributes are required.
 *
 * Events:
 *
 *   + `gmMarkersRedraw`: force the gmMarkers directive to clear and redraw all
 *   markers. To use: `$scope.$broadcast('gmMarkersRedraw', 'myObjects')`
 *
 *   Parameters:
 *
 *       + `objects`: Not required. The name of the scope variable which holds
 *       the objects to redraw markers for, i.e. what you set `gm-objects` to.
 *       It is useful because there may be multiple instances of the
 *       `gmMarkers` directive. If not specified, all instances of gmMarkers
 *       which are child scopes will redraw their markers.
 *
 *   + `gmMarkersUpdated`: emitted when markers are updated. To use: 
 *   ```
 *   $scope.$on('gmMarkersUpdated', function(event, objects) {
 *       if (objects === 'myObjects') {
 *         ...
 *       }
 *   });
 *   ```
 *
 *   Parameters:
 *       
 *       + `objects`: the name of the scope variable which holds the objects the
 *       gmMarkers directive was constructed with. This is what `gm-objects`
 *       was set to.
 *
 * @module gmMarkers
 */
(function () {
  angular.module('AngularGM').

  directive('gmMarkers', ['$log', '$parse', '$timeout', 'angulargmUtils', 
    function($log, $parse, $timeout, angulargmUtils) {

    /** aliases */
    var latLngEqual = angulargmUtils.latLngEqual;
    var objToLatLng = angulargmUtils.objToLatLng;
    var getEventHandlers = angulargmUtils.getEventHandlers;


    function link(scope, element, attrs, controller) {
      // check attrs
      if (!('gmObjects' in attrs)) {
        throw 'gmObjects attribute required';
      } else if (!('gmGetLatLng' in attrs)) {
        throw 'gmGetLatLng attribute required';
      }

      var handlers = getEventHandlers(attrs); // map events -> handlers

      // fn for updating markers from objects
      var updateMarkers = function(scope, objects) {

        var objectHash = {};

        angular.forEach(objects, function(object, i) {
          var latLngObj = scope.gmGetLatLng({object: object});
          var position = objToLatLng(latLngObj);
          if (position == null) {
            return;
          }

          var markerOptions = scope.gmGetMarkerOptions({object: object});

          // hash objects for quick access
          var hash = position.toUrlValue(controller.precision);
          objectHash[hash] = object;

          // add marker
          if (!controller.hasMarker(scope.$id, latLngObj.lat, latLngObj.lng)) {

            var options = {};
            angular.extend(options, markerOptions, {position: position});

            controller.addMarker(scope.$id, options);
            var marker = controller.getMarker(scope.$id, latLngObj.lat, latLngObj.lng);

            // set up marker event handlers
            angular.forEach(handlers, function(handler, event) {
              controller.addListener(marker, event, function() {
                $timeout(function() {
                       // scope is this directive's isolate scope
                       // scope.$parent is the scope of ng-transclude
                       // scope.$parent.$parent is the one we want
                  handler(scope.$parent.$parent, {
                    object: object,
                    marker: marker
                  });
                });
              });
            });
          }
        });

        // remove 'orphaned' markers
        var orphaned = [];
        
        controller.forEachMarkerInScope(scope.$id, function(marker, hash) {
          if (!(hash in objectHash)) {
            orphaned.push(hash);
          }
        });

        angular.forEach(orphaned, function(markerHash, i) {
          controller.removeMarkerByHash(scope.$id, markerHash);
        });

        scope.$emit('gmMarkersUpdated', attrs.gmObjects);
      }; // end updateMarkers()

      // watch objects
      scope.$watch('gmObjects().length', function(newValue, oldValue) {
        if (newValue != null && newValue !== oldValue) {
          updateMarkers(scope, scope.gmObjects());
        }
      });

      scope.$watch('gmObjects()', function(newValue, oldValue) {
        if (newValue != null && newValue !== oldValue) {
          updateMarkers(scope, scope.gmObjects());
        }
      });

      // watch gmEvents
      scope.$watch('gmEvents()', function(newValue, oldValue) {
        if (newValue != null && newValue !== oldValue) {
          angular.forEach(newValue, function(eventObj) {
            var event = eventObj.event;
            var locations = eventObj.locations;
            angular.forEach(locations, function(location) {
              var marker = controller.getMarker(scope.$id, location.lat(), location.lng());
              if (marker != null) {
                $timeout(angular.bind(this, controller.trigger, marker, event));
              }
            });
          });
        }
      });

      scope.$on('gmMarkersRedraw', function(event, objectsName) {
        if (objectsName == null || objectsName === attrs.gmObjects) {
          updateMarkers(scope);
          updateMarkers(scope, scope.gmObjects());
        }
      });

      // initialize markers
      $timeout(angular.bind(null, updateMarkers, scope, scope.gmObjects()));
    }


    return {
      restrict: 'AE',
      priority: 100,
      scope: {
        gmObjects: '&',
        gmGetLatLng: '&',
        gmGetMarkerOptions: '&',
        gmEvents: '&'
      },
      require: '^gmMap',
      link: link
    };
  }]);
})();

'use strict';

/**
 * A container which maps mapIds to google.maps.Map instances, and additionally
 * allows getting a promise of a map for custom configuration of the map.
 *
 * If you want a handle to the map, you should use the getMapPromise(mapId)
 * method so you can guarantee the map will be initialized. For example,
 *
 * ```
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
 *
 * @module angulargmContainer
 */
(function () {
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
     * @method
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
     * @method
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
     * @method
     */
    function getMapPromise(mapId) {
      var defer = defers[mapId] || $q.defer();  
      defers[mapId] = defer;
      return defer.promise;
    }

    /**
     * Removes map with given mapId from this container, and deletes the map.
     * In order for this to work you must ensure there are no references to the
     * map object. Note: this will likely cause a memory leak, see
     * http://stackoverflow.com/questions/10485582/what-is-the-proper-way-to-destroy-a-map-instance
     *
     * @param {string} mapId the unique id of the map to remove
     * @method
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

'use strict';

/**
 * Common utility functions.
 */
(function () {
  angular.module('AngularGM').

  factory('angulargmUtils', ['$parse', function($parse) {

    /**
     * Check if two floating point numbers are equal. 
     * @return true if f1 and f2 are 'very close'
     */
    function floatEqual (f1, f2) {
      return (Math.abs(f1 - f2) < 0.000001);
    }

    /**
     * @param {google.maps.LatLng} l1
     * @param {google.maps.LatLng} l2
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
     * @param {google.maps.LatLngBounds} b1
     * @param {google.maps.LatLngBounds} b2
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
     * @param {google.maps.LatLng} latLng
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
     * @param {google.maps.LatLng} latLng
     * @return true if either lat or lng of latLng is null or isNaN
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
          var event = angular.lowercase(key.substring(4));
          var fn = $parse(value);
          handlers[event] = fn;
        }
      });

      return handlers;
    }

    return {
      latLngEqual: latLngEqual,
      boundsEqual: boundsEqual,
      latLngToObj: latLngToObj,
      objToLatLng: objToLatLng,
      hasNaN: hasNaN,
      getEventHandlers: getEventHandlers
    };
  }]);
})();

'use strict';

/**
 * Directive controller which is owned by the [gmMap]{@link module:gmMap}
 * directive and shared among all other angulargm directives.
 */
(function () {
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
    var gMDefaults = angulargmDefaults;
    var gMContainer = angulargmContainer;


    /** constants */
    var consts = {};
    consts.precision = 3;


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

      var config = this._getConfig($scope, gMDefaults);
      
      // 'private' properties
      this._map = this._createMap(mapId, mapDiv, config, gMContainer, $scope);
      this._markers = {};
      this._listeners = [];

      // 'public' properties
      this.dragging = false;

      Object.defineProperties(this, {
        'precision': {
          value: consts.precision,
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
    this._getConfig = function($scope, gMDefaults) {
      // Get config or defaults
      var defaults = gMDefaults.mapOptions;
      var config = {};
      angular.extend(config, defaults, $scope.gmMapOptions());
      return config;
    };


    // Create the map and add to angulargmContainer
    this._createMap = function(id, element, config, gMContainer) {
      var map = gMContainer.getMap(id);
      if (!map) {
        map = new google.maps.Map(element[0], config);
        gMContainer.addMap(id, map);
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
      
      this.addMapListener('drag', function() {
        self.dragging = true;   
      });
    };


    this._destroy = function() {
      angular.forEach(this._listeners, function(listener) {
        google.maps.event.removeListener(listener);
      });

      var scopeIds = Object.keys(this._markers);
      var self = this;
      angular.forEach(scopeIds, function(scopeId) {
        self.forEachMarkerInScope(scopeId, function(marker, hash) {
          self.removeMarkerByHash(scopeId, hash);  
        });
      });
    };

    
    /**
     * Alias for google.maps.event.addListener(map, event, handler)
     * @param {string} event an event defined on google.maps.Map
     * @param {Function} a handler for the event
     * @ignore
     */
    this.addMapListener = function(event, handler) {
      var listener = google.maps.event.addListener(this._map, event, handler);
      this._listeners.push(listener);
    };


    /**
     * Alias for google.maps.event.addListenerOnce(map, event, handler)
     * @param {string} event an event defined on google.maps.Map
     * @param {Function} a handler for the event
     * @ignore
     */
    this.addMapListenerOnce = function(event, handler) {
      google.maps.event.addListenerOnce(this._map, 
          event, handler);
    };


    /**
     * Alias for google.maps.event.addListener(object, event, handler)
     * @ignore
     */
    this.addListener = function(object, event, handler) {
      google.maps.event.addListener(object, event, handler);
    };


    /**
     * Alias for google.maps.event.addListenerOnce(object, event, handler)
     * @ignore
     */
    this.addListenerOnce = function(object, event, handler) {
      google.maps.event.addListenerOnce(object, event, handler);
    };


    /**
     * Alias for google.maps.event.trigger(map, event)
     * @param {string} event an event defined on google.maps.Map
     * @ignore
     */
    this.mapTrigger = function(event) {
      google.maps.event.trigger(this._map, event);
    };


    /**
     * Alias for google.maps.event.trigger(object, event)
     * @ignore
     */
    this.trigger = function(object, event) {
      google.maps.event.trigger(object, event);
    };


    /**
     * Adds a new marker to the map.
     * @param {number} scope id
     * @param {google.maps.MarkerOptions} markerOptions
     * @return {boolean} true if a marker was added, false if there was already
     *   a marker at this position. 'at this position' means delta_lat and
     *   delta_lng are < 0.0005
     * @throw if markerOptions does not have all required options (i.e. position)
     * @ignore
     */
    this.addMarker = function(scopeId, markerOptions) {
      var opts = {};
      angular.extend(opts, markerOptions);

      if (!(opts.position instanceof google.maps.LatLng)) {
        throw 'markerOptions did not contain a position';
      }

      var marker = new angulargmDefaults.markerConstructor(opts);
      var position = marker.getPosition();
      if (this.hasMarker(scopeId, position.lat(), position.lng())) {
        return false;
      }
      
      var hash = position.toUrlValue(this.precision);
      if (this._markers[scopeId] == null) {
          this._markers[scopeId] = {};
      }
      this._markers[scopeId][hash] = marker;
      marker.setMap(this._map);
      return true;
    };      


    /**
     * @param {number} scope id
     * @param {number} lat
     * @param {number} lng
     * @return {boolean} true if there is a marker with the given lat and lng
     * @ignore
     */
    this.hasMarker = function(scopeId, lat, lng) {
      return (this.getMarker(scopeId, lat, lng) instanceof google.maps.Marker);
    };


    /**
     * @param {number} scope id
     * @param {number} lat
     * @param {number} lng
     * @return {google.maps.Marker} the marker at given lat and lng, or null if
     *   no such marker exists
     * @ignore
     */
    this.getMarker = function (scopeId, lat, lng) {
      if (lat == null || lng == null)
        throw 'lat or lng was null';

      var latLng = new google.maps.LatLng(lat, lng);
      var hash = latLng.toUrlValue(this.precision);
      if (this._markers[scopeId] != null && hash in this._markers[scopeId]) {
        return this._markers[scopeId][hash];
      } else {
        return null;
      }
    };  


    /**
     * @param {number} scope id
     * @param {number} lat
     * @param {number} lng
     * @return {boolean} true if a marker was removed, false if nothing
     *   happened
     * @ignore
     */
    this.removeMarker = function(scopeId, lat, lng) {
      if (lat == null || lng == null)
        throw 'lat or lng was null';

      var latLng = new google.maps.LatLng(lat, lng);

      var hash = latLng.toUrlValue(this.precision);
      return this.removeMarkerByHash(scopeId, hash);
    };

    /**
     *
     * @param {number} scope id
     * @param {string} hash
     * @returns {boolean} true if a marker was removed, false if nothing
     *   happened
     * @ignore
     */
    this.removeMarkerByHash = function(scopeId, hash) {
        var removed = false;
        var marker = this._markers[scopeId][hash];
        if (marker) {
            marker.setMap(null);
            removed = true;
        }
        this._markers[scopeId][hash] = null;
        delete this._markers[scopeId][hash];
        return removed;
    };


    /**
     * Applies a function to each marker.
     * @param {Function} fn will called with marker as first argument
     * @throw if fn is null or undefined
     * @ignore
     */
    this.forEachMarker = function(fn) {
      if (fn == null) { throw 'fn was null or undefined'; }
      var that = this;
      var allMarkers = Object.keys(this._markers).reduce(function(markers, key){
          angular.forEach(that._markers[key], function(marker){
              markers.push(marker);
          });
          return markers;
      }, []);
      angular.forEach(allMarkers, function(marker, hash) {
        if (marker != null) {
          fn(marker, hash);
        }
      });
    };


    /**
     * Applies a function to each marker.
     * @param {number} scope id
     * @param {Function} fn will called with marker as first argument
     * @throw if fn is null or undefined
     * @ignore
     */
    this.forEachMarkerInScope = function(scopeId, fn) {
        if (fn == null) { throw 'fn was null or undefined'; }
        angular.forEach(this._markers[scopeId], function(marker, hash) {
            if (marker != null) {
                fn(marker, hash);
            }
        });
    };

    /**
     * Get current map.
     * @returns {object}
     * @ignore
     */
    this.getMap = function() {
        return this._map;
    };

    /** Instantiate controller */
    angular.bind(this, constructor)($scope, $element);

  }]);
})();

