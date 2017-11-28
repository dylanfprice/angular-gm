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

  factory('angulargmShape',
    ['$timeout', 'angulargmUtils',
    function($timeout, angulargmUtils) {

    /**
     * Check required attributes of a shape.
     */
    function checkRequiredAttributes(attrs) {
      if (!('gmObjects' in attrs)) {
        throw 'gmObjects attribute required';
      } else if (!('gmId' in attrs)) {
        throw 'gmId attribute required';
      }
    }

    /**
     * _formatEventName('gmShapesUpdated', 'marker') -> 'gmMarkersUpdated'
     */
    function _formatEventName(template, type) {
      var uppercasePluralType = type.charAt(0).toUpperCase() + type.slice(1) + 's';
      return template.replace('Shapes', uppercasePluralType);
    }

    /**
     * Create a mapping from object id -> object.
     * The object id is retrieved using scope.gmId
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

    /**
     * Create new shapes and add them to the map for objects which are not
     * currently on the map.
     */
    function _addNewElements(type, scope, controller, handlers, objectCache, optionsFn, objectsName) {
      var added = [];
      angular.forEach(objectCache, function(object, id) {
        var element = controller.getElement(type, scope.$id, id);

        var options = optionsFn(object);
        if (options == null) {
          return;
        }

        if (element) {
          controller.updateElement(type, scope.$id, id, options);
        } else {
          controller.addElement(type, scope.$id, id, options, objectsName);
          element = controller.getElement(type, scope.$id, id);
          added.push({
            id: id,
            element: element
          });

          // set up element event handlers
          angular.forEach(handlers, function(handler, event) {
            controller.addListener(element, event, function() {
              $timeout(function() {
                var context = {object: object};
                context[type] = element;
                if ((angular.version.major <= 1) && (angular.version.minor <= 2)) {
                  // scope is this directive's isolate scope
                  // scope.$parent is the scope of ng-transclude
                  // scope.$parent.$parent is the one we want
                  handler(scope.$parent.$parent, context);
                } else {
                  handler(scope.$parent.$parent.$parent , context);
                }
              });
            });
          });
        }
      });
      if (added.length > 0) {
        scope.$emit(_formatEventName('gmShapesAdded', type), objectsName, added);
      }
    }

    /**
     * Remove shape elements from the map which are no longer in objects.
     */
    function _removeOrphanedElements(type, scope, controller, objectCache, objectsName) {
      var orphaned = [];

      controller.forEachElementInScope(type, scope.$id, function(element, id) {
        if (!(id in objectCache)) {
          orphaned.push({
            id: id,
            element: element
          });
        }
      });

      angular.forEach(orphaned, function(orphan) {
        controller.removeElement(type, scope.$id, orphan.id);
      });

      if (orphaned.length > 0) {
        scope.$emit(_formatEventName('gmShapesRemoved', type), objectsName, orphaned);
      }
    }

    /**
     * Attach necessary watchers and listeners to scope to deal with:
     * - updating objects
     * - handling gmEvents
     * - listening for events
     */
    function _attachEventListeners(type, scope, attrs, controller, updateElements, updateOneElement) {

      // watch objects
      scope.$watch('gmObjects().length', function(newValue, oldValue) {
        if (newValue != null && newValue !== oldValue) {
          updateElements(scope, scope.gmObjects(), attrs.gmObjects);
        }
      });

      scope.$watch('gmObjects()', function(newValue, oldValue) {
        if (newValue != null && newValue !== oldValue) {
          updateElements(scope, scope.gmObjects(), attrs.gmObjects);
        }
      });

      // watch gmEvents
      scope.$watch('gmEvents()', function(newValue, oldValue) {
        if (newValue != null && newValue !== oldValue) {
          angular.forEach(newValue, function(eventObj) {
            var event = eventObj.event;
            var ids = eventObj.ids;
            angular.forEach(ids, function(id) {
              var element = controller.getElement(type, scope.$id, id);
              if (element != null) {
                $timeout(angular.bind(this, controller.trigger, element, event));
              }
            });
          });
        }
      });

      scope.$on(_formatEventName('gmShapesRedraw', type), function(event, objectsName) {
        if (objectsName == null || objectsName === attrs.gmObjects) {
          updateElements(scope);
          updateElements(scope, scope.gmObjects(), attrs.gmObjects);
        }
      });

      scope.$on(_formatEventName('gmShapesUpdate', type), function(event, objectsName, objectId) {
        if (objectsName == null) {
          updateElements(scope, scope.gmObjects(), attrs.gmObjects);
        } else if (objectsName === attrs.gmObjects) {
          if (objectId == null) {
            updateElements(scope, scope.gmObjects(), attrs.gmObjects);
          } else {
            updateOneElement(scope, scope.gmObjects(), attrs.gmObjects, objectId);
          }
        }
      });
    }

    /**
     * Takes care of setting up the directive for the given type of shape.
     * Assumes the following directive scope:
     *   scope: {
     *     gmId: '&',
     *     gmObjects: '&',
     *     gmEvents: '&'
     *   },
     *
     * And the angulargmMapController:
     *   require: '^gmMap',
     *
     * Also supports the following attributes:
     *   gmOn* (though some of this knowledge is in angulargmUtils as well)
     *
     * As well as the following events
     *   gmShapesUpdated
     *   gmShapesRedraw
     *
     * (e.g. gmMarkersUpdated and gmMarkersRedraw)
     *
     * See gmMarkers for a complete example.
     */
    function createShapeDirective(type, scope, attrs, controller, elementOptions) {
      checkRequiredAttributes(attrs);

      var updateElements = function(scope, objects, objectsName) {
        var objectCache = _generateObjectCache(scope, objects);
        var handlers = angulargmUtils.getEventHandlers(attrs); // map events -> handlers

        _addNewElements(
          type, scope, controller, handlers,
          objectCache, elementOptions, objectsName
        );

        _removeOrphanedElements(type, scope, controller, objectCache, objectsName);

        scope.$emit(_formatEventName('gmShapesUpdated', type), attrs.gmObjects);
      };

      var updateOneElement = function(scope, objects, objectsName, objectId) {
        var matchedObject;
        for (var i = 0; i < objects.length; i++) {
          if (scope.gmId({object: objects[i]}) === objectId) {
            matchedObject = objects[i];
            break;
          }
        }

        controller.updateElement(type, scope.$id, objectId, elementOptions(matchedObject));

        scope.$emit(_formatEventName('gmShapesUpdated', type), attrs.gmObjects, objectId);
      };

      _attachEventListeners(type, scope, attrs, controller, updateElements, updateOneElement);

      // initialize elements
      $timeout(angular.bind(null, updateElements, scope, scope.gmObjects(), attrs.gmObjects));
    }

    return {
      createShapeDirective: createShapeDirective
    };
  }]);
})();
