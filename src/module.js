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
   *   $provide.decorator('angulargmDefaults', function() {
   *     return {
   *       'mapOptions': {
   *         center: new google.maps.LatLng(55, 111),
   *         mapTypeId: google.maps.MapTypeId.SATELLITE,
   *         ...
   *       }
   *     };
   *   });
   * });
   * ```
   *
   * @module angulargmDefaults
   */
  value('angulargmDefaults', {
    'mapOptions': {
      zoom : 8,
      center : new google.maps.LatLng(46, -120),
      mapTypeId : google.maps.MapTypeId.ROADMAP
    }
  });

})();
