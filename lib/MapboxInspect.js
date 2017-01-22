var stylegen = require('./stylegen');
var InspectButton = require('./InspectButton');
var isEqual = require('lodash.isequal');
var renderPopup = require('./renderPopup');
var colors = require('./colors');

function isInspectStyle(style) {
  return style.metadata && style.metadata['mapbox-gl-inspect:inspect'];
}

function markInspectStyle(style) {
  return Object.assign(style, {
    metadata: Object.assign({}, style.metadata, {
      'mapbox-gl-inspect:inspect': true
    })
  });
}

function fixRasterSource(source) {
  if (source.type === 'raster' && source.tileSize && source.tiles) {
    return {
      type: source.type,
      tileSize: source.tileSize,
      tiles: source.tiles
    };
  }
  if (source.type === 'raster' && source.url) {
    return {
      type: source.type,
      url: source.url
    };
  }
  return source;
}

//TODO: We can remove this at some point in the future
function fixStyle(style) {
  Object.keys(style.sources).forEach(function (sourceId) {
    style.sources[sourceId] = fixRasterSource(style.sources[sourceId]);
  });
  return style;
}

function notifyVersion(mapboxgl) {
  var versions = mapboxgl.version.split('.').map(parseFloat);
  if (versions[0] < 1 && versions[1] < 29) {
    console.error('MapboxInspect only supports Mapbox GL JS >= v0.29.0. Please upgrade your Mapbox GL JS version.');
  }
}

function MapboxInspect(options) {
  if (!(this instanceof MapboxInspect)) {
    throw new Error('MapboxInspect needs to be called with the new keyword');
  }

  var popup = null;
  if (window.mapboxgl) {
    notifyVersion(window.mapboxgl);
    popup = new window.mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
  } else if (!options.popup) {
    console.error('Mapbox GL JS can not be found. Make sure to include it or pass an initialized MapboxGL Popup to MapboxInspect if you are using moduleis.');
  }

  this.options = Object.assign({
    showInspectMap: false,
    showInspectButton: true,
    showInspectMapPopup: true,
    showMapPopup: false,
    showMapPopupOnHover: true,
    showInspectMapPopupOnHover: true,
    backgroundColor: '#fff',
    assignLayerColor: colors.brightColor,
    buildInspectStyle: stylegen.generateInspectStyle,
    renderPopup: renderPopup,
    popup: popup,
    selectThreshold: 5,
    useInspectStyle: true,
    queryParameters: {},
    sources: {}
  }, options);

  this.sources = this.options.sources;
  this.assignLayerColor = this.options.assignLayerColor;
  this.toggleInspector = this.toggleInspector.bind(this);
  this._popup = this.options.popup;
  this._showInspectMap = this.options.showInspectMap;
  this._onSourceChange = this._onSourceChange.bind(this);
  this._onMousemove = this._onMousemove.bind(this);
  this._onStyleChange = this._onStyleChange.bind(this);

  this._originalStyle = null;
  this._toggle = new InspectButton({
    show: this.options.showInspectButton,
    onToggle: this.toggleInspector.bind(this)
  });
}

MapboxInspect.prototype.toggleInspector = function () {
  this._showInspectMap = !this._showInspectMap;
  this.render();
};

MapboxInspect.prototype._inspectStyle = function () {
  var coloredLayers = stylegen.generateColoredLayers(this.sources, this.assignLayerColor);
  return this.options.buildInspectStyle(this._map.getStyle(), coloredLayers, {
    backgroundColor: this.options.backgroundColor
  });
};

MapboxInspect.prototype.render = function () {
  if (this._showInspectMap) {
    if (this.options.useInspectStyle) {
      this._map.setStyle(fixStyle(markInspectStyle(this._inspectStyle())));
    }
    this._toggle.setMapIcon();
  } else if (this._originalStyle) {
    if (this._popup) this._popup.remove();
    if (this.options.useInspectStyle) {
      this._map.setStyle(fixStyle(this._originalStyle));
    }
    this._toggle.setInspectIcon();
  }
};

MapboxInspect.prototype._onSourceChange = function () {
  var sources = this.sources;
  var map = this._map;
  var previousSources = Object.assign({}, sources);

  //NOTE: This heavily depends on the internal API of Mapbox GL
  //so this breaks between Mapbox GL JS releases
  Object.keys(map.style.sourceCaches).forEach(function (sourceId) {
    var sourceCache = map.style.sourceCaches[sourceId] || {_source: {}};
    var layerIds = sourceCache._source.vectorLayerIds;
    if (layerIds) {
      sources[sourceId] = layerIds;
    } else if (sourceCache._source.type === 'geojson') {
      sources[sourceId] = [];
    }
  });

  if (!isEqual(previousSources, sources)) {
    this.render();
  }
};

MapboxInspect.prototype._onStyleChange = function () {
  var style = this._map.getStyle();
  if (!isInspectStyle(style)) {
    this._originalStyle = style;
  }
};

MapboxInspect.prototype._onMousemove = function (e) {
  var queryBox;
  if (this.options.selectThreshold === 0) {
    queryBox = e.point;
  } else {
    // set a bbox around the pointer
    queryBox = [
      [
        e.point.x - this.options.selectThreshold,
        e.point.y + this.options.selectThreshold
      ], // bottom left (SW)
      [
        e.point.x + this.options.selectThreshold,
        e.point.y - this.options.selectThreshold
      ] // top right (NE)
    ];
  }

  var features = this._map.queryRenderedFeatures(queryBox, this.options.queryParameters) || [];
  this._map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

  if (this._showInspectMap) {
    if (!this.options.showInspectMapPopup) return;
    if (e.type === 'mousemove' && !this.options.showInspectMapPopupOnHover) return;
  } else {
    if (!this.options.showMapPopup) return;
    if (e.type === 'mousemove' && !this.options.showMapPopupOnHover) return;
  }

  if (this._popup) {
    if (!features.length) {
      this._popup.remove();
    } else {
      this._popup.setLngLat(e.lngLat)
        .setHTML(this.options.renderPopup(features))
        .addTo(this._map);
    }
  }
};

MapboxInspect.prototype.onAdd = function (map) {
  this._map = map;

  // if sources have already been passed as options
  // we do not need to figure out the sources ourselves
  if (Object.keys(this.sources).length === 0) {
    map.on('tiledata', this._onSourceChange);
    map.on('sourcedata', this._onSourceChange);
  }

  map.on('styledata', this._onStyleChange);
  map.on('load', this._onStyleChange);
  map.on('mousemove', this._onMousemove);
  map.on('click', this._onMousemove);
  return this._toggle.elem;
};

MapboxInspect.prototype.onRemove = function () {
  this._map.off('styledata', this._onStyleChange);
  this._map.off('load', this._onStyleChange);
  this._map.off('tiledata', this._onSourceChange);
  this._map.off('sourcedata', this._onSourceChange);
  this._map.off('mousemove', this._onMousemove);
  this._map.off('click', this._onMousemove);

  var elem = this._toggle.elem;
  elem.parentNode.removeChild(elem);
  this._map = undefined;
};

module.exports = MapboxInspect;
