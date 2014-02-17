describe('angulargmUtils', function() {
  var latLngEqual,
      boundsEqual,
      latLngToObj,
      objToLatLng,
      hasNaN,
      getEventHandlers;

  var latLngG,
      latLngObj;

  beforeEach(function() {
    module('AngularGM');
  });

  beforeEach(inject(function(angulargmUtils) {
    latLngEqual = angulargmUtils.latLngEqual;
    boundsEqual = angulargmUtils.boundsEqual;
    latLngToObj = angulargmUtils.latLngToObj;
    objToLatLng = angulargmUtils.objToLatLng;
    hasNaN = angulargmUtils.hasNaN;
    getEventHandlers = angulargmUtils.getEventHandlers;

    latLngG = new google.maps.LatLng(1, 2);
    latLngObj = {lat: 1, lng: 2};
  }));

  function bounds(swLat, swLng, neLat, neLng) {
    return new google.maps.LatLngBounds(
        new google.maps.LatLng(swLat, swLng),
        new google.maps.LatLng(neLat, neLng));
  }

  describe('latLngEqual', function() {

    it('returns true if args are equal', function() {
      var eq = latLngEqual(new google.maps.LatLng(1, 2),
        new google.maps.LatLng(1, 2));
      expect(eq).toBeTruthy();
    });

    it('returns false if args are not equal', function() {
      var eq = latLngEqual(new google.maps.LatLng(1, 2),
        new google.maps.LatLng(3, 4));
      expect(eq).toBeFalsy();
    });

    it('returns false if arg is null', function() {
      var eq = latLngEqual(new google.maps.LatLng(1, 2),
        null);
      expect(eq).toBeFalsy();
    });

    it('returns false if arg contains NaN', function() {
      var eq = latLngEqual(new google.maps.LatLng(1, NaN),
        new google.maps.LatLng(1, NaN));
      expect(eq).toBeFalsy();
    });

  });

  describe('boundsEqual', function() {

    it('returns true if args are equal', function() {
      var eq = boundsEqual(bounds(1, 2, 3, 4), bounds(1, 2, 3, 4));
      expect(eq).toBeTruthy();
    });

    it('returns false if args are not equal', function() {
      var eq = boundsEqual(bounds(1, 2, 3, 4), bounds(1, 2, 3, 5));
      expect(eq).toBeFalsy();
    });

    it('returns false if arg is null', function() {
      var eq = boundsEqual(null, null);
      expect(eq).toBeFalsy();
    });

    it('returns false if arg contains NaN', function() {
      var eq = boundsEqual(bounds(1,2,3,NaN), bounds(1,2,3,NaN));
      expect(eq).toBeFalsy();
    });

  });

  describe('latLngToObject', function() {

    it('converts a latLng to object', function() {
      var obj = latLngToObj(latLngG);
      expect(obj).toEqual(latLngObj);
    });

    it('throws on null', function() {
      var fn = angular.bind(this, latLngToObj, null);
      expect(fn).toThrow();
    });

  });

  describe('objToLatLng', function() {

    it('converts an object to a latLng', function() {
      var latLng = objToLatLng(latLngObj);
      expect(latLng).toEqual(latLngG);
    });

    it('returns null on NaN', function() {
      var latLng = objToLatLng({lat: NaN, lng: 5});
      expect(latLng).toBeNull();
    });

  });

  describe('hasNaN', function() {

    it('returns true on NaN', function() {
      expect(hasNaN(new google.maps.LatLng(1, NaN))).toBeTruthy();
    });

    it('returns false on normal lat and lng', function() {
      expect(hasNaN(new google.maps.LatLng(1, 2))).toBeFalsy();
    });

  });

  describe('getEventHandlers', function() {
    it('converts attributes that begin with gmOn', function() {
      var attrs = {
        'gmOnClick': function() {},
        'gmMapId': '',
        'gmOnZoomChanged': function() {}
      }; // represents an Attribute object in the link function

      var handlers = getEventHandlers(attrs);
      expect(handlers).toEqual({
        'click': jasmine.any(Function),
        // Converts camelcased names to underscore spearated
        'zoom_changed': jasmine.any(Function)
      });
    });
  });

});
