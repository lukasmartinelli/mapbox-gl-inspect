var stylegen = require('./stylegen');
var InspectToggle = require('./InspectToggle');
var isEqual = require('lodash.isequal');
var renderPopup = require('./renderPopup');
var assignLayerColor = require('./assignLayerColor');

var mapboxgl = window.mapboxgl;
if (mapboxgl) {
  var versions = mapboxgl.version.split('.').map(parseFloat);
  if (versions[0] < 1 && versions[1] < 29) {
    console.error('MapboxInspector only supports Mapbox GL JS >= v0.29.0. Please upgrade your Mapbox GL JS version.');
  }
} else {
  console.error('Mapbox GL JS can not be found. Make sure to include it.');
}

var emptyStyle = {
  version: 8,
  layers: [],
  sources: {}
};

function MapboxInspector(options) {
  if (!(this instanceof MapboxInspector)) {
    throw new Error('MapboxInspector needs to be called with the new keyword');
  }
  this.options = Object.assign({
    enabled: false,
    popupEnabled: true,
    backgroundColor: '#fff',
    assignLayerColor: assignLayerColor
  }, options);
  this.inspectorEnabled = options.enabled;
  this.sources = {};
  this.toggleInspector = this.toggleInspector.bind(this);
  this._onSourceChange = this._onSourceChange.bind(this);
  this._onMousemove = this._onMousemove.bind(this);
  this._onMapLoad = this._onMapLoad.bind(this);

  this._popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  this._originalStyle = emptyStyle;
  this._inspectStyle = emptyStyle;
  this._toggle = new InspectToggle({
    onToggle: this.toggleInspector.bind(this)
  });
}

MapboxInspector.prototype.toggleInspector = function () {
  if (!this.inspectorEnabled) {
    this._originalStyle = this._map.getStyle();
  }
  this.inspectorEnabled = !this.inspectorEnabled;
  this._renderInspector();
};

MapboxInspector.prototype._renderInspector = function () {
  if (this.inspectorEnabled) {
    this._map.setStyle(this._inspectStyle);
    this._toggle.setMapIcon();
  } else {
    this._popup.remove();
    this._map.setStyle(this._originalStyle);
    this._toggle.setInspectIcon();
  }
};

MapboxInspector.prototype._onSourceChange = function () {
  var sources = this.sources;
  var map = this._map;
  var previousSources = Object.assign({}, sources);

  //NOTE: This heavily depends on the internal API of Mapbox GL
  //so this breaks between Mapbox GL JS releases
  Object.keys(map.style.sourceCaches).forEach(function (sourceId) {
    sources[sourceId] = map.style.sourceCaches[sourceId]._source.vectorLayerIds;
  });

  if (!isEqual(previousSources, sources)) {
    var coloredLayers = stylegen.generateColoredLayers(sources, this.options.assignLayerColor);
    this._inspectStyle = stylegen.generateInspectStyle(map.getStyle(), coloredLayers, {
      backgroundColor: this.options.backgroundColor
    });
  }
};

MapboxInspector.prototype._onMapLoad = function () {
  this._originalStyle = this._map.getStyle();
  this._renderInspector();
};

MapboxInspector.prototype._onMousemove = function (e) {
  if (!this.options.popupEnabled || !this.inspectorEnabled) return;
  var features = this._map.queryRenderedFeatures(e.point);
  this._map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

  if (!features.length) {
    this._popup.remove();
  } else {
    this._popup.setLngLat(e.lngLat)
      .setHTML(renderPopup(features))
      .addTo(this._map);
  }
};

MapboxInspector.prototype.onAdd = function (map) {
  this._map = map;
  map.on('tiledata', this._onSourceChange);
  map.on('sourcedata', this._onSourceChange);
  map.on('load', this._onMapLoad);
  map.on('mousemove', this._onMousemove);
  return this._toggle.elem;
};

MapboxInspector.prototype.onRemove = function () {
  this._map.off('tiledata', this._onSourceChange);
  this._map.off('sourcedata', this._onSourceChange);
  this._map.off('load', this._onMapLoad);
  this._map.off('mousemove', this._onMousemove);

  var elem = this._toggle.elem;
  elem.parentNode.removeChild(elem);
  this._map = undefined;
};

module.exports = MapboxInspector;
