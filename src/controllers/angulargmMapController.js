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
    var gMDefaults = angulargmDefaults;
    var gMContainer = angulargmContainer;


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
      this._polylines = {};
      this._listeners = {};

      // 'public' properties
      this.dragging = false;

      Object.defineProperties(this, {
        'precision': {
          value: gMDefaults.precision,
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
        angular.forEach(listener, function(l) {
          google.maps.event.removeListener(l);
        });
      });
      this._listeners = {};

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

      if (this._listeners[event] === undefined) {
        this._listeners[event] = [];
      }

      this._listeners[event].push(listener);
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

    this.addPolyline = function(scopeId, polylineOptions) {
      var opts = angular.extend({}, polylineOptions);

      if (!(opts.path) instanceof Array || opts.path.length < 2) {
        return;
      }

      angular.forEach(opts.path, function(point) {
        if (!(point instanceof google.maps.LatLng)) {
          throw 'An element in polylineOptions was found to not be a valid position';
        }
      });

      var hash = angulargmUtils.createHash(polylineOptions.path, this.precision);
      if (this.hasPolyline(scopeId, hash)) {
          return false;
      }

      var polyline = new angulargmDefaults.polylineConstructor(opts);
      if (null == this._polylines[scopeId]) {
        this._polylines[scopeId] = {};
      }
      this._polylines[scopeId][hash] = polyline;
      polyline.setMap(this._map);
      return true;
    };

    this.getPolyline = function (scopeId, hash) {
      if (null == hash || '' === hash) {
        throw 'no hash passed to lookup';
      }

      if (null != this._polylines[scopeId] && hash in this._polylines[scopeId]) {
        return this._polylines[scopeId][hash];
      } else {
        return null;
      }
    };

    this.hasPolyline = function (scopeId, hash) {
      return (this.getPolyline(scopeId, hash) instanceof Object);
    };

    this.forEachPolylineInScope = function(scopeId, fn) {
      if (null == fn) {
        throw 'fn was null or undefined';
      }

      angular.forEach(this._polylines[scopeId], function(polyline, hash) {
        if (null != polyline) {
          fn(polyline, hash);
        }
      });
    };

    this.forEachPolyline = function(fn) {
      if (null == fn) {
        throw 'fn was null or undefined';
      }

      angular.forEach(this._polylines, function(polylines, scopeId) {
        angular.forEach(polylines, function(polyline, hash) {
          if (null != polyline) {
            fn(polyline, hash);
          }
        });
      });
    };

    this.removePolylineByHash = function(scopeId, hash) {
      var removed = false;
      var polyline = this._polylines[scopeId][hash];
      if (polyline) {
        polyline.setMap(null);
        removed = true;
      }

      this._polylines[scopeId][hash] = null;
      delete this._polylines[scopeId][hash];
      return removed;
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

