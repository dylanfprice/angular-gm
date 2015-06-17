# AngularGM

AngularGM is a set of directives for embedding Google Maps in your application using the Google Maps Javascript API.

[![Build Status](https://travis-ci.org/dylanfprice/angular-gm.png)](https://travis-ci.org/dylanfprice/angular-gm)

Latest version: 1.0.2


## Features

+ Bi-directional association of map bounds, center, and zoom with scope variables
+ Multiple Google Maps can be embedded in the same page
+ Works with [ngView](http://docs.angularjs.org/api/ng.directive:ngView) and reuses map instances so there is no [memory leak](https://github.com/dylanfprice/angular-gm/issues/3)
+ Bind custom objects to markers
+ Listen for and generate events on markers/objects
+ Create InfoWindows which compile Angular expressions (credit goes to [ui-map](https://github.com/angular-ui/ui-map) for this feature)
+ Create polylines


## Documentation and Examples

+ [Documentation](http://dylanfprice.github.io/angular-gm/1.0.2/docs/)
+ [Examples](http://dylanfprice.github.io/angular-gm/1.0.2/examples/)


## Quick Start

Include the required libraries 
```html
<script src="//maps.googleapis.com/maps/api/js?sensor=false"></script>
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.27/angular.min.js"></script>
<script src="//dylanfprice.github.io/angular-gm/1.0.2/angular-gm.min.js"></script>
```

Declare a dependency on the `AngularGM` module
``` javascript
var app = angular.module('myModule', ['AngularGM']);
```

Make a map
```html
<gm-map gm-map-id="'myMap'" gm-center="center" gm-zoom="zoom" gm-bounds="bounds" gm-map-type-id="mapTypeId" style="width:500px;height:500px;"></gm-map>
```

There is also the option to install through **Bower**: `bower install AngularGM`


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
$ grunt && grunt connect
```

then go to [http://localhost:8000/dist/docs/](http://localhost:8000/dist/docs/)


Pull Requests welcome!


## Author

**Dylan Price** (the.dylan.price@gmail.com, http://github.com/dylanfprice)


## Credits

Inspired by Nicolas Laplante's angular-google-maps directive (http://github.com/nlaplante/angular-google-maps)

README and project layout stolen from Olivier Louvignes' AngularStrap repo (http://github.com/mgcrea/angular-strap)

Much of the gmInfoWindow directive code is from the [ui-map](https://github.com/angular-ui/ui-map) project
  

## Changelog
Moved to [CHANGELOG.md](CHANGELOG.md)

