Note these are not comprehensive commit lists but represent what I consider to be the
most significant changes. You can always see a full changelog with `git log
1.0.0..0.3.1`.

### 1.0.2
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/3e03341ffa4470010f37d52376f46f233f04ce17) &bull; Upgrade to angular 1.2.27 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/bc28243d854d766b3ad27785772c93065133471c) &bull; Added the configuration to add circles to the map. 

### 1.0.1
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/24e8ca2e9fd8eb9fda6ffee589b3e2f25a9affa1) &bull; Fix #45 - update addMapListenerOnce to fix memory leak 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/d214bd66203f3d658b0f746f7ddf3f399a0ea730) &bull; Remove jquery as a dependency 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/e7244d11ae54aa0709ea1bb14e3722caba58c735) &bull; Remove support for node 0.8 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/6a50a1981067aef028439c4171e4848783490f62) &bull; Don't  infowindow, instead hide it in the dom. Fixes #27 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/05cb5ff9f6ae18b15283f2d2a31d005f891c6e43) &bull; Be smarter with google maps events--don't listen to drag in map controller and debounce in gmMap 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/6d1c8ea8b2086022bdaf32135a6125c8579847f9) &bull; Don't immediately execute debounced updateScope. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/9345e2a76541ad1b861e0c157e4865c914065637) &bull; Fix #75 scope hierarchy changed in newer versions of angularjs

### 1.0.0
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/a4b3ec74ca01cd718f152f9adee6e5dedc0c5045) &bull; Added markersById functionality, allows angular-gm to store markers by a user provided id instead of the markers latlng position 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/7a0db15159f397c469644a7c0243b3c38c4170dd) &bull; Moved use strict declarations inside functions 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/f50cb9556d907c7e05a02cf8d1df797f44b41eb8) &bull; Stopped infowindow from compiling elements everytime it's opened. From: https://github.com/dylanfprice/angular-gm/issues/27 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/a029d50e8687b0551646741d23154f75e72ffadc) &bull; Switched to using ids for markers 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/424de263fc8de15e9c79aea168f69e42fc2dcb19) &bull; gmPolylines now using ids 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/17938ff4d240e018c9a5598e560e1532d32cd094) &bull; Made controller element functions generic. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/1d8c933d25b3a9ddbc54ebaba221e0dc9c681974) &bull; Started pulling out generalizable logic from gmMarkers and put into new service angulargmShape. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/df0e80cd36ed638ba2ba2701c55e22c1f5d55844) &bull; Refactored rest of gmMarkers into generalized functions in angulargmShape. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/a43f6a85ba77135bf7ab3cc5c5c5e3e299ab6237) &bull; Changed gmPolylines to take advantage of angulargmShape. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/e432593d807c2a444095a19e0e9590e5c988de78) &bull; Add updateElement to angulargmMapController. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/32a36bceb5ecaf838b84584e93003162f46ff801) &bull; Add gmShapesUpdate event to manually trigger element update. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/a035cf08225f834f855ec74499b959244261d0a4) &bull; Fixes #37, added gmMapIdle event so you can do stuff when the map loads. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/281812344353dcff76e484d477a34a138caea9cc) &bull; Switched from docular to ngdocs. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/809bbe604a1e870f369c5eacb4b49eb2f601b00f) &bull; Added examples. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/2e4bfaf23a68f5ce1c746851e233e40bfc600747) &bull; Don't include version numbers in build files. 

### 0.3.1
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/8a2ee4b274e4d091e008ae3f5691331748707dbd) &bull; Guard angulargmDefaults in a function so it only gets run if AngularGM is loaded. 

### 0.3.0
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/69d79899f5da13d5c7c00da4e64efdce775ff2d6) &bull; [Polylines] Init polylines directive 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/39da12fd0eb1dccb4554b8b4c7704b128f0b3a76) &bull; Generate docs based on angulargm version. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/aca653b9a32482a3b8e21a784f24db729ef6c1c9) &bull; Fixes #10. Allow configuring precision. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/db2ff045737dff0a085b6d8e5a34d80daaad0ada) &bull; Adding travis build config. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/76ae49c6031e745707902b98364aa1392296f0d1) &bull; Added travis build status to README. 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/0abe30e34d4c748cefb44e09520d1f2c663bbbd9) &bull; getEventHandlers should convert camelcase to underscored event names 
+ [view commit](http://github.com/dylanfprice/angular-gm/commit/eaf1f217b640d3ab7c103d6f17e8c5e8b74bbfa5) &bull; turns out Google Maps can have more than one listener on an event, so keep track of all of them instead of removing earlier listeners 

### v0.2.0
+ AngularGM documentation is now being generated using [Docular](http://grunt-docular.com/). ~~You can still [view the old docs](http://dylanfprice.github.io/angular-gm/docs/), as well as find the old docs and builds in the [gh-pages branch](https://github.com/dylanfprice/angular-gm/tree/gh-pages).~~ Now that 1.0.0 is released these are no longer available. But moving forward there is a better path for versioning documentation alongside the release so that's good!
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
