/**
 * @ngdoc service
 * @name angulargm.service:angulargmShape
 *
 * @description
 * Directive functions for map shapes (marker, polyline, etc.)
 */
(function () {
'use strict';

  angular.module('AngularGM').

  /**
   * angulargmShape 'owns' the following attributes related to shapes:
   *   gmId
   *   gmObjects
   *   gmEvents
   *   gmOn* (though some of this knowledge is in angulargmUtils as well)
   *
   * as well as the following events
   *   gmShapeUpdated
   *   gmShapeRedraw
   *
   * e.g. gmMarkersUpdated and gmMarkersRedraw 
   */
  factory('angulargmShape', 
    ['$timeout', 'angulargmUtils', 
    function($timeout, angulargmUtils) {

    /**
     *
     */
    function checkRequiredAttributes(attrs) {
      if (!('gmObjects' in attrs)) {
        throw 'gmObjects attribute required';
      } else if (!('gmId' in attrs)) {
        throw 'gmId attribute required';
      }
    }

    /**
     *
     */
    function _generateObjectCache(scope, objects) {
      var objectCache = {};
      angular.forEach(objects, function(object) {
        // cache objects for quick access
        var id = scope.gmId({object: object});
        objectCache[id] = object;
      });
      return objectCache;
    }

    function _addNewElements(type, scope, controller, handlers, objectCache, optionsFn) {
      angular.forEach(objectCache, function(object, id) {
        var elementExists = controller.hasElement(type, scope.$id, id);

        if (!elementExists) {
          var options = optionsFn(object);
          if (options == null) {
            return;
          }

          controller.addElement(type, scope.$id, id, options);
          var element = controller.getElement(type, scope.$id, id);

          // set up element event handlers
          angular.forEach(handlers, function(handler, event) {
            controller.addListener(element, event, function() {
              $timeout(function() {
                var context = {object: object};
                context[type] = element;
                     // scope is this directive's isolate scope
                     // scope.$parent is the scope of ng-transclude
                     // scope.$parent.$parent is the one we want
                handler(scope.$parent.$parent, context);
              });
            });
          });
        }
      });
    }

    function _removeOrphanedElements(type, scope, controller, objectCache) {
      var orphaned = [];
      
      controller.forEachElementInScope(type, scope.$id, function(element, id) {
        if (!(id in objectCache)) {
          orphaned.push(id);
        }
      });

      angular.forEach(orphaned, function(id) {
        controller.removeElement(type, scope.$id, id);
      });
    }

    function _formatEventName(template, type) {
      var uppercasePluralType = type.charAt(0).toUpperCase() + type.slice(1) + 's';
      return template.replace('Shape', uppercasePluralType);
    }

    function updateElementsFactory(type, scope, attrs, controller, elementOptions) {
      function updateElements(scope, objects) {
        var objectCache = _generateObjectCache(scope, objects);
        var handlers = angulargmUtils.getEventHandlers(attrs); // map events -> handlers

        _addNewElements(
          type, scope, controller, handlers,
          objectCache, elementOptions
        );

        _removeOrphanedElements(type, scope, controller, objectCache);

        scope.$emit(_formatEventName('gmShapeUpdated', type), attrs.gmObjects);
      }

      return updateElements;
    }

    return {
      checkRequiredAttributes: checkRequiredAttributes,
      updateElementsFactory: updateElementsFactory
    };
  }]);
})();
