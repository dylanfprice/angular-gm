describe('angulargmContainer', function() {
  var cntr;

  beforeEach(function() {
    module('AngularGM');
  });

  beforeEach(inject(function(angulargmContainer) {
    cntr = angulargmContainer;
    spyOn(google.maps, 'Map').andCallFake(function() {
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
