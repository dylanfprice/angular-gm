describe('angulargmMapController', function() {
  var scope, elm;
  var mapCtrl, mapCntr;
  var latLngToObj;

  beforeEach(function() {
    module('AngularGM');
  });

  beforeEach(inject(function($rootScope, $controller, angulargmContainer, angulargmUtils) {
    // set up scope
    scope = $rootScope.$new();
    scope.gmMapOptions = function() {
      return {
        center: {lat: 2, lng: 3},
        zoom: 1,
        mapTypeId: google.maps.MapTypeId.TERRAIN
      };
    };
    scope.gmMapId = function() {
      return 'test';
    };

    // set up element
    elm = angular.element('<div gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds" gm-map-options="mapOptions">' +
                                '<div id="test"></div>' +
                              '</div');

    mapCtrl = $controller('angulargmMapController', {$scope: scope, $element: elm});
    mapCntr = angulargmContainer;

    /* aliases */
    latLngToObj = angulargmUtils.latLngToObj;
  }));


  afterEach(inject(function(angulargmContainer) {
    if (scope && scope.$destroy) {
      scope.$destroy();
    }
    angulargmContainer.removeMap('test');
  }));


  it('constructs the map using the provided map options', function() {
    expect(mapCtrl.dragging).toBeFalsy();
    expect(mapCtrl.center).toEqual({lat: 2, lng: 3});
    expect(mapCtrl.zoom).toEqual(1);
    var map = mapCntr.getMap(scope.gmMapId());
    expect(mapCtrl.bounds).toEqual(map.getBounds());
    expect(mapCtrl.mapTypeId).toEqual(google.maps.MapTypeId.TERRAIN);
  });


  it('constructs the map using defaults when there are no options', inject(function($rootScope, $controller, angulargmDefaults) {
    scope = $rootScope.$new();
    scope.gmMapOptions = function() { };
    scope.gmMapId = function() {
      return 'test2';
    };

    var elm2 = angular.element('<div gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds">' +
                                '<div id="test2"></div>' +
                              '</div');
    mapCtrl = $controller('angulargmMapController', {$scope: scope, $element: elm2});

    expect(mapCtrl.center).toEqual(angulargmDefaults.mapOptions.center);
    expect(mapCtrl.zoom).toEqual(angulargmDefaults.mapOptions.zoom);
  }));


  it('resets map on controller re-instantiation', inject(function($rootScope, $controller) {
    var map = mapCntr.getMap(scope.gmMapId());
    var scope2 = $rootScope.$new();
    var gmMapOptions = scope.gmMapOptions();
    var gmMapId = scope.gmMapId();
    scope2.gmMapOptions = function() { return gmMapOptions };
    scope2.gmMapId = function() { return gmMapId };

    // move map
    var newCenter = {
      lat: gmMapOptions.center.lat + 5,
      lng: gmMapOptions.center.lng + 5
    };
    map.setCenter(newCenter);
    map.setZoom(gmMapOptions.zoom + 2);
    map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
    expect(mapCtrl.center).toEqual(newCenter); // sanity check--we actually changed something

    // destroy scope
    scope.$destroy();

    // re-instantiate controller
    mapCtrl = $controller('angulargmMapController', {$scope: scope2, $element: elm});

    expect(mapCtrl.center).toEqual(gmMapOptions.center);
    expect(mapCtrl.zoom).toEqual(gmMapOptions.zoom);
    expect(map.getMapTypeId()).toEqual(gmMapOptions.mapTypeId);
  }));


  it('removes map elements on scope destroy', function() {
    var mapId = scope.gmMapId();
    scope.$destroy();
    numMarkers = 0;
    mapCtrl.forEachElement('marker', function(marker) {
      numMarkers++;
    });
    expect(numMarkers).toEqual(0);
  });


  it('adds listeners to the map', function() {
    var called = false;
    mapCtrl.addMapListener('center_changed', function() {
      called = true;
    });
    google.maps.event.trigger(mapCntr.getMap(scope.gmMapId()), 'center_changed');

    expect(called).toBeTruthy();
  });


  it('adds one time listeners to the map', function() {
    var callCount = 0;
    mapCtrl.addMapListenerOnce('center_changed', function() {
      callCount++;
    });
    // Does get added to the listeners hash
    expect(mapCtrl._listeners.center_changed).toBeDefined();

    google.maps.event.trigger(mapCntr.getMap(scope.gmMapId()), 'center_changed');
    google.maps.event.trigger(mapCntr.getMap(scope.gmMapId()), 'center_changed');

    expect(callCount).toEqual(1);
  });

  it('clears listeners when the map is "destroyed"', function() {
    mapCtrl.addMapListener('center_changed', function() {});
    expect(mapCtrl._listeners.center_changed).toBeDefined();
    scope.$destroy();
    expect(mapCtrl._listeners.center_changed).not.toBeDefined();
  });

  it('clears one time listeners when the map is "destroyed"', function() {
    mapCtrl.addMapListenerOnce('center_changed', function() {});
    expect(mapCtrl._listeners.center_changed).toBeDefined();
    scope.$destroy();
    expect(mapCtrl._listeners.center_changed).not.toBeDefined();
  });

  it('keeps map listeners in a hash', function() {
    var listeners = mapCtrl._listeners;
    expect(listeners.click).toBeUndefined();
    expect(listeners.center_changed).toBeUndefined();

    mapCtrl.addMapListener('center_changed', function() {});
    mapCtrl.addMapListener('click', function() {});
    expect(listeners.click).not.toBeUndefined();
    expect(listeners.center_changed).not.toBeUndefined();
  });

  it('keeps multiple listeners on an event', function() {
    var aFunc = jasmine.createSpy('firstFunc');
    var anotherFunc = jasmine.createSpy('secondFunc');

    mapCtrl.addMapListener('click', aFunc);
    mapCtrl.addMapListener('click', anotherFunc);

    expect(angular.isArray(mapCtrl._listeners.click)).toBeTruthy();
    expect(mapCtrl._listeners.click.length).toEqual(2);

    mapCtrl.mapTrigger('click');
    expect(aFunc).toHaveBeenCalled();
    expect(anotherFunc).toHaveBeenCalled();
  });

  it('adds generic listeners', function() {
    var called = false;
    var object = {};
    mapCtrl.addListener(object, 'event', function() {
      called = true;
    });
    google.maps.event.trigger(object, 'event');

    expect(called).toBeTruthy();
  });


  it('adds generic one time listeners', function() {
    var callCount = 0;
    var object = {};
    mapCtrl.addListenerOnce(object, 'event', function() {
      callCount++;
    });
    google.maps.event.trigger(object, 'event');
    google.maps.event.trigger(object, 'event');

    expect(callCount).toEqual(1);
  });


  it('triggers map events', function() {
    var callCount = 0;
    mapCtrl.addMapListener('event', function() {
      callCount++;
    });
    mapCtrl.mapTrigger('event');

    expect(callCount).toEqual(1);
  });


  it('triggers generic events', function() {
    var callCount = 0;
    var object = {};
    mapCtrl.addListener(object, 'event', function() {
      callCount++;
    });
    mapCtrl.trigger(object, 'event');

    expect(callCount).toEqual(1);
  });

  describe('element functions', function() {
    var position,
        id,
        id2,
        scope,
        scope2,
        markerOptions,
        objectsName,
        objectsName2;


    beforeEach(function() {
      position = {lat: 1, lng: 2};
      id = 1;
      id2 = 2;
      scope = 'scope';
      scope2 = 'scope2';
      objectsName = 'people';
      objectsName2 = 'notPeople';

      markerOptions = {
        position: position
      };

    });

    describe('addElement', function() {

      it('adds new markers to the map', function() {
        var added = mapCtrl.addElement('marker', scope, id, markerOptions, objectsName);
        expect(added).toBeTruthy();
      });

      it('does not replace markers already on the map', function() {
        mapCtrl.addElement('marker', scope, id, markerOptions, objectsName);
        var added = mapCtrl.addElement('marker', scope, id, markerOptions, objectsName);
        expect(added).toBeFalsy();
      });

      it('does not add markers with no position', function() {
        var added = angular.bind(this, mapCtrl.addElement, 'marker', scope, id, {}, objectsName);
        expect(added).toThrow();
      });

      it('does not add markers with no id', function() {
        var added = angular.bind(this, mapCtrl.addElement, 'marker', scope, null, markerOptions, objectsName);
        expect(added).toThrow();
      });
    });

    describe('getElement', function() {

      it('retrieves markers that are on the map', function() {
        mapCtrl.addElement('marker', scope, id, markerOptions, objectsName);
        var marker = mapCtrl.getElement('marker', scope, id);
        expect(latLngToObj(marker.getPosition())).toEqual(markerOptions.position);
      });

      it('returns null for marker not on the map', function() {
        var marker = mapCtrl.getElement('marker', scope, id2);
        expect(marker).toBeNull();
      });

    });

    describe('updateElement', function() {

      it('updates marker on the map', function() {
        mapCtrl.addElement('marker', scope, id, markerOptions, objectsName);
        var newPosition = {lat: position.lat + 1, lng: position.lng + 1};
        var updated = mapCtrl.updateElement('marker', scope, id, {position: newPosition});
        var marker = mapCtrl.getElement('marker', scope, id);
        expect(updated).toBeTruthy();
        expect(latLngToObj(marker.getPosition())).toEqual(newPosition);
      });

      it('does not update marker not on the map', function() {
        var updated = mapCtrl.updateElement('marker', scope, id, {position: position}, objectsName);
        expect(updated).toBeFalsy();
      });
    });


    describe('removeElement', function() {

      beforeEach(function() {
        mapCtrl.addElement('marker', scope, id, markerOptions, objectsName);
      });

      it('removes markers from the map', function() {
        var removed = mapCtrl.removeElement('marker', scope, id);
        expect(removed).toBeTruthy();
        expect(mapCtrl.getElement('marker', scope, id)).toBeNull();
      });


      it('does not remove markers not on the map', function() {
        var removed = mapCtrl.removeElement('marker', scope, id2);
        expect(removed).toBeFalsy();
        expect(mapCtrl.getElement('marker', scope, id)).not.toBeNull();
      });

    });


    it('can apply a function to each marker', function() {
      mapCtrl.addElement('marker', scope, id, markerOptions, objectsName);
      mapCtrl.addElement('marker', scope2, id, markerOptions, objectsName);
      markers = [];
      mapCtrl.forEachElement('marker', function(marker) {
        markers.push(marker);
      });
      expect(markers.length).toEqual(2);
      expect(latLngToObj(markers[0].getPosition())).toEqual(markerOptions.position);
      expect(latLngToObj(markers[1].getPosition())).toEqual(markerOptions.position);
    });


    it('can apply a function to each marker in a scope', function() {
      mapCtrl.addElement('marker', scope, id, markerOptions, objectsName);
      mapCtrl.addElement('marker', scope2, id, markerOptions, objectsName);
      markers = [];
      mapCtrl.forEachElementInScope('marker', scope, function(marker) {
        markers.push(marker);
      });
      expect(markers.length).toEqual(1);
    });

    it('does not apply a function to removed markers', function() {
      var called = false;
      mapCtrl.forEachElement('marker', function(marker) {
        called = true;
      });
      expect(called).toBeFalsy();
    });

    it('can retrieve the markers in a scope', function() {
      mapCtrl.addElement('marker', scope, id, markerOptions, objectsName);
      mapCtrl.addElement('marker', scope2, id2, markerOptions, objectsName2);
      var result = mapCtrl.getElementsByScopeId('marker', scope);
      expect(result).toEqual({1: jasmine.any(Object)});
    });

    it('can retrieve the scopeId by objectsName', function() {
      mapCtrl.addElement('marker', scope, id, markerOptions, objectsName);
      var scopeId = mapCtrl.getScopeIdByObjectsName(objectsName);
      expect(scopeId).toEqual(scope);
    });

    it('can retrieve gmMarkerClusterer options by objectsName', function() {
      mapCtrl.setMarkerClustererOptions(objectsName, {asdf: 1234});
      var options = mapCtrl.getMarkerClustererOptions(objectsName);
      expect(options).toEqual({asdf: 1234});
    });

  });
});
