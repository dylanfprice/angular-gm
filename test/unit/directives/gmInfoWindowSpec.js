describe('gmInfoWindow', function () {
  var scope, $rootScope, $compile, $timeout;
  var angulargmContainer;

  beforeEach(module('AngularGM'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_, _angulargmContainer_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $timeout = _$timeout_;
    angulargmContainer = _angulargmContainer_;

    scope = $rootScope.$new();
  }));

  function createMap(mapId) {
    scope.mapId = mapId;
    $compile('<gm-map gm-map-id="mapId"></gm-map>')(scope);
    scope.$digest();
    var map = angulargmContainer.getMap(mapId);
    if (!map) {
      console.log('map was null!');
    }
    return angulargmContainer.getMap(mapId);
  }

  function createWindow(options, inner) {
    scope.iwopts = options || {};
    var elm = angular.element('<div>' +
                                '<div gm-info-window="infoWindow" ' +
                                '     gm-info-window-options="iwopts" ' +
                                '     gm-on-closeclick="closed = true" ' +
                                '</div>' +
                              '</div>');
    if (inner){
      elm.children().append(inner);
    }
    $compile(elm)(scope);
  }

  it('should bind info window to scope', function () {
    createWindow();
    expect(scope.iwopts).toBeTruthy();
  });

  it('should create info window with given options & content', function () {
    var content = angular.element('<h1>Hi</h1>');
    createWindow({ zIndex: 5 }, content);
    expect(scope.infoWindow.getZIndex()).toBe(5);
    expect(scope.infoWindow.getContent().innerHTML)
      .toBe(angular.element('<div>').append(content).html());
  });

  it('should $compile content and recognize scope changes', function () {
    var inner = angular.element('<input ng-model="myVal">');
    createWindow({}, inner);

    var gmap = createMap('test');

    scope.infoWindow.open(gmap);

    scope.$apply(function () {
      scope.myVal = 'initial';
    });
    expect(inner.val()).toBe('initial');

    scope.$apply(function () {
      scope.myVal = 'final';
    });
    expect(inner.val()).toBe('final');

    angulargmContainer.removeMap('test');
  });

  it('should handle info window events', function () {
    expect(scope.closed).toBeUndefined();
    createWindow();
    createMap('test');
    google.maps.event.trigger(scope.infoWindow, 'closeclick');
    $timeout.flush();
    expect(scope.closed).toBe(true);
    angulargmContainer.removeMap('test');
  });

});
