describe('gmMap', function() {
  var elm, scope, mapCtrl; 
  var listeners, listenersOnce;
  var initCenter, initZoom, initBounds;
  var map;

  beforeEach(function() {
    module('AngularGM');
  });


  beforeEach(inject(function($rootScope, $compile, angulargmContainer, angulargmUtils) {
    // compile angulargm directive
    elm = angular.element('<gm-map gm-map-id="mapId" gm-center="pCenter" gm-zoom="pZoom" gm-bounds="pBounds" gm-map-options="mapOptions">' +
                          '</gm-map>');

    scope = $rootScope.$new();
    scope.mapOptions = {
      center: new google.maps.LatLng(1, 2),
      zoom: 3
    }
    scope.mapId = 'test';
    $compile(elm)(scope);
    scope.$digest();

    map = angulargmContainer.getMap('test');

    initCenter = new google.maps.LatLng(1, 2);
    initZoom = 3;
    initBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(4, 5),
      new google.maps.LatLng(6, 7)
    );
    
    // get MapController
    mapCtrl = elm.controller('gmMap');
    spyOn(mapCtrl, 'mapTrigger').andCallThrough();
    var center, zoom, bounds;
    Object.defineProperties(mapCtrl, {
      'center': {
        get: function() {return center;},
        set: function(newC) {center = newC;},
      },
      'zoom': {
        get: function() { return zoom;},
        set: function(newZ) {zoom = newZ;},
      },
      'bounds': {
        get: function() { return bounds;},
        set: function(newB) {bounds = newB;},
      },
    });

    mapCtrl.center = initCenter;
    mapCtrl.zoom = initZoom;
    mapCtrl.bounds = initBounds;
  }));


  function testRequiredAttribute($rootScope, $compile, angulargmContainer, elm) {
    scope = $rootScope.$new();
    scope.mapId = 'test2';
    $compile(elm)(scope);
    expect(scope.$digest).toThrow();
    angulargmContainer.removeMap('test2');
  }


  it('requires the mapId attribute', inject(function($rootScope, $compile) {
    elm = angular.element('<gm-map gm-center="pCenter" gm-zoom="pZoom" gm-bounds="pBounds"></gm-map>');
    scope = scope.$new();
    expect(angular.bind(this, $compile(elm), scope)).toThrow();
  }));


  it('requires the center attribute', inject(function($rootScope, $compile, angulargmContainer) {
    elm = angular.element('<gm-map gm-map-id="mapId" gm-zoom="pZoom" gm-bounds="pBounds"></gm-map>');
    testRequiredAttribute($rootScope, $compile, angulargmContainer, elm);
  }));


  it('requires the zoom attribute', inject(function($rootScope, $compile, angulargmContainer) {
    elm = angular.element('<gm-map gm-map-id="mapId" gm-center="pCenter" gm-bounds="pBounds"></gm-map>');
    testRequiredAttribute($rootScope, $compile, angulargmContainer, elm);
  }));


  it('requires the bounds attribute', inject(function($rootScope, $compile, angulargmContainer) {
    elm = angular.element('<gm-map gm-map-id="mapId" gm-center="pCenter" gm-zoom="pZoom"></gm-map>');
    testRequiredAttribute($rootScope, $compile, angulargmContainer, elm);
  }));


  it('updates scope on map initialization', inject(function($timeout) {
    google.maps.event.trigger(map, 'bounds_changed');

    $timeout.flush();
    
    expect(scope.pCenter).toEqual(initCenter);
    expect(scope.pZoom).toEqual(initZoom);
    expect(scope.pBounds).toEqual(initBounds);
  }));


  it('ignores initial scope values', inject(function($timeout) {
    scope.pCenter = { lat: 8, lng: 9 };
    scope.pZoom = 10;
    scope.pBounds = {
      southWest: {lat: 11, lng: 12},
      northEast: {lat: 13, lng: 14}
    };

    google.maps.event.trigger(map, 'bounds_changed');
    $timeout.flush();

    expect(scope.pCenter).not.toEqual(initCenter);
    expect(scope.pZoom).not.toEqual(initZoom);
    expect(scope.pBounds).not.toEqual(initBounds);
  }));


  // center and bounds changed, but zoom is same
  function testMapMovedEvent($timeout, event) {
    var center = new google.maps.LatLng(8, 9);
    var bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(10, 11),
      new google.maps.LatLng(12, 13));

    mapCtrl.center = center;
    mapCtrl.bounds = bounds;

    google.maps.event.trigger(map, event);
    $timeout.flush();

    expect(scope.pCenter).toEqual(center);
    expect(scope.pZoom).toEqual(initZoom);
    expect(scope.pBounds).toEqual(bounds);
  }


  it('updates scope on map drag', inject(function($timeout) {
    testMapMovedEvent($timeout, 'drag');
  }));


  it('updates scope on map center_changed', inject(function($timeout) {
    testMapMovedEvent($timeout, 'center_changed');
  }));


  it('updates scope on map zoom_changed', inject(function($timeout) {
    mapCtrl.zoom = initZoom + 2;
    var zoom = initZoom + 2;

    google.maps.event.trigger(map, 'zoom_changed');
    $timeout.flush();

    expect(scope.pZoom).toEqual(zoom);
  }));


  it('updates map on scope center changed', function() {
    var center = new google.maps.LatLng(8, 9);
    scope.pCenter = center;
    scope.$digest();
    expect(mapCtrl.center).toEqual(center);
  });

  
  it('updates map on scope zoom changed', function() {
    scope.pZoom = initZoom + 2;
    scope.$digest();
    expect(mapCtrl.zoom).toEqual(initZoom + 2);
  });

  
  it('updates map on scope bounds changed', function() {
    var bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(8, 9),
      new google.maps.LatLng(10, 11));

    scope.pBounds = bounds;
    scope.$digest();

    expect(mapCtrl.bounds).toEqual(bounds);
  });


  it('does not update map when scope properties set to null', function() {
    scope.pCenter = null;
    scope.pZoom = null;
    scope.pBounds = null;
    scope.$digest();
    expect(mapCtrl.center).not.toEqual(null);
    expect(mapCtrl.zoom).not.toEqual(null);
    expect(mapCtrl.bounds).not.toEqual(null);
  });


  it('listens for map resize event', function() {
    scope.$broadcast('gmMapResize', scope.mapId);
    expect(mapCtrl.mapTrigger).toHaveBeenCalledWith('resize');
  });

  
  it('ignores map resize for different map', function() {
    scope.$broadcast('gmMapResize', scope.mapId + 'diff');
    expect(mapCtrl.mapTrigger).not.toHaveBeenCalled();
  });


});
