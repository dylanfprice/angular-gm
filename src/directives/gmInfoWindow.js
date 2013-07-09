'use strict';

/**
 * A directive for creating a google.maps.InfoWindow.  
 *
 * Usage:
 * ```html
 * <div gm-info-window="myInfoWindow"
 *      gm-info-window-options="myInfoWindowOptions"
 *      gm-on-*event*="myEventHandler">
 * </div>
 * ```
 *
 *   + `gm-info-window`: name of scope variable to store the
 *   google.maps.InfoWindow in. Does not have to already exist.
 *
 *   + `gm-info-window-options`: object in the current scope that is a
 *   google.maps.InfoWindowOptions object. If unspecified, google maps api
 *   defaults will be used.
 *
 *   + `gm-on-*event*`: an angular expression which evaluates to an event
 *   handler. This handler will be attached to the InfoWindow's \*event\*
 *   event.  The variable 'infoWindow' evaluates to the InfoWindow.  For
 *   example: `gm-on-closeclick="myCloseclickFn(infoWindow)"` will call your
 *   myCloseclickFn whenever the InfoWindow is clicked closed. You may have
 *   multiple `gm-on-*event*` handlers, but only one for each type of event.
 *
 * @module gmInfoWindow
 */
(function () {

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

      /**
       * The info window's contents dont' need to be on the dom anymore,
       * google maps has them stored. So we just replace the infowindow
       * element with an empty div. (we don't just straight remove it from
       * the dom because straight removing things from the dom can mess up
       * angular) 
       */
      element.replaceWith('<div></div>');

      //Decorate infoWindow.open to $compile contents before opening
      var _open = infoWindow.open;
      infoWindow.open = function open(map, anchor) {
        $compile(element.contents())(scope);
        _open.call(infoWindow, map, anchor);
      };
    }

    return {
      restrict: 'A',
      priority: 100,
      scope: false,
      link: link
    };

  }]);
})();
