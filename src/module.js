/**
 * @doc module
 * @name angulargm
 *
 * @description
 * Module for embedding Google Maps into AngularJS applications.
 *
 * # Example Plunkers ([fullscreen](http://embed.plnkr.co/PYDYjVuRHaJpdntoJtqL))
 *
 * <iframe style="width: 100%; height: 400px" src="http://embed.plnkr.co/PYDYjVuRHaJpdntoJtqL" frameborder="0" allowfullscreen="allowfullscreen">
 * </iframe>
 *
 * Author: Dylan Price <the.dylan.price@gmail.com>
 */
(function() {
'use strict';

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
   *       'precision': 3,
   *       'markerConstructor': myCustomMarkerConstructor,
   *       'polylineConstructor': myCustomPolylineConstructor,
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
  factory('angulargmDefaults', function() {
    return {
      'precision': 3,
      'markerConstructor': google.maps.Marker,
      'polylineConstructor': google.maps.Polyline,
      'mapOptions': {
        zoom : 8,
        center : new google.maps.LatLng(46, -120),
        mapTypeId : google.maps.MapTypeId.ROADMAP
      }
    };
  });

})();
