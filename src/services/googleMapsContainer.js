'use strict';

(function () {
  angular.module('googleMaps').

  /**
   * A container which maps mapIds to google.maps.Map instances, and
   * additionally allows getting a promise of a map for custom configuration of
   * the map.
   *
   * If you want a handle to the map, you should generally use the
   * #getMapPromise(mapId) method so you can guarantee the map will be
   * initialized. For example,
   *
   * function MyCtrl(googleMapsContainer) {
   *   var gmapPromise = googleMapsContainer.getMapPromise('myMapid');
   *
   *   gmapPromise.then(function(gmap) {
   *     // google map configuration here
   *   });
   * }
   */
  factory('googleMapsContainer', ['$q', function($q) {
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
      defers[mapId] = defer;
      return defer.promise;
    }

    /**
     * Removes map with given mapId from this container, and deletes the map.
     * In order for this to work you must ensure there are no references to the
     * map object.
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
