describe('gmMarkers', function() {
  var elm, scope, markersScopeId, mapCtrl, objectsName;
  var latLngToObj;
  var $timeout;

  beforeEach(function() {
    module('AngularGM');
  });

  beforeEach(inject(function($rootScope, $compile, _$timeout_, angulargmUtils) {
    // set up scopes
    scope = $rootScope.$new();
    scope.people = [
      {name: '0', id: 0, location: {lat: 1, lng: 2}},
      {name: '3', id: 3, location: {lat: 4, lng: 5}}
    ];
    scope.getOpts = function(person) {
      return {
        key: 'value',
        title: person.name
      };
    };
    scope.mapId = 'test';

    $timeout = _$timeout_;
    latLngToObj = angulargmUtils.latLngToObj;

    // compile angulargmMarkers directive
    elm = angular.element('<gm-map gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds">' +
      '<gm-markers ' +
      'gm-objects="people"' +
      'gm-id="object.id"' +
      'gm-position="object.location"' +
      'gm-marker-options="getOpts(object)"' +
      'gm-events="markerEvents"' +
      'gm-on-click="selected = {person: object, marker: marker}"' +
      'gm-on-position-changed="posChanged = {marker: marker}"' +
      'gm-on-mouseover="mouseovered = {person: object, marker: marker}">' +
      '</gm-markers>' +
      '</gm-map>');

    objectsName = 'people';

    $compile(elm)(scope);

    mapCtrl = elm.controller('gmMap');
    spyOn(mapCtrl, 'addElement').and.callThrough();
    spyOn(mapCtrl, 'updateElement').and.callThrough();
    spyOn(mapCtrl, 'removeElement').and.callThrough();
    spyOn(mapCtrl, 'trigger').and.callThrough();
    spyOn(mapCtrl, 'addListener').and.callThrough();

    markersScopeId = elm.find('gm-markers').isolateScope().$id;

    scope.$digest();
    $timeout.flush();
  }));

  it('requires the gmObjects attribute', inject(function($compile) {
    elm = angular.element('<gm-map gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds">' +
      '<gm-markers ' +
      'gm-id="{id:object.id}"' +
      'gm-position="object.location"' +
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
      'gm-position="object.location"' +
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
      var position1 = scope.people[0].location;
      var position2 = scope.people[1].location;
      expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
        jasmine.any(String), {key: 'value', title: jasmine.any(String), position: position1}, objectsName);
      expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
        jasmine.any(String), {key: 'value', title: jasmine.any(String), position: position2}, objectsName);
    });


    it('updates markers with new objects', function() {
      scope.people.push({name: '6', id: 6, location: {lat: 7, lng: 8}});
      var position = scope.people[2].location;
      scope.$digest();
      expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
        jasmine.any(String), {key: 'value', title: jasmine.any(String), position: position}, objectsName);
    });


    it('updates markers when objects replaced with objects of same length', function() {

      var length = scope.people.length;
      scope.people = [];
      for (var i = 0; i < length; i++) {
        scope.people.push({name: 'new' + i, id: (i+10), location: {lat: i, lng: i}});
      }
      scope.$digest();
      expect(mapCtrl.removeElement.calls.count()).toEqual(length);
      expect(mapCtrl.addElement.calls.count()).toEqual(length * 2);
    });


    it('updates markers with removed objects', function() {
      var person = scope.people.pop();
      scope.$digest();
      var position = person.location;
      expect(mapCtrl.removeElement).toHaveBeenCalledWith('marker', markersScopeId, '3');
    });


    it('does not add markers with duplicate ids', function() {
      var origLength = scope.people.length;
      scope.people.push({name: '0', id: 0, location: {lat: 2, lng: 3}});
      scope.$digest();
      expect(mapCtrl.addElement.calls.count()).toEqual(origLength);
    });


    it('updates markers with changed objects when update triggered', function() {
      var person = scope.people[0];
      var origLength = scope.people.length;
      person.location.lat = person.location.lat + 5;
      person.location.lng = person.location.lng + 5;
      var newPosition = person.location;
      scope.$broadcast('gmMarkersUpdate');
      expect(mapCtrl.updateElement).toHaveBeenCalledWith('marker', markersScopeId,
        jasmine.any(String), {key: 'value', title: jasmine.any(String), position: newPosition});
      expect(mapCtrl.updateElement.calls.count()).toEqual(origLength);
    });


    it('updates markers with changed objects when update triggered when providing objectsName', function() {
      var origLength = scope.people.length;
      var person = scope.people[0];
      person.location.lat = person.location.lat + 5;
      person.location.lng = person.location.lng + 5;
      var newPosition = person.location;
      scope.$broadcast('gmMarkersUpdate', objectsName);
      expect(mapCtrl.updateElement).toHaveBeenCalledWith('marker', markersScopeId,
        jasmine.any(String), {key: 'value', title: jasmine.any(String), position: newPosition});
      expect(mapCtrl.updateElement.calls.count()).toEqual(origLength);
    });


    it('updates markers with changed objects when update triggered when providing objectsName and objectId', function() {
      var person = scope.people[0];
      person.location.lat = person.location.lat + 5;
      person.location.lng = person.location.lng + 5;
      var newPosition = person.location;
      scope.$broadcast('gmMarkersUpdate', objectsName, person.id);
      expect(mapCtrl.updateElement).toHaveBeenCalledWith('marker', markersScopeId,
        person.id, {key: 'value', title: jasmine.any(String), position: newPosition});
      expect(mapCtrl.updateElement.calls.count()).toEqual(1);
    });


    it('does not add null objects', function() {
      var origLength = scope.people.length;
      scope.people.push(null);
      scope.$digest();
      expect(mapCtrl.addElement.calls.count()).toEqual(origLength);
    });

  });


  it('retrieves marker options', function() {
    expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'value', title: '0', position: jasmine.any(Object)}, objectsName);
    expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'value', title: '3', position: jasmine.any(Object)}, objectsName);
  });


  describe('gmMarkerConstructor', function() {
    var elm, scope, markersScopeId, mapCtrl, objectsName;
    var latLngToObj;
    var $timeout;

    var CustomMarker = function(options) {
      if (options) {
        if (options.position) {
          this.latlng = new google.maps.LatLng(options.position.lat, options.position.lng);
        }
        this.div = document.createElement('div');
        if (options.map) {
          this.setMap(options.map);
        }
      }
    };
    CustomMarker.prototype = new google.maps.OverlayView();
    CustomMarker.prototype.setMap = function (map) {
      this._map = map;
    };
    CustomMarker.prototype.getPosition = function () {
      return this.latlng;
    };

    beforeEach(inject(function($rootScope, $compile, _$timeout_, angulargmUtils) {
      // set up scopes
      scope = $rootScope.$new();
      scope.people2 = [
        {name: '0', id: 0, location: {lat: 1, lng: 2}},
        {name: '3', id: 3, location: {lat: 4, lng: 5}}
      ];
      scope.getOpts2 = function(person) {
        return {
          key: 'value',
          title: person.name
        };
      };
      scope.mapId = 'test5';

      $timeout = _$timeout_;
      latLngToObj = angulargmUtils.latLngToObj;

      scope.myCustomMarker = CustomMarker;

      // compile angulargmMarkers directive
      elm = angular.element('<gm-map gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds">' +
        '<gm-markers ' +
        'gm-objects="people2"' +
        'gm-id="object.id"' +
        'gm-position="object.location"' +
        'gm-marker-options="getOpts2(object)"' +
        'gm-events="markerEvents"' +
        'gm-marker-constructor="myCustomMarker">' +
        '</gm-markers>' +
        '</gm-map>');

      objectsName = 'people2';

      $compile(elm)(scope);

      mapCtrl = elm.controller('gmMap');
      spyOn(scope.myCustomMarker.prototype, 'setMap').and.callThrough();
      spyOn(scope.myCustomMarker.prototype, 'getPosition').and.callThrough();
      spyOn(mapCtrl, 'addElement').and.callThrough();
      spyOn(mapCtrl, 'trigger').and.callThrough();
      spyOn(mapCtrl, 'addDomListener').and.callThrough();

      markersScopeId = elm.find('gm-markers').isolateScope().$id;

      scope.$digest();
      $timeout.flush();
    }));

    it('is used when a custom marker constructor is provided', inject(function($compile) {
      expect(mapCtrl.addElement.calls.count()).toEqual(scope.people2.length);
      expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
        jasmine.any(String), {key: 'value', title: jasmine.any(String), position: jasmine.any(Object)}, objectsName, scope.myCustomMarker);
      expect(scope.myCustomMarker.prototype.setMap.calls.count()).toEqual(scope.people2.length);
    }));

    it('triggers events', function() {
        var person = scope.people2[0];
        var position = person.location;
        var id = person.name;
        scope.markerEvents = [{
          event: 'click',
          ids: [id],
        }];

        scope.$digest();
        $timeout.flush();
        var marker = mapCtrl.trigger.calls.mostRecent()['args'][0];
        var event = mapCtrl.trigger.calls.mostRecent()['args'][1];
        expect(latLngToObj(marker.getPosition())).toEqual(position);
        expect(event).toEqual('click');
      });


      it('triggers events on multiple markers', function() {

        var position0 = scope.people2[0].location;
        var position1 = scope.people2[1].location;
        var id0 = scope.people2[0].name;
        var id1 = scope.people2[1].name;
        scope.markerEvents = [{
          event: 'click',
          ids: [id0, id1]
        }];
        scope.$digest();
        $timeout.flush();
        var marker0 = mapCtrl.trigger.calls.argsFor(0)[0];
        var marker1 = mapCtrl.trigger.calls.argsFor(1)[0];
        expect(latLngToObj(marker0.getPosition())).toEqual(position0);
        expect(latLngToObj(marker1.getPosition())).toEqual(position1);
      });


      it('triggers multiple events on markers', function() {
        var position = scope.people2[0].location;
        var id = scope.people2[0].name;
        scope.markerEvents = [
          {
            event: 'event0',
            ids: [id]
          },
          {
            event: 'event1',
            ids: [id]
          }
        ];
        scope.$digest();
        $timeout.flush();
        var event0 = mapCtrl.trigger.calls.argsFor(0)[1];
        var event1 = mapCtrl.trigger.calls.argsFor(1)[1];
        expect(event0).toEqual('event0');
        expect(event1).toEqual('event1');
      });


  });


  it('triggers events', function() {
    var person = scope.people[0];
    var position = person.location;
    var id = person.name
    scope.markerEvents = [{
      event: 'click',
      ids: [id],
    }]

    scope.$digest();
    $timeout.flush();
    var marker = mapCtrl.trigger.calls.mostRecent()['args'][0];
    var event = mapCtrl.trigger.calls.mostRecent()['args'][1];
    expect(latLngToObj(marker.getPosition())).toEqual(position);
    expect(event).toEqual('click');
  });


  it('triggers events on multiple markers', function() {

    var position0 = scope.people[0].location;
    var position1 = scope.people[1].location;
    var id0 = scope.people[0].name
    var id1 = scope.people[1].name
    scope.markerEvents = [{
      event: 'click',
      ids: [id0, id1]
    }]
    scope.$digest();
    $timeout.flush();
    var marker0 = mapCtrl.trigger.calls.argsFor(0)[0];
    var marker1 = mapCtrl.trigger.calls.argsFor(1)[0];
    expect(latLngToObj(marker0.getPosition())).toEqual(position0);
    expect(latLngToObj(marker1.getPosition())).toEqual(position1);
  });


  it('triggers multiple events on markers', function() {
    var position = scope.people[0].location;
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
    var event0 = mapCtrl.trigger.calls.argsFor(0)[1];
    var event1 = mapCtrl.trigger.calls.argsFor(1)[1];
    expect(event0).toEqual('event0');
    expect(event1).toEqual('event1');
  });


  it('sets up event handlers for on-* attributes', function() {
    expect(mapCtrl.addListener).toHaveBeenCalledWith(jasmine.any(Object), 'click', jasmine.any(Function));
    expect(mapCtrl.addListener).toHaveBeenCalledWith(jasmine.any(Object), 'mouseover', jasmine.any(Function));
    expect(mapCtrl.addListener).toHaveBeenCalledWith(jasmine.any(Object), 'position_changed', jasmine.any(Function));
  });


  describe('calls event handlers when event fired', function() {
    beforeEach(function(done) {
      var person = scope.people[0];
      var marker = mapCtrl.getElement('marker', markersScopeId, person.name);
      google.maps.event.addListener(marker, 'mouseover', done);
      google.maps.event.trigger(marker, 'mouseover');
    });

    it('', function() {
      scope.$digest();
      $timeout.flush();

      var person = scope.people[0];
      expect(scope.mouseovered.person).toEqual(person);
    });
  });


  it('listens for marker redraw event', function() {
    var position1 = scope.people[0].location;
    var position2 = scope.people[1].location;
    scope.getOpts = function(person) {
      return {
        key: 'differentValue',
        title: person.name
      };
    };
    scope.$broadcast('gmMarkersRedraw', objectsName);

    expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'differentValue', title: jasmine.any(String), position: position1}, objectsName);
    expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'differentValue', title: jasmine.any(String), position: position2}, objectsName);
  });


  it('listens to marker redraw event when no objects specified', function() {
    var position1 = scope.people[0].location;
    var position2 = scope.people[1].location;
    scope.getOpts = function(person) {
      return {
        key: 'differentValue',
        title: person.name
      };
    };
    scope.$broadcast('gmMarkersRedraw');

    expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'differentValue', title: jasmine.any(String), position: position1}, objectsName);
    expect(mapCtrl.addElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'differentValue', title: jasmine.any(String), position: position2}, objectsName);
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
      {key: 'differentValue', title: jasmine.any(String), id: jasmine.any(String), position: jasmine.any(Object)}, objectsName);
    expect(mapCtrl.addElement).not.toHaveBeenCalledWith('marker', markersScopeId,
      {key: 'differentValue', title: jasmine.any(String), id: jasmine.any(String), position: jasmine.any(Object)}, objectsName);
  });


  it('listens for marker update event', function() {
    var position1 = scope.people[0].location;
    var position2 = scope.people[1].location;
    scope.getOpts = function(person) {
      return {
        key: 'differentValue',
        title: person.name
      };
    };
    scope.$broadcast('gmMarkersUpdate', objectsName);

    expect(mapCtrl.updateElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'differentValue', title: jasmine.any(String), position: position1});
    expect(mapCtrl.updateElement).toHaveBeenCalledWith('marker', markersScopeId,
      jasmine.any(String), {key: 'differentValue', title: jasmine.any(String), position: position2});
  });


  it('emits marker update event when markers updated', function() {
    var count = 0;
    scope.$on('gmMarkersUpdated', function(event, objects) {
      if (objects == objectsName) { count++; }
    });

    scope.people.pop();
    scope.$digest();

    expect(count).toEqual(1);
  });

  it('emits marker added event when markers added', function() {
    var count = 0;
    var newlyAdded;
    scope.$on('gmMarkersAdded', function(event, objects, added) {
      if (objects == objectsName) {
        count++;
        newlyAdded = added;
      }
    });

    scope.people.push({name: '4', id: 4, location: {lat: 2, lng: 3}});
    scope.$digest();

    expect(count).toEqual(1);
    expect(newlyAdded.length).toEqual(1);
    expect(newlyAdded[0].id).toEqual('4');
  });

  it('emits marker removed event when markers removed', function() {
    var count = 0;
    var newlyRemoved;
    scope.$on('gmMarkersRemoved', function(event, objects, removed) {
      if (objects == objectsName) {
        count++;
        newlyRemoved = removed;
      }
    });

    var popped = scope.people.pop();
    scope.$digest();

    expect(count).toEqual(1);
    expect(newlyRemoved.length).toEqual(1);
    expect(newlyRemoved[0].id).toEqual(popped.id.toString());
  });

});
