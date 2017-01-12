# Mapbox GL Inspect [![Build Status](https://travis-ci.org/lukasmartinelli/mapbox-gl-inspect.svg?branch=master)](https://travis-ci.org/lukasmartinelli/mapbox-gl-inspect)

Add an inspect control to [Mapbox GL JS](https://github.com/mapbox/mapbox-gl-js) to view all features
of the vector sources and allows hovering over features to see their properties.

**Requires [mapbox-gl-js](https://github.com/mapbox/mapbox-gl-js) (version 0.29.0 – 0.31.x).**

![Mapbox GL Inspect Preview](https://cloud.githubusercontent.com/assets/1288339/21744637/11759412-d51a-11e6-9581-f26741fcd182.gif)

## Usage

**mapbox-gl-inspect** is a [Mapbox GL JS plugin](https://www.mapbox.com/blog/build-mapbox-gl-js-plugins/) that you can easily add on top of your map. Check `index.html` for a complete example.

Make sure to include the CSS and JS files.

**When using a CDN**

```html
<script src='http://mapbox-gl-inspect.lukasmartinelli.ch/dist/mapbox-gl-inspect.min.js'></script>
<link href='http://mapbox-gl-inspect.lukasmartinelli.ch/dist/mapbox-gl-inspect.css' rel='stylesheet' />
```

**When using modules**

```js
require('mapbox-gl-inspect/dist/mapbox-gl-inspect.css');
var mapboxgl = require('mapbox-gl');
var MapboxInspect = require('mapbox-gl-inspect');

// Pass an initialized popup to Mapbox GL
map.addControl(new MapboxInspect({
  popup: new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  })
}));
```

Add the inspector control to your map.

```javascript
map.addControl(new MapboxInspect());
```

Switch to the inspection map by default.

```javascript
map.addControl(new MapboxInspect({
  showInspectMap: true
}));
```

Switch to the inspection map by default and hide the inspect button to switch back to the normal map. Check [`examples/inspect-only.html`](http://mapbox-gl-inspect.lukasmartinelli.ch/examples/inspect-only.html).


```javascript
map.addControl(new MapboxInspect({
  showInspectMap: true,
  showInspectButton: false
}));
```

Disable the feature Popup in inspection mode and in map mode. Check [`examples/no-popup.html`](http://mapbox-gl-inspect.lukasmartinelli.ch/examples/no-popup.html).

```javascript
map.addControl(new MapboxInspect({
  showInspectMapPopup: false,
  showMapPopup: false
}));
```

You can also control the Popup output. Check [`examples/custom-popup.html`](http://mapbox-gl-inspect.lukasmartinelli.ch/examples/custom-popup.html).

```javascript
map.addControl(new MapboxInspect({
  renderPopup: function(features) {
    return '<h1>' + features.length + '</h1>';
  }
}));
```


You are able to control the generated colors and background of the inspection style.
Check [`examples/custom-color-1.html`](http://mapbox-gl-inspect.lukasmartinelli.ch/examples/custom-color-1.html) and [`examples/custom-color-2.html`](http://mapbox-gl-inspect.lukasmartinelli.ch/examples/custom-color-2.html).

```javascript
var colors = ['#FC49A3', '#CC66FF', '#66CCFF', '#66FFCC'];
map.addControl(new MapboxInspect({
  backgroundColor: '#000',
  assignLayerColor: function(layerId, alpha) {
    var randomNumber = parseInt(Math.random() * colors.length);
    return colors[randomNumber];
   }
}));
```

You can pass a `queryParameters` object structured like the parameters object documented for [`map.queryRenderedFeatures`](https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures).
This let's you show the inspect popup for only certain layers.

```js
map.addControl(new MapboxInspect({
  queryParameters: {
    layers: ['composite_road_line']
  }
}));
```

You can also use this feature to do custom layer [filtering](https://www.mapbox.com/mapbox-gl-style-spec/#types-filter).

```js
map.addControl(new MapboxInspect({
  queryParameters: {
    filter: ['>', 'height', 10]
  } 
}));
```

If inspecting features is too fiddly for thin lines you can optionally set a custom pixel buffer around the pointer when querying for features to make inspection a bit more forgiving.

```js
map.addControl(new MapboxInspect({
  selectThreshold: 50
});
```

## Develop

Run the linter and watch for changes to rebuild with browserify.

```
npm install
npm run test
npm run watch
```

Create a minified standalone build.

```
npm install
npm run build
```
