'use strict';

/**
 * Module for embedding Google Maps into AngularJS applications.
 *
 * See...
 * + directives/gmMap.js              for usage of the <gm-map> directive
 * + directives/gmMarkers.js          for usage of the <gm-markers> directive
 * + services/angulargmContainer.js  if you need to run custom configuration on the map, e.g. add new map types
 *
 * @module angulargm
 */
(function() {
  angular.module('AngularGM', []).

  /**
   * Default configuration.
   */
  value('angulargmDefaults', {
    'mapOptions': {
      zoom : 8,
      center : new google.maps.LatLng(46, -120),
      mapTypeId : google.maps.MapTypeId.ROADMAP
    }
  });

})();
