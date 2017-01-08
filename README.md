# Mapbox GL Inspect [![Build Status](https://travis-ci.org/lukasmartinelli/mapbox-gl-inspect.svg?branch=master)](https://travis-ci.org/lukasmartinelli/mapbox-gl-inspect)

Add an inspect control to [Mapbox GL JS](https://github.com/mapbox/mapbox-gl-js) to view all features
of the vector sources and allows hovering over features to see their properties.

![Mapbox GL Inspect Preview](https://cloud.githubusercontent.com/assets/1288339/21744637/11759412-d51a-11e6-9581-f26741fcd182.gif)

## Usage

**mapbox-gl-inspect** is a [Mapbox GL JS plugin](https://www.mapbox.com/blog/build-mapbox-gl-js-plugins/) that you can easily add on top of your map. Check `index.html` for a complete example.

Make sure to include the CSS and JS files.

```html
<script src='http://mapbox-gl-inspect.lukasmartinelli.ch/dist/mapbox-gl-inspect.min.js'></script>
<link href='http://mapbox-gl-inspect.lukasmartinelli.ch/dist/mapbox-gl-inspect.css' rel='stylesheet' />
```

Add the inspector control to your map.

```javascript
map.addControl(new MapboxInspect());
```

Enable the inspection map by default.

```javascript
map.addControl(new MapboxInspect({
  enabled: true
}));
```

Disable the feature Popup in inspection mode.

```javascript
map.addControl(new MapboxInspect({
  popupEnabled: false
}));
```

You are able to control the generated colors and background of the inspection style.
Check [`examples/custom-color-1.html`](http://mapbox-gl-inspect.lukasmartinelli.ch/examples/custom-color-1.html) and [`examples/custom-color-2.html`](http://mapbox-gl-inspect.lukasmartinelli.ch/examples/custom-color-2.html).

```javascript
var colors = ['#FC49A3', '#CC66FF', '#66CCFF', '#66FFCC', '#00FF00', '#FFCC66', '#FF6666', '#FF0000', '#FF8000', '#FFFF66', '#00FFFF'];
map.addControl(new MapboxInspect({
  backgroundColor: '#000',
  assignLayerColor: function(layerId, alpha) {
      //In more advanced coloring functions you use the layerId as seed value
      var randomNumber = parseInt(Math.random() * colors.length);
      return colors[randomNumber];
	}
}));
```

## Develop

Run linter and watch for changes to rebuild with browserify.

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
