# AngularGM

AngularGM is a set of directives for embedding Google Maps in your application using the Google Maps Javascript API.

[![Build Status](https://travis-ci.org/dylanfprice/angular-gm.png)](https://travis-ci.org/dylanfprice/angular-gm)

[Example Plunkers](http://embed.plnkr.co/PYDYjVuRHaJpdntoJtqL)


## Features

+ Bi-directional association of map bounds, center, and zoom with scope variables
+ Multiple Google Maps can be embedded in the same page
+ Works with [ngView](http://docs.angularjs.org/api/ng.directive:ngView) and reuses map instances so there is no [memory leak](https://github.com/dylanfprice/angular-gm/issues/3)
+ Bind custom objects to markers
+ Listen for and generate events on markers/objects
+ Create InfoWindows which compile Angular expressions (credit goes to [ui-map](https://github.com/angular-ui/ui-map) for this feature)
+ Create polylines


## Documentation and Examples

+ [Documentation](http://angulargm.herokuapp.com/documentation/angulargm-0.3.0/api/angulargm)
+ [Example Plunkers](http://embed.plnkr.co/PYDYjVuRHaJpdntoJtqL)


## Quick Start

Include the required libraries 
```html
<script src="//maps.googleapis.com/maps/api/js?sensor=false"></script>
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.min.js"></script>
<script src="//angulargm.herokuapp.com/angular-gm-0.3.0.min.js"></script>
```

Declare a dependency on the `AngularGM` module
``` javascript
var app = angular.module('myModule', ['AngularGM']);
```

Make a map
```html
<gm-map gm-map-id="'myMap'" gm-center="center" gm-zoom="zoom" gm-bounds="bounds" gm-map-type-id="mapTypeId" style="width:500px;height:500px;"></gm-map>
```

There is also now the option to install through **Bower**: `bower install AngularGM`


## Development

Clone the repo, `git clone git://github.com/dylanfprice/angular-gm.git`

AngularGM is tested with `karma`

``` bash
$ sudo npm install grunt-cli --global
$ npm install
$ grunt karma:server
```

You can build the latest version using `grunt`.

``` bash
$ grunt build
```

You can also view the latest documentation on your local machine.
```bash
$ grunt docular-server
```

Pull Requests welcome!


## Author

**Dylan Price** (http://github.com/dylanfprice)


## Credits

Inspired by Nicolas Laplante's angular-google-maps directive (http://github.com/nlaplante/angular-google-maps)

README and project layout stolen from Olivier Louvignes' AngularStrap repo (http://github.com/mgcrea/angular-strap)

Much of the gmInfoWindow directive code is from the [ui-map](https://github.com/angular-ui/ui-map) project
  

## Changelog
Note these are not comprehensive commit lists but represent what I consider the
most significant changes. You can always see a full changelog with `git log
v0.2.0..v0.1.1`.

### 0.3.0
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/69d79899f5da13d5c7c00da4e64efdce775ff2d6) &bull; [Polylines] Init polylines directive 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/39da12fd0eb1dccb4554b8b4c7704b128f0b3a76) &bull; Generate docs based on angulargm version. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/aca653b9a32482a3b8e21a784f24db729ef6c1c9) &bull; Fixes #10. Allow configuring precision. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/db2ff045737dff0a085b6d8e5a34d80daaad0ada) &bull; Adding travis build config. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/76ae49c6031e745707902b98364aa1392296f0d1) &bull; Added travis build status to README. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/0abe30e34d4c748cefb44e09520d1f2c663bbbd9) &bull; getEventHandlers should convert camelcase to underscored event names 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/eaf1f217b640d3ab7c103d6f17e8c5e8b74bbfa5) &bull; turns out Google Maps can have more than one listener on an event, so keep track of all of them instead of removing earlier listeners 

### v0.2.0
+ AngularGM documentation is now being generated using [Docular](http://grunt-docular.com/). You can still [view the old docs](http://dylanfprice.github.io/angular-gm/docs/), as well as find the old docs and builds in the [gh-pages branch](https://github.com/dylanfprice/angular-gm/tree/gh-pages).
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/06cb6c21fa8b5753e53ff3209bf37f770a3e14a9) &bull; Add option override the Marker constructor. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/f0d44debaae2c3f1231f54480a4b3840c392399f) &bull; Fixes #4. Map options reset when angulargmMapController is re-instantiated. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/3979163640fbc0bdca37764ff8f786c612ef5509) &bull; Added mapTypeId to gmMap. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/e34b216202507116c6123f7c86e866104f622111) &bull; Updated testing config for latest version 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/d9fa914ca80486cac0231a116f2b85885745a266) &bull; Versioned devDependencies. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/bdf6de3a1df8fc77ce9dd5f9e4daee6db58be37e) &bull; Switched documentation to docular. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/8cb84094fd77da8e71ccd31b2575911887086cff) &bull; Removed jsdoc. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/f5c79cfa370c8269a74009be84f73bb4961ab844) &bull; Script for pushing docs and builds to heroku. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/505a6c777fff2199f53f0b2a4a6e4d15d2471cc7) &bull; Need to trigger resize at end of gmMap so markers will be redrawn. 

### v0.1.1
+ If you use the getMapPromise method of [angulargmContainer](http://dylanfprice.github.io/angular-gm/docs/module-angulargmContainer.html), you may want to make sure your configuration is in a [run](http://docs.angularjs.org/api/angular.Module#run) function. If you do configuration in a controller it will get re-run on the same map instance every time the controller is re-instantiated.
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/a715cd14a44519d5f7473ee0d485781b9ca1c46b) &bull; Added gmMapResize event to gmMap. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/4736ba9abd741f17333d60285f047bb380a2cc75) &bull; Make gmMarkersRedraw event more flexible. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/bf97b1c4f99d2f7f88998e1bb6d0c512e687775b) &bull; Fixes #3. Reuse google map instances. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/03ab919f6e00ef9b5eb033202b7f2183ce944b79) &bull; Update to angular 1.0.7. 


