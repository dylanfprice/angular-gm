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
    var markers = {};
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
     * Adds markers hash to the container.
     * @param {string} mapId the unique id of the map
     * @param {[google.maps.Marker]} markers to be added to the container
     */
    function setMarkers(mapId, newMarkers) {
      markers[mapId] = newMarkers;
    }
    /**
     * Get markers from the container.
     * @param {string} mapId the unique id of the map
     * @return {google.maps.Marker|undefined} the markers, or undefined if there are no
     *   markers for mapId
     */
    function getMarkers(mapId) {
      return markers[mapId];
    }

    /**
     * Get marker from the container by id.
     * @param {string} mapId the unique id of the map
     * @param {string} id the unique id of the marker
     * @return {google.maps.Marker|undefined} the marker, or undefined if there are no
     *   markers for mapId or no marker for the id
     */
    function getMarker(mapId, id) {

      if (markers[mapId] !== undefined)
        return markers[mapId][id];
      else
        return undefined;
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
      setMarkers: setMarkers,
      getMarkers: getMarkers,
      getMarker: getMarker,
      removeMap: removeMap,
      clear: clear
    };
  }]);
})();
