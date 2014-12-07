/**
 * @ngdoc directive
 * @name angulargm.directive:gmInfoWindow
 * @element ANY
 *
 * @description
 * A directive for creating a google.maps.InfoWindow.
 *
 * @param {expression} gm-info-window scope variable to store the
 * [google.maps.InfoWindow](https://developers.google.com/maps/documentation/javascript/reference#InfoWindow)
 * in. Does not have to already exist.
 *
 * @param {expression} gm-info-window-options object in the current scope
 * that is a
 * [google.maps.InfoWindowOptions](https://developers.google.com/maps/documentation/javascript/reference#InfoWindowOptions)
 * object. If unspecified, google maps api defaults will be used.
 *
 * @param {expression} gm-on-*event* an angular expression which evaluates to an
 * event handler. This handler will be attached to the InfoWindow's \*event\*
 * event.  The variable `infoWindow` evaluates to the InfoWindow.  For example:
 * ```html
 * gm-on-closeclick="myCloseclickFn(infoWindow)"
 * ```
 * will call your myCloseclickFn whenever the InfoWindow is clicked closed. You
 * may have multiple `gm-on-*event*` handlers, but only one for each type of
 * event.
 */
(function () {
'use strict';

  angular.module('AngularGM').

  /*
   * Much of this code is taken from the Angular UI team, see:
   * https://github.com/angular-ui/ui-map/blob/master/ui-map.js
   */
  directive('gmInfoWindow',
    ['$parse', '$compile', '$timeout', 'angulargmUtils',
    function ($parse, $compile, $timeout, angulargmUtils) {

    /** aliases */
    var getEventHandlers = angulargmUtils.getEventHandlers;

    function link(scope, element, attrs, controller) {
      var opts = angular.extend({}, scope.$eval(attrs.gmInfoWindowOptions));
      opts.content = element[0];
      var model = $parse(attrs.gmInfoWindow);
      var infoWindow = model(scope);

      if (!infoWindow) {
        infoWindow = new google.maps.InfoWindow(opts);
        model.assign(scope, infoWindow);
      }

      var handlers = getEventHandlers(attrs);

      // set up info window event handlers
      angular.forEach(handlers, function(handler, event) {
        google.maps.event.addListener(infoWindow, event, function() {
          $timeout(function() {
            handler(scope, {
              infoWindow: infoWindow
            });
          });
        });
      });
    }

    return {
      restrict: 'A',
      priority: 100,
      scope: false,
      link: link
    };

  }]);
})();
