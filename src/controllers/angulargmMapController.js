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
        } else {
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

