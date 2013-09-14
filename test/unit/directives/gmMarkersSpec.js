describe('gmMarkers', function() {
  var elm, scope, markersScopeId, mapCtrl;
  var objToLatLng;
  var $timeout;

  beforeEach(function() {
    module('AngularGM');
  });

  beforeEach(inject(function($rootScope, $compile, _$timeout_, angulargmUtils) {
    // set up scopes
    scope = $rootScope.$new();
    scope.people = [
      {name: '0', lat: 1, lng: 2},
      {name: '3', lat: 4, lng: 5}
    ];
    scope.getOpts = function(person) {
      return {
        key: 'value',
        title: person.name
      };
    };
    scope.mapId = 'test';
  
    $timeout = _$timeout_;
    objToLatLng = angulargmUtils.objToLatLng;

    // compile angulargmMarkers directive
    elm = angular.element('<gm-map gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds">' +
                            '<gm-markers ' +
                              'gm-objects="people"' +
                              'gm-get-lat-lng="{lat:object.lat,lng:object.lng}"' + 
                              'gm-get-marker-options="getOpts(object)"' + 
                              'gm-events="markerEvents"' +
                              'gm-on-click="selected = {person: object, marker: marker}"' +
                              'gm-on-position-changed="posChanged = {marker: marker}"' +
                              'gm-on-mouseover="mouseovered = {person: object, marker: marker}">' + 
                            '</gm-markers>' + 
                          '</gm-map>');

    $compile(elm)(scope);

    mapCtrl = elm.controller('gmMap');
    spyOn(mapCtrl, 'addMarker').andCallThrough();
    spyOn(mapCtrl, 'removeMarker').andCallThrough();
    spyOn(mapCtrl, 'removeMarkerByHash').andCallThrough();
    spyOn(mapCtrl, 'trigger').andCallThrough();
    spyOn(mapCtrl, 'addListener').andCallThrough();

    markersScopeId = elm.find('gm-markers').scope().$id;

    scope.$digest();
    $timeout.flush();
  }));


  it('requires the gmObjects attribute', inject(function($compile) {
    elm = angular.element('<gm-map gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds">' +
                            '<gm-markers ' +
                              'gm-get-lat-lng="{lat:object.lat,lng:object.lng}"' + 
                              'gm-get-marker-options="getOpts(object)"' + 
                              'gm-on-click="selected = {person: object, marker: marker}"' +
                              'gm-on-mouseover="mouseovered = {person: object, marker: marker}">' + 
                            '</gm-markers>' + 
                          '</gm-map>');

    scope = scope.$new();
    scope.mapId = 'test2';
    expect(angular.bind(this, $compile(elm), scope)).toThrow();
  }));


  it('requires the gmGetLatLng attribute', inject(function($compile) {
    elm = angular.element('<gm-map gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds">' +
                            '<gm-markers ' +
                              'gm-objects="people"' + 
                              'gm-get-marker-options="getOpts(object)"' + 
                              'gm-on-click="selected = {person: object, marker: marker}"' +
                              'gm-on-mouseover="mouseovered = {person: object, marker: marker}">' + 
                            '</gm-markers>' + 
                          '</gm-map>');

    scope = scope.$new();
    scope.mapId = 'test3';
    expect(angular.bind(this, $compile(elm), scope)).toThrow();
  }));


  describe('objects', function() {


    it('initializes markers with objects', function() {
      var position1 = objToLatLng(scope.people[0]);
      var position2 = objToLatLng(scope.people[1]);
      expect(mapCtrl.addMarker).toHaveBeenCalledWith(markersScopeId, {key: 'value', title: jasmine.any(String), position: position1});
      expect(mapCtrl.addMarker).toHaveBeenCalledWith(markersScopeId, {key: 'value', title: jasmine.any(String), position: position2});
    });

    
    it('updates markers with new objects', function() {
      scope.people.push({name: '6', lat: 7, lng: 8});
      var position = objToLatLng(scope.people[2]);
      scope.$digest();
      expect(mapCtrl.addMarker).toHaveBeenCalledWith(markersScopeId, {key: 'value', title: jasmine.any(String), position: position});
    });


    it('updates markers when objects replaced with objects of same length', function() {
      var length = scope.people.length;
      scope.people = [];
      for (var i = 0; i < length; i++) {
        scope.people.push({name: 'new' + i, lat: i, lng: i});
      }
      scope.$digest();
      expect(mapCtrl.removeMarkerByHash.calls.length).toEqual(length);
      expect(mapCtrl.addMarker.calls.length).toEqual(length * 2);
    });


    it('updates markers with removed objects', function() {
      var person = scope.people.pop();
      scope.$digest();
      var position = new google.maps.LatLng(person.lat, person.lng);
      expect(mapCtrl.removeMarkerByHash).toHaveBeenCalledWith(markersScopeId, position.toUrlValue(mapCtrl.precision));
    });


    it('does not add duplicate markers', function() {
      var origLength = scope.people.length;
      scope.people.push({name: '0', lat: 1, lng: 2});
      scope.$digest();
      expect(mapCtrl.addMarker.callCount).toEqual(origLength);
    });


    it('does not add null objects', function() {
      var origLength = scope.people.length;
      scope.people.push(null);
      scope.$digest();
      expect(mapCtrl.addMarker.callCount).toEqual(origLength);
    });
    
  });


  it('retrieves marker options', function() {
    expect(mapCtrl.addMarker).toHaveBeenCalledWith(markersScopeId, {key: 'value', title: '0', position: jasmine.any(Object)});
    expect(mapCtrl.addMarker).toHaveBeenCalledWith(markersScopeId, {key: 'value', title: '3', position: jasmine.any(Object)});
  });


  it('triggers events', function() {
    var person = scope.people[0];
    var position = new google.maps.LatLng(person.lat, person.lng);
    scope.markerEvents = [{
      event: 'click',
      locations: [position],
    }]

    scope.$digest();
    $timeout.flush();
    var marker = mapCtrl.trigger.mostRecentCall.args[0];
    var event = mapCtrl.trigger.mostRecentCall.args[1];
    expect(marker.getPosition()).toEqual(position);
    expect(event).toEqual('click');
  });


  it('triggers events on multiple markers', function() {
    var position0 = new google.maps.LatLng(scope.people[0].lat, scope.people[0].lng);
    var position1 = new google.maps.LatLng(scope.people[1].lat, scope.people[1].lng);
    scope.markerEvents = [{
      event: 'click',
      locations: [position0, position1]
    }]
    scope.$digest();
    $timeout.flush();
    var marker0 = mapCtrl.trigger.calls[0].args[0];
    var marker1 = mapCtrl.trigger.calls[1].args[0];
    expect(marker0.getPosition()).toEqual(position0);
    expect(marker1.getPosition()).toEqual(position1);
  });


  it('triggers multiple events on markers', function() {
    var position = new google.maps.LatLng(scope.people[0].lat, scope.people[0].lng);
    scope.markerEvents = [
      {
        event: 'event0',
        locations: [position]
      },
      {
        event: 'event1',
        locations: [position]
      }
    ]
    scope.$digest();
    $timeout.flush();
    var event0 = mapCtrl.trigger.calls[0].args[1];
    var event1 = mapCtrl.trigger.calls[1].args[1];
    expect(event0).toEqual('event0');
    expect(event1).toEqual('event1');
  });


  it('sets up event handlers for on-* attributes', function() {
    expect(mapCtrl.addListener).toHaveBeenCalledWith(jasmine.any(Object), 'click', jasmine.any(Function));
    expect(mapCtrl.addListener).toHaveBeenCalledWith(jasmine.any(Object), 'mouseover', jasmine.any(Function));
    expect(mapCtrl.addListener).toHaveBeenCalledWith(jasmine.any(Object), 'position_changed', jasmine.any(Function));
  });


  it('calls event handlers when event fired', function() {
    var person = scope.people[0];
    var marker = mapCtrl.getMarker(markersScopeId, person.lat, person.lng);
    var handled = false;
    runs(function() {
      google.maps.event.addListener(marker, 'mouseover', function() {handled = true;});
      google.maps.event.trigger(marker, 'mouseover');
    });
    waitsFor(function() {
      return handled;
    }, 'no mouseover', 500);
    runs(function() {
      scope.$digest();
      $timeout.flush();
      expect(scope.mouseovered.person).toEqual(person);
    });
  });


  it('listens for marker redraw event', function() {
    var position1 = objToLatLng(scope.people[0]);
    var position2 = objToLatLng(scope.people[1]);
    scope.getOpts = function(person) {
      return {
        key: 'differentValue',
        title: person.name
      };
    };
    scope.$broadcast('gmMarkersRedraw', 'people');

    expect(mapCtrl.addMarker).toHaveBeenCalledWith(markersScopeId, {key: 'differentValue', title: jasmine.any(String), position: position1});
    expect(mapCtrl.addMarker).toHaveBeenCalledWith(markersScopeId, {key: 'differentValue', title: jasmine.any(String), position: position2});
  });


  it('listens to marker redraw event when no objects specified', function() {
    var position1 = objToLatLng(scope.people[0]);
    var position2 = objToLatLng(scope.people[1]);
    scope.getOpts = function(person) {
      return {
        key: 'differentValue',
        title: person.name
      };
    };
    scope.$broadcast('gmMarkersRedraw');

    expect(mapCtrl.addMarker).toHaveBeenCalledWith(markersScopeId, {key: 'differentValue', title: jasmine.any(String), position: position1});
    expect(mapCtrl.addMarker).toHaveBeenCalledWith(markersScopeId, {key: 'differentValue', title: jasmine.any(String), position: position2});
  });


  it('ignores marker redraw event for other instance', function() {
    scope.getOpts = function(person) {
      return {
        key: 'differentValue',
        title: person.name
      };
    };
    scope.$broadcast('gmMarkersRedraw', 'otherObjects');

    expect(mapCtrl.addMarker).not.toHaveBeenCalledWith(markersScopeId, {key: 'differentValue', title: jasmine.any(String), position: jasmine.any(Object)});
    expect(mapCtrl.addMarker).not.toHaveBeenCalledWith(markersScopeId, {key: 'differentValue', title: jasmine.any(String), position: jasmine.any(Object)});
  });

  it('emits marker update event when markers updated', function() {
    var count = 0;
    scope.$on('gmMarkersUpdated', function(event, objects) {
      if (objects == 'people') { count++; }
    });

    scope.people.pop();
    scope.$digest();

    expect(count).toEqual(1);
  });

});
