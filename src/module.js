'use strict';

/**
 * @doc module
 * @name angulargm
 *
 * @description
 * Module for embedding Google Maps into AngularJS applications. 
 *
 *
 * # API Documentation
 * See...
 *
 * + {@link angulargm.directive:gmMap gmMap} for usage of the `gm-map`
 * directive
 *
 * + {@link angulargm.directive:gmMarkers gmMarkers} for usage of the
 * `gm-markers` directive
 *
 * + {@link angulargm.directive:gmInfoWindow gmInfoWindow} for usage of the
 * `gm-info-window` directive
 *
 * + {@link angulargm.service:angulargmContainer angulargmContainer} if you
 * need to run custom configuration on the map, e.g. add new map types
 *
 * + {@link angulargm.service:angulargmDefaults angulargmDefaults} to override
 * the default map options
 *
 * + {@link angulargm.service:angulargmUtils angulargmUtils} to use utility
 * functions for LatLng and LatLngBounds
 *
 *
 * # Example Plunkers ([fullscreen](http://embed.plnkr.co/PYDYjVuRHaJpdntoJtqL))
 *  
 * <iframe style="width: 100%; height: 400px" src="http://embed.plnkr.co/PYDYjVuRHaJpdntoJtqL" frameborder="0" allowfullscreen="allowfullscreen">
 * </iframe>
 *
 * @author Dylan Price <the.dylan.price@gmail.com>
 */
(function() {
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
