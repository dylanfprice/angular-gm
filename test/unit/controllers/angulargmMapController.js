describe('angulargmMapController', function() {
  var scope;
  var mapCtrl, mapCntr;

  beforeEach(function() {
    module('AngularGM');
  });


  beforeEach(inject(function($rootScope, $controller, angulargmContainer) {
    // set up scope
    scope = $rootScope.$new();
    scope.gmMapOptions = function() {
      return {
        center: new google.maps.LatLng(2, 3),
        zoom: 1,
        mapTypeId: google.maps.MapTypeId.TERRAIN
      };
    };
    scope.gmMapId = function() {
      return 'test';
    };

    // set up element
    var elm = angular.element('<div gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds" gm-map-options="mapOptions">' +
                                '<div id="test"></div>' +
                              '</div');

    mapCtrl = $controller('angulargmMapController', {$scope: scope, $element: elm});
    mapCntr = angulargmContainer;
  }));


  it('constructs the map using the provided map options', function() {
    expect(mapCtrl.dragging).toBeFalsy();
    expect(mapCtrl.center).toEqual(new google.maps.LatLng(2, 3));
    expect(mapCtrl.zoom).toEqual(1);
    var map = mapCntr.getMap('test');
    expect(mapCtrl.bounds).toEqual(map.getBounds());
  });


  it('constructs the map using defaults when there are no options', inject(function($rootScope, $controller, angulargmDefaults) {
    scope = $rootScope.$new();
    scope.gmMapOptions = function() { };
    scope.gmMapId = function() {
      return 'test2';
    };

    var elm = angular.element('<div gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds">' +
                                '<div id="test2"></div>' +
                              '</div');
    mapCtrl = $controller('angulargmMapController', {$scope: scope, $element: elm});

    expect(mapCtrl.center).toEqual(angulargmDefaults.mapOptions.center);
    expect(mapCtrl.zoom).toEqual(angulargmDefaults.mapOptions.zoom);
  }));


  it('removes markers on scope destroy', function() {
    var mapId = scope.gmMapId();
    scope.$destroy();
    numMarkers = 0;
    mapCtrl.forEachMarker(function(marker) {
      numMarkers++;  
    });
    expect(numMarkers).toEqual(0);
  });


  it('adds listeners to the map', function() {
    var called = false;
    mapCtrl.addMapListener('center_changed', function() {
      called = true;
    });
    google.maps.event.trigger(mapCntr.getMap('test'), 'center_changed');

    expect(called).toBeTruthy();
  });


  it('adds one time listeners to the map', function() {
    var callCount = 0;
    mapCtrl.addMapListenerOnce('center_changed', function() {
      callCount++;
    });
    google.maps.event.trigger(mapCntr.getMap('test'), 'center_changed');
    google.maps.event.trigger(mapCntr.getMap('test'), 'center_changed');

    expect(callCount).toEqual(1);
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


  describe('marker functions', function() {
    var position, positionSame, positionVeryClose, position2;
    var markerOptions, markerOptionsSame, markerOptionsVeryClose, markerOptions2;

    beforeEach(function() {
      position = new google.maps.LatLng(1, 2);
      positionSame = new google.maps.LatLng(1.0004, 2.0004);
      positionVeryClose = new google.maps.LatLng(1.0005, 2.0005);
      position2 = new google.maps.LatLng(3, 4);

      scope = 'scope';

      markerOptions = {
        position: position
      };
      markerOptionsSame = {
        position: positionSame
      };
      markerOptionsVeryClose = {
        position: positionVeryClose
      };
      markerOptions2 = {
        position: position2
      };

      mapCtrl.addMarker(scope, markerOptions);
    });

    describe('addMarker', function() {

      it('adds new markers to the map', function() {
        added = mapCtrl.addMarker(scope, markerOptions2);
        expect(added).toBeTruthy();
      });

      
      it('does not add markers already on the map', function() {
        var added = mapCtrl.addMarker(scope, markerOptions);
        expect(added).toBeFalsy();
      });


      it('adds markers which differ by at least 0.0005', function() {
        var added = mapCtrl.addMarker(scope, markerOptionsVeryClose);
        expect(added).toBeTruthy();
      });


      it('does not add markers which differ less than 0.0005', function() {
        var added = mapCtrl.addMarker(scope, markerOptionsSame);
        expect(added).toBeFalsy();
      });

    });


    describe('getMarker', function() {

      it('retrieves markers that are on the map', function() {
        var marker = mapCtrl.getMarker(scope, position.lat(), position.lng());
        expect(marker.getPosition()).toEqual(markerOptions.position);
      });


      it('returns null for marker not on the map', function() {
        var marker = mapCtrl.getMarker(scope, position2.lat(), position2.lng());
        expect(marker).toBeNull();
      });


      it('retrives markers given a lat and lng that are within 0.0005', function() {
        var marker = mapCtrl.getMarker(scope, positionSame.lat(), positionSame.lng());
        expect(marker.getPosition()).toEqual(markerOptions.position);
      });


      it('does not retrieve marker given lat and lng more than 0.0005 away', function() {
        var marker = mapCtrl.getMarker(scope, positionVeryClose.lat(), positionVeryClose.lng());
        expect(marker).toBeNull();
      });

    });


    describe('removeMarker', function() {

      it('removes markers from the map', function() {
        var removed = mapCtrl.removeMarker(scope, position.lat(), position.lng());
        expect(removed).toBeTruthy();
        expect(mapCtrl.getMarker(scope, position.lat(), position.lng())).toBeNull();
      });


      it('does not remove markers not on the map', function() {
        var removed = mapCtrl.removeMarker(scope, position2.lat(), position2.lng());
        expect(removed).toBeFalsy();
        expect(mapCtrl.getMarker(scope, position.lat(), position.lng())).not.toBeNull();
      });

    });


    it('can apply a function to each marker', function() {
      markers = [];
      mapCtrl.forEachMarker(function(marker) {
        markers.push(marker);
      });
      expect(markers.length).toEqual(1);
      expect(markers[0].getPosition()).toEqual(markerOptions.position);
    });


    it('does not apply a function to removed markers', function() {
      mapCtrl.removeMarker(scope, 1, 2);
      var called = false;
      mapCtrl.forEachMarker(function(marker) {
        called = true;
      });
      expect(called).toBeFalsy();
    });

  });
});
