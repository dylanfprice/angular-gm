/**
 * @ngdoc directive
 * @name angulargm.directive:gmControl
 * @element ANY
 *
 * @description
 * A directive for attaching custom controls to a `gmMap`
 * You may have multiple per `gmMap`
 * To use, put this tag on an html element and the element and its children
 * will be placed into the map at `gm-position`.
 * See [Custom Controls](https://developers.google.com/maps/documentation/javascript/controls#CustomControls)
 * for more details
 *
 * @param {expression} gm-position an angular expression that evaluates to
 * one of the google.maps.ControlPosition constant values.
 * for example use TOP_RIGHT to place in the upper right section
 * @param {expression} gm-index not required. Should be a number.
 * Will be sent to google as the control index.
 * Controls with a lower index are placed first.
 */


(function () {
'use strict';

  angular.module('AngularGM').

  directive('gmControl',
    ['$compile',
    function($compile) {

    function link(scope, element, attrs, controller) {

      // check marker attrs
      if (!('gmPosition' in attrs)) {
        throw 'gmPosition attribute required';
      }
      var index = 1;
      if('gmIndex' in attrs){
        if(!angular.isNumber(scope.gmIndex)){
          throw 'gmIndex is not a number';
        }
        index = parseInt(scope.gmIndex, 10);
      }
      var ctrl = element[0];
      ctrl.index = index;
      controller.addControl(ctrl, attrs.gmPosition);
    }

    return {
      restrict: 'A',
      priority: 100,
      scope: {
        gmPosition: '=',
        gmIndex: '='
      },
      require: '^gmMap',
      link: link
    };
  }]);
})();
