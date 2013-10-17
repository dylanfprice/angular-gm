describe('angulargmContainer', function() {
  var cntr;
  var mapSpy
  beforeEach(function() {
    module('AngularGM');
  });

  beforeEach(inject(function(angulargmContainer) {
    cntr = angulargmContainer;
    mapSpy = spyOn(google.maps, 'Map').andCallFake(function() {
    });
  }));

  afterEach(function() {
    cntr.clear();
  });

  describe('addMap', function() {

    it('stores the map if given a new mapId', function() {
      var add1 = angular.bind(this, cntr.addMap, 'test', new google.maps.Map());
      var add2 = angular.bind(this, cntr.addMap, 'test2', new google.maps.Map());
      expect(add1).not.toThrow();
      expect(add2).not.toThrow();
    });

    it('throws an error on same mapId', function() {
      var add1 = angular.bind(this, cntr.addMap, 'test', new google.maps.Map());
      var add2 = angular.bind(this, cntr.addMap, 'test', new google.maps.Map());
      expect(add1).not.toThrow();
      expect(add2).toThrow();
    });

    it('throws an error if object not a google.map.Map map', function() {
      var add = angular.bind(this, cntr.addMap, 'test', new Object());
      expect(add).toThrow();
    });

  });

  describe('getMap', function() {

    it('returns the map for maps stored in the container', function() {
      var map1 = new google.maps.Map();
      var map2 = new google.maps.Map();
      cntr.addMap('test', map1);
      cntr.addMap('test2', map2);
      expect(cntr.getMap('test')).toBe(map1);
      expect(cntr.getMap('test2')).toBe(map2);
    });

    it('returns undefined for maps not in the container', function() {
      cntr.addMap('test', new google.maps.Map());
      expect(cntr.getMap('test2')).toBeUndefined();
    });

  });

  describe('getMapPromise', function() {

    it('resolves the promised map when it is added', inject(function($rootScope) {
      var promise = cntr.getMapPromise('test');
      var expectedMap = new google.maps.Map();
      var resolvedMap;

      promise.then(function(map) { resolvedMap = map; });
      expect(resolvedMap).toBeUndefined();

      cntr.addMap('test', expectedMap);
      $rootScope.$apply();
      expect(resolvedMap).toBe(expectedMap);
    }));

  });



});

describe('Markers', function() {
  var cntr;
  var markers
  var marker1
  var marker2

  beforeEach(function() {
    module('AngularGM');
  });

  beforeEach(inject(function(angulargmContainer) {
    cntr = angulargmContainer;

    var mapOptions = {
      zoom: 4,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    elm = angular.element('<div></div>');
    var map1 = new google.maps.Map(elm[0], mapOptions);


    markers = {}
    marker1 = new google.maps.Marker({
      position: new google.maps.LatLng(1,2),
      map: map1,
      id: 2
    });
    marker2 = new google.maps.Marker({
      position: new google.maps.LatLng(2,3),
      map: map1,
      id: 5
    });

    markers[marker1.id] = (marker1)
    markers[marker2.id] = (marker2)
    cntr.addMap('test', map1);
    cntr.setMarkers('test', markers);
  }));

  describe('setMarkers', function() {
    it('stores the marker hash', function() {
      var add = angular.bind(this, cntr.setMarkers, 'test', markers);
      expect(add).not.toThrow();
    });
  });

  describe('getMarkers', function() {

    it('returns markers', function() {
      expect(cntr.getMarkers('test')).toBe(markers);
    });

    it('returns undefined when map markers not set', function() {
      expect(cntr.getMarkers('test2')).toBeUndefined();
    });
  });

  describe('getMarker', function() {
    it('return correct marker for given id value (hash)', function() {
      expect(cntr.getMarker('test', 2)).toBe(marker1);
      expect(cntr.getMarker('test', 5)).toBe(marker2);
    });

    it('returns undefined for mapId not set', function() {
      expect(cntr.getMarker('test2', 2)).toBeUndefined();
    });

    it('returns undefined for id value not in markers', function() {
      expect(cntr.getMarker('test', 3)).toBeUndefined();
    });
  });
});