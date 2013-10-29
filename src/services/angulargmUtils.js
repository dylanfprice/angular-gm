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

    function createHash(object, precision) {
      var hash = '';
 
      if ((object instanceof google.maps.LatLng)) {
        return object.toUrlValue(precision);
      } else {
        angular.forEach(object, function(child) {
          hash += createHash(child, precision);
        });
      }
 
      return hash;
    }

    return {
      latLngEqual: latLngEqual,
      boundsEqual: boundsEqual,
      latLngToObj: latLngToObj,
      objToLatLng: objToLatLng,
      hasNaN: hasNaN,
      getEventHandlers: getEventHandlers,
      createHash: createHash
    };
  }]);
})();
