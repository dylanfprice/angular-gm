# AngularGM

AngularGM is a set of directives for embedding Google Maps in your application using the Google Maps Javascript API.

[Example Plunkers](http://embed.plnkr.co/PYDYjVuRHaJpdntoJtqL)


## Features

+ Bi-directional association of map bounds, center, and zoom with scope variables
+ Multiple Google Maps can be embedded in the same page
+ Works with [ngView](http://docs.angularjs.org/api/ng.directive:ngView) (map gets destroyed/created when the view changes)
+ Bind custom objects to markers
+ Listen for and generate events on markers/objects
+ Create InfoWindows which compile Angular expressions (credit goes to [ui-map](https://github.com/angular-ui/ui-map) for this feature)


## Documentation and Examples

+ [JSDoc](http://dylanfprice.github.com/angular-gm/docs/module-AngularGM.html)
+ [Example Plunkers](http://embed.plnkr.co/PYDYjVuRHaJpdntoJtqL)


## Quick Start

Include the required libraries 
```html
<script src="//maps.googleapis.com/maps/api/js?sensor=false"></script>
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.5/angular.min.js"></script>
<script src="//dylanfprice.github.com/angular-gm/angular-gm-0.1.0.min.js"></script>
```

Declare a dependency on the `AngularGM` module
``` javascript
var app = angular.module('myModule', ['AngularGM']);
```

Make a map
```html
<gm-map gm-map-id="'myMap'" gm-center="center" gm-zoom="zoom" gm-bounds="bounds" style="width:500px;height:500px;"></gm-map>
```


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

Pull Requests welcome!


## Author

**Dylan Price** (http://github.com/dylanfprice)


## Credits

Inspired by Nicolas Laplante's angular-google-maps directive (http://github.com/nlaplante/angular-google-maps)

README and project layout stolen from Olivier Louvignes' AngularStrap repo (http://github.com/mgcrea/angular-strap)

Much of the gmInfoWindow directive code is from the [ui-map](https://github.com/angular-ui/ui-map) project
  
