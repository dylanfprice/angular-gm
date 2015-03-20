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
      {name: '0', lat: 1, lng: 2, id: 0},
      {name: '3', lat: 4, lng: 5, id: 3}
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
      'gm-id="object.id"' +
      'gm-position="{lat:object.lat,lng:object.lng}"' +
      'gm-marker-options="getOpts(object)"' +
      'gm-events="markerEvents"' +
      'gm-on-click="selected = {person: object, marker: marker}"' +
      'gm-on-position-changed="posChanged = {marker: marker}"' +
      'gm-on-mouseover="mouseovered = {person: object, marker: marker}">' +
      '</gm-markers>' +
      '</gm-map>');

    $compile(elm)(scope);

    mapCtrl = elm.controller('gmMap');
    spyOn(mapCtrl, 'addElement').andCallThrough();
    spyOn(mapCtrl, 'updateElement').andCallThrough();
    spyOn(mapCtrl, 'removeElement').andCallThrough();
    spyOn(mapCtrl, 'trigger').andCallThrough();
    spyOn(mapCtrl, 'addListener').andCallThrough();

    markersScopeId = elm.find('gm-markers').isolateScope().$id;

    scope.$digest();
    $timeout.flush();
  }));

  it('requires the gmObjects attribute', inject(function($compile) {
    elm = angular.element('<gm-map gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds">' +
      '<gm-markers ' +
      'gm-id="{id:object.id}"' +
      'gm-position="{lat:object.lat,lng:object.lng}"' +
      'gm-marker-options="getOpts(object)"' +
      'gm-on-click="selected = {person: object, marker: marker}"' +
      'gm-on-mouseover="mouseovered = {person: object, marker: marker}">' +
      '</gm-markers>' +
      '</gm-map>');

    scope = scope.$new();
    scope.mapId = 'test2';
    expect(angular.bind(this, $compile(elm), scope)).toThrow();
  }));


  it('requires the gmId attribute', inject(function($compile) {
    elm = angular.element('<gm-map gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds">' +
      '<gm-markers ' +
      'gm-objects="people"' +
      'gm-position="{lat:object.lat,lng:object.lng}"' +
      'gm-marker-options="getOpts(object)"' +
      'gm-on-click="selected = {person: object, marker: marker}"' +
      'gm-on-mouseover="mouseovered = {person: object, marker: marker}">' +
      '</gm-markers>' +
      '</gm-map>');

    scope = scope.$new();
    scope.mapId = 'test3';
    expect(angular.bind(this, $compile(elm), scope)).toThrow();
  }));


  it('requires the gmPosition attribute', inject(function($compile) {
    elm = angular.element('<gm-map gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds">' +
      '<gm-markers ' +
      'gm-objects="people"' +
      'gm-id="{id:object.id}"' +
      'gm-marker-options="getOpts(object)"' +
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
      expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
        jasmine.any(String), {key: 'value', title: jasmine.any(String), position: position1});
      expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
        jasmine.any(String), {key: 'value', title: jasmine.any(String), position: position2});
    });


    it('updates markers with new objects', function() {
      scope.people.push({name: '6', lat: 7, lng: 8, id: 6});
      var position = objToLatLng(scope.people[2]);
      scope.$digest();
      expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
        jasmine.any(String), {key: 'value', title: jasmine.any(String), position: position});
    });


    it('updates markers when objects replaced with objects of same length', function() {

      var length = scope.people.length;
      scope.people = [];
      for (var i = 0; i < length; i++) {
        scope.people.push({name: 'new' + i, lat: i, lng: i, id: (i+10)});
      }
      scope.$digest();
      expect(mapCtrl.removeElement.calls.length).toEqual(length);
      expect(mapCtrl.addElement.calls.length).toEqual(length * 2);
    });


    it('updates markers with removed objects', function() {
      var person = scope.people.pop();
      scope.$digest();
      var position = objToLatLng(person);
      expect(mapCtrl.removeElement).toHaveBeenCalledWith('marker', markersScopeId, '3');
    });


    it('does not add markers with duplicate ids', function() {
      var origLength = scope.people.length;
      scope.people.push({name: '0', lat: 2, lng: 3, id: 0});
      scope.$digest();
      expect(mapCtrl.addElement.callCount).toEqual(origLength);
    });


    it('updates markers with changed objects when update triggered', function() {
      var person = scope.people[0]
      person.lat = person.lat + 5;
      person.lng = person.lng + 5;
      var newPosition = objToLatLng(person);
      scope.$broadcast('gmMarkersUpdate', 'people');
      expect(mapCtrl.updateElement).toHaveBeenCalledWith('marker', markersScopeId,
        jasmine.any(String), {key: 'value', title: jasmine.any(String), position: newPosition});
    });


    it('does not add null objects', function() {
      var origLength = scope.people.length;
      scope.people.push(null);
      scope.$digest();
      expect(mapCtrl.addElement.callCount).toEqual(origLength);
    });

  });


  it('retrieves marker options', function() {
    expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'value', title: '0', position: jasmine.any(Object)});
    expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'value', title: '3', position: jasmine.any(Object)});
  });


  it('triggers events', function() {
    var person = scope.people[0];
    var position = objToLatLng(person);
    var id = person.name
    scope.markerEvents = [{
      event: 'click',
      ids: [id],
    }]

    scope.$digest();
    $timeout.flush();
    var marker = mapCtrl.trigger.mostRecentCall.args[0];
    var event = mapCtrl.trigger.mostRecentCall.args[1];
    expect(marker.getPosition()).toEqual(position);
    expect(event).toEqual('click');
  });


  it('triggers events on multiple markers', function() {

    var position0 = objToLatLng(scope.people[0]);
    var position1 = objToLatLng(scope.people[1]);
    var id0 = scope.people[0].name
    var id1 = scope.people[1].name
    scope.markerEvents = [{
      event: 'click',
      ids: [id0, id1]
    }]
    scope.$digest();
    $timeout.flush();
    var marker0 = mapCtrl.trigger.calls[0].args[0];
    var marker1 = mapCtrl.trigger.calls[1].args[0];
    expect(marker0.getPosition()).toEqual(position0);
    expect(marker1.getPosition()).toEqual(position1);
  });


  it('triggers multiple events on markers', function() {
    var position = objToLatLng(scope.people[0]);
    var id = scope.people[0].name
    scope.markerEvents = [
      {
        event: 'event0',
        ids: [id]
      },
      {
        event: 'event1',
        ids: [id]
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
    var marker = mapCtrl.getElement('marker', markersScopeId, person.name);
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

    expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'differentValue', title: jasmine.any(String), position: position1});
    expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'differentValue', title: jasmine.any(String), position: position2});
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

    expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'differentValue', title: jasmine.any(String), position: position1});
    expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'differentValue', title: jasmine.any(String), position: position2});
  });


  it('ignores marker redraw event for other instance', function() {
    scope.getOpts = function(person) {
      return {
        key: 'differentValue',
        title: person.name
      };
    };
    scope.$broadcast('gmMarkersRedraw', 'otherObjects');

    expect(mapCtrl.addElement).not.toHaveBeenCalledWith('marker', markersScopeId,
      {key: 'differentValue', title: jasmine.any(String), id: jasmine.any(String), position: jasmine.any(Object)});
    expect(mapCtrl.addElement).not.toHaveBeenCalledWith('marker', markersScopeId,
      {key: 'differentValue', title: jasmine.any(String), id: jasmine.any(String), position: jasmine.any(Object)});
  });


  it('listens for marker update event', function() {
    var position1 = objToLatLng(scope.people[0]);
    var position2 = objToLatLng(scope.people[1]);
    scope.getOpts = function(person) {
      return {
        key: 'differentValue',
        title: person.name
      };
    };
    scope.$broadcast('gmMarkersUpdate', 'people');

    expect(mapCtrl.updateElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'differentValue', title: jasmine.any(String), position: position1});
    expect(mapCtrl.updateElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'differentValue', title: jasmine.any(String), position: position2});
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
