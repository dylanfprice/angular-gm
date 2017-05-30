/**
 * @ngdoc directive
 * @name angulargm.directive:gmMarkerClusterer
 * @element GM-MARKERS
 *
 * @description
 * A directive for clustering markers created by a `gmMarkers`.
 *
 * To use, add it as an attribute to a gm-markers directive.
 *
 * Be sure to include markerclusterer.js
 * (https://github.com/gmaps-marker-clusterer/gmaps-marker-clusterer)
 * in your project.
 *
 * Use the gmMarkerClustererOptions attribute of gmMarkers to
 * override the default clusterer options;
 */

(function () {
  'use strict';

  angular.module('AngularGM').

    directive('gmMarkerClusterer',
    [function () {

      return {
        restrict: 'A',
        require: '^gmMap',
        link: function (scope, elem, attr, ctrl) {

          var hasInitialData = false;
          var markerClusterer;

          function init() {
            var scopeId = ctrl.getScopeIdByObjectsName(attr.gmObjects);
            var markersCollection = ctrl.getElementsByScopeId('marker', scopeId);
            var map = ctrl.getMap();
            var options = ctrl.getMarkerClustererOptions(attr.gmObjects);
            markerClusterer = new MarkerClusterer(map, [], options);

            angular.forEach(markersCollection, function (value, key) {
              // false as second argument to avoid redraws after each marker
              markerClusterer.addMarker(value, false);
            });

            markerClusterer.redraw();
          }

          scope.$on('gmMarkersUpdated', function (event, objectsName) {
            if (objectsName === attr.gmObjects) {
              if (!hasInitialData) {
                init();
                hasInitialData = true;
              }
              else if (markerClusterer) {
                markerClusterer.repaint();
              }
            }
          });

          scope.$on('gmMarkersAdded', function (event, objectsName, added) {
            if (hasInitialData && objectsName === attr.gmObjects && markerClusterer && added && added.length > 0) {
              angular.forEach(added, function (value, index) {
                // false as second argument to avoid redraws after each marker
                markerClusterer.addMarker(value.element, false);
              });
              markerClusterer.redraw();
            }
          });

          scope.$on('gmMarkersRemoved', function (event, objectsName, removed) {
            if (hasInitialData && objectsName === attr.gmObjects && markerClusterer && removed && removed.length > 0) {
              angular.forEach(removed, function (value, index) {
                markerClusterer.removeMarker(value.element);
              });
            }
          });

        }
      };
    }]);
})();
