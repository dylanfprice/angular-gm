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
      this._markers = {};
      this._polylines = {};
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
          self.removeMarker(scopeId, hash);
        });
      });
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
      google.maps.event.addListenerOnce(this._map,
          event, handler);
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

    /**
     * Adds a new marker to the map.
     * @return {boolean} true if a marker was added, false if there was already
     *   a marker with the given id     
     * @throw if any arguments are null/undefined or markerOptions does not
     *   have all the required options (i.e. position)
     */
    this.addMarker = function(scopeId, id, markerOptions) {
        var opts = {};
        angular.extend(opts, markerOptions);

        assertDefined(scopeId, 'scopeId');
        assertDefined(id, 'id');

        if (!(opts.position instanceof google.maps.LatLng)) {
          throw 'markerOptions did not contain a position';
        }

        if (this.hasMarker(scopeId, id)) {
          return false;
        }

        var marker = new angulargmDefaults.markerConstructor(opts);

        if (this._markers[scopeId] == null) {
          this._markers[scopeId] = {};
        }
        this._markers[scopeId][id] = marker;
        marker.setMap(this._map);

        return true;
    };

    this.hasMarker = function(scopeId, id) {
      assertDefined(scopeId, 'scopeId');
      assertDefined(id, 'id');
      return (this.getMarker(scopeId, id) instanceof google.maps.Marker);
    };

    /**
     * @return {google.maps.Marker} the marker with the given id, or null if no
     *   such marker exists
     */
    this.getMarker = function (scopeId, id) {
      assertDefined(scopeId, 'scopeId');
      assertDefined(id, 'id');

      if (this._markers[scopeId] != null && id in this._markers[scopeId]) {
        return this._markers[scopeId][id];
      } else {
        return null;
      }
    };

    /**
     * @return {boolean} true if a marker was removed, false if nothing
     *   happened
     */
    this.removeMarker = function(scopeId, id) {
      assertDefined(scopeId, 'scopeId');
      assertDefined(id, 'id');

      var removed = false;
      var marker = this._markers[scopeId][id];
      if (marker) {
          marker.setMap(null);
          removed = true;
      }
      this._markers[scopeId][id] = null;
      delete this._markers[scopeId][id];
      return removed;
    };

    /**
     * Applies a function to each marker on the map.
     * @param {Function} fn will called with marker as first argument
     * @throw if fn is null or undefined
     */
    this.forEachMarker = function(fn) {
      assertDefined(fn, 'fn');

      var self = this;
      var scopeIds = Object.keys(this._markers);
      var allMarkers = scopeIds.reduce(function(accumulator, scopeId) {
        angular.forEach(self._markers[scopeId], function(marker) {
          accumulator.push(marker);
        });
        return accumulator;
      }, []);

      angular.forEach(allMarkers, function(marker, id) {
        if (marker != null) {
          fn(marker, id);
        }
      });
    };


    /**
     * Applies a function to each marker in a scope.
     * @param {number} scope id
     * @param {Function} fn will called with marker as first argument
     * @throw if fn is null or undefined
     */
    this.forEachMarkerInScope = function(scopeId, fn) {
      assertDefined(fn, 'fn');

      angular.forEach(this._markers[scopeId], function(marker, id) {
        if (marker != null) {
          fn(marker, id);
        }
      });
    };

    this.addPolyline = function(scopeId, id, polylineOptions) {
      var opts = angular.extend({}, polylineOptions);

      if (!(opts.path) instanceof Array || opts.path.length < 2) {
        return;
      }

      angular.forEach(opts.path, function(point) {
        if (!(point instanceof google.maps.LatLng)) {
          throw 'An element in polylineOptions was found to not be a valid position';
        }
      });

      if (this.hasPolyline(scopeId, id)) {
          return false;
      }

      var polyline = new angulargmDefaults.polylineConstructor(opts);
      if (null == this._polylines[scopeId]) {
        this._polylines[scopeId] = {};
      }
      this._polylines[scopeId][id] = polyline;
      polyline.setMap(this._map);
      return true;
    };

    this.getPolyline = function (scopeId, id) {
      if (null == id || '' === id) {
        throw 'no id passed to lookup';
      }

      if (null != this._polylines[scopeId] && id in this._polylines[scopeId]) {
        return this._polylines[scopeId][id];
      } else {
        return null;
      }
    };

    this.hasPolyline = function (scopeId, id) {
      return (this.getPolyline(scopeId, id) instanceof Object);
    };

    this.forEachPolylineInScope = function(scopeId, fn) {
      if (null == fn) {
        throw 'fn was null or undefined';
      }

      angular.forEach(this._polylines[scopeId], function(polyline, id) {
        if (null != polyline) {
          fn(polyline, id);
        }
      });
    };

    this.forEachPolyline = function(fn) {
      if (null == fn) {
        throw 'fn was null or undefined';
      }

      angular.forEach(this._polylines, function(polylines, scopeId) {
        angular.forEach(polylines, function(polyline, id) {
          if (null != polyline) {
            fn(polyline, id);
          }
        });
      });
    };

    this.removePolyline = function(scopeId, id) {
      var removed = false;
      var polyline = this._polylines[scopeId][id];
      if (polyline) {
        polyline.setMap(null);
        removed = true;
      }

      this._polylines[scopeId][id] = null;
      delete this._polylines[scopeId][id];
      return removed;
    };


    this.getMap = function() {
      return this._map;
    };

    /** Instantiate controller */
    angular.bind(this, constructor)($scope, $element);

  }]);
})();

