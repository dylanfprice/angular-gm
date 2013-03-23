'use strict';

(function () {
  angular.module('googleMaps').

  /**
   * A directive for adding markers to a gmMap. You may have multiple per gmMap.
   *
   * To use, you specify an array of custom objects you define and tell the
   * directive how to extract location data from them. A marker will be created
   * for each of your objects. If you update the array of objects, the markers
   * will also update.
   *
   * Usage:
   * <gm-map ...>
   *   <gm-markers 
   *     gm-objects="myObjects" 
   *     gm-get-lat-lng="myGetLatLng" 
   *     gm-marker-options="myMarkerOptions" 
   *     gm-event="myEvent"
   *     gm-on-*event*="myEventHandler">
   *   </gm-markers>
   * </gm-map>
   *
   * myObjects:        an array of objects in the current scope. These can be
   *                   any objects you wish to attach to markers, the only
   *                   requirement is that they have a uniform method of
   *                   accessing a lat and lng.
   *
   * myGetLatLng:      an angular expression that given an object from
   *                   myObjects, evaluates to an object with lat and lng
   *                   properties. Your object can be accessed through the
   *                   variable 'object'.  For example, if myObjects is [
   *                     {id: 0, location: {lat:5,lng:5}}, 
   *                     {id: 1, location: {lat:6,lng:6}}
   *                   ]
   *                   then myGetLatLng would look like
   *                     { lat: object.location.lat, lng: object.location.lng }.
   *
   * myMarkerOptions:  object in the current scope that is a
   *                   google.maps.MarkerOptions object. If unspecified, google
   *                   maps api defaults will be used.
   *
   * myEvent:          name for a variable in the current scope that is used to
   *                   simulate events on a marker. Setting this variable to an
   *                   object of the form {
   *                     event: 'click',
   *                     location: new google.maps.LatLng(45, -120),
   *                   }
   *                   will generate the named event on the marker at the given
   *                   location, if such a marker exists. Note: when setting
   *                   the myEvent variable, you must set it to a new object
   *                   for the changes to be detected. Code like
   *                   'myEvent["location"] = new google.maps.LatLng(45, -120)'
   *                   will not work.
   *
   * myEventHandler:   an angular expression which evaluates to an event
   *                   handler. This handler will be attached to each marker's
   *                   *event* event. The variables 'object' and 'marker'
   *                   evaluate to your object and the google.maps.Marker,
   *                   respectively. For example:
   *                     gm-on-click="myClickFn(object, marker)"
   *                   will call your myClickFn whenever a marker is clicked.
   *                   You may have multiple gm-on-*event* handlers, but only
   *                   one for each type of event.
   *
   *
   * Only the gm-objects and gm-get-lat-lng attributes are required.
   *
   */
  directive('gmMarkers', ['$log', '$parse', '$timeout', 'googleMapsUtils', 
    function($log, $parse, $timeout, googleMapsUtils) {

    /** aliases */
    var latLngEqual = googleMapsUtils.latLngEqual;
    var objToLatLng = googleMapsUtils.objToLatLng;


    function link(scope, element, attrs, controller) {
      // check attrs
      if (!('gmObjects' in attrs)) {
        throw 'gmObjects attribute required';
      } else if (!('gmGetLatLng' in attrs)) {
        throw 'gmGetLatLng attribute required';
      }

      var handlers = {}; // map events -> handlers

      // retrieve gm-on-___ handlers
      angular.forEach(attrs, function(value, key) {
        if (key.lastIndexOf('gmOn', 0) === 0) {
          var event = angular.lowercase(key.substring(4));
          var fn = $parse(value);
          handlers[event] = fn;
        }
      });

      // fn for updating markers from objects
      var updateMarkers = function(objects) {

        var markerOptions = scope.gmMarkerOptions();
        var objectHash = {};

        angular.forEach(objects, function(object, i) {
          var latLngObj = scope.gmGetLatLng({object: object});
          var position = objToLatLng(latLngObj);
          if (position == null) {
            return;
          }

          // hash objects for quick access
          var hash = position.toUrlValue(controller.precision);
          objectHash[hash] = object;

          // add marker
          if (!controller.hasMarker(latLngObj.lat, latLngObj.lng)) {

            var options = {};
            angular.extend(options, markerOptions, {position: position});

            controller.addMarker(options);
            var marker = controller.getMarker(latLngObj.lat, latLngObj.lng);

            // set up marker event handlers
            angular.forEach(handlers, function(handler, event) {
              controller.addListener(marker, event, function() {
                $timeout(function() {
                       // scope is this directive's isolate scope
                       // scope.$parent is the scope of ng-transclude
                       // scope.$parent.$parent is the one we want
                  handler(scope.$parent.$parent, {
                    object: object,
                    marker: marker
                  });
                });
              });
            });
          }
        });

        // remove 'orphaned' markers
        var orphaned = [];
        
        controller.forEachMarker(function(marker) {
          var markerPosition = marker.getPosition();
          var hash = markerPosition.toUrlValue(controller.precision);

          if (!(hash in objectHash)) {
            orphaned.push(marker);
          }
        });

        angular.forEach(orphaned, function(marker, i) {
          var position = marker.getPosition();
          controller.removeMarker(position.lat(), position.lng());
        });
      }; // end updateMarkers()

      // watch objects
      scope.$watch('gmObjects().length', function(newValue, oldValue) {
        if (newValue != null && newValue !== oldValue) {
          updateMarkers(scope.gmObjects());
        }
      });

      scope.$watch('gmObjects()', function(newValue, oldValue) {
        if (newValue != null && newValue !== oldValue) {
          updateMarkers(scope.gmObjects());
        }
      });

      // watch gmEvent
      scope.$watch('gmEvent()', function(newValue, oldValue) {
        if (newValue != null && newValue !== oldValue) {
          var event = newValue.event;
          var location = newValue.location;
          var marker = controller.getMarker(location.lat(), location.lng());
          if (marker != null) {
            $timeout(angular.bind(this, controller.trigger, marker, event));
          }
        }
      });

      // initialize markers
      $timeout(angular.bind(this, updateMarkers, scope.gmObjects()));
    }


    return {
      restrict: 'AE',
      priority: 100,
      scope: {
        gmObjects: '&',
        gmGetLatLng: '&',
        gmMarkerOptions: '&',
        gmEvent: '&'
      },
      require: '^gmMap',
      link: link
    };
  }]);
})();
