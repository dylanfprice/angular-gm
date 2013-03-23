'use strict';

/**
 * Module for embedding google maps into applications.
 *
 * See...
 * directives/gmMap.js              for usage of the <gm-map> directive
 * directives/gmMarkers.js          for usage of the <gm-markers> directive
 * services/googleMapsContainer.js  if you need to run custom configuration on the map, e.g. add new map types
 */
(function() {
  angular.module('googleMaps', []).

  /**
   * Default configuration.
   */
  value('googleMapsDefaults', {
    'mapOptions': {
      zoom : 8,
      center : new google.maps.LatLng(46, -120),
      mapTypeId : google.maps.MapTypeId.ROADMAP
    }
  });

})();
