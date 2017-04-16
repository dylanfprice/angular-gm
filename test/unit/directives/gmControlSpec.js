describe('gmControl', function() {
  var elm, scope, markersScopeId, mapCtrl, inner;
  var objToLatLng;
  var $timeout;

  beforeEach(function() {
    module('AngularGM');
  });

  beforeEach(inject(function($rootScope, $compile, _$timeout_, angulargmUtils) {
    // set up scopes
    scope = $rootScope.$new();
    scope.mapId = 'test';

    $timeout = _$timeout_;

    inner = angular.element('<input ng-model="myVal">');

    // compile angulargmMarkers directive
    elm = angular.element('<gm-map gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds">' +
      '<div gm-control ' +
      'gm-position="TOP_RIGHT" ' +
      'gm-index="5">' +
      '</div>' +
      '</gm-map>');

    elm.children().append(inner);
    $compile(elm)(scope);

    mapCtrl = elm.controller('gmMap');
    spyOn(mapCtrl, 'addControl').andCallFake(function(){
      console.log("FAKER!!!!");
    });

    scope.$digest();
    $timeout.flush();
  }));

  it('requires the gmPosition attribute', inject(function($compile) {
    elm = angular.element('<gm-map gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds">' +
      '<div gm-control ' +
      'gm-index="1"' +
      '></div>' +
      '</gm-map>');
    scope = scope.$new();
    scope.mapId = 'test2';
    expect(angular.bind(this, $compile(elm), scope)).toThrow();
  }));

  it('requires index to evaluate to a number', inject(function($compile) {
    elm = angular.element('<gm-map gm-map-id="mapId" gm-center="center" gm-zoom="zoom" gm-bounds="bounds">' +
      '<div gm-control ' +
      'gm-position="TOP_RIGHT"' +
      'gm-index="name"' +
      '></div>' +
      '</gm-map>');

    scope = scope.$new();
    scope.mapId = 'test3';
    scope.name = 'not_A_number';
    expect(angular.bind(this, $compile(elm), scope)).toThrow();
  }));

  // it('should $compile content and recognize scope changes', function () {
  //   scope.$apply(function () {
  //     scope.myVal = 'initial';
  //   });
  //   scope.$digest();
  //   expect(inner.val()).toBe('initial');

  //   scope.$apply(function () {
  //     scope.myVal = 'final';
  //   });
  //   expect(inner.val()).toBe('final');
  // });

  // it('adds the control to the map', function(){
  //   expect(mapCtrl.addControl).toHaveBeenCalled();
  //   console.log(mapCtrl.addControl.mostRecentCall.args[0]);
  // });

  // it('sets the index property correctly', function(){
  //   var ctrl = mapCtrl.addControl.mostRecentCall.args[0];
  //   expect(ctrl.index).toEqual(1);
  // });
});
