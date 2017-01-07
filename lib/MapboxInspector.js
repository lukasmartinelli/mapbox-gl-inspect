'use strict';
var stylegen = require('./stylegen');
var InspectToggle = require('./InspectToggle');
var FeaturePopup = require('./FeaturePopup');
var isEqual = require('lodash.isequal');

var emptyStyle = {
  version: 8,
  layers: [],
  sources: {}
};

function MapboxInspector(options) {
  if (!(this instanceof MapboxInspector)) {
    throw new Error("MapboxInspector needs to be called with the new keyword");
  }
  this.inspectorEnabled = options.enabled || false;
  this.popupEnabled = options.popupEnabled || true;
  this.sources = {};
  this.toggleInspector = this.toggleInspector.bind(this)
  this._onSourceChange = this._onSourceChange.bind(this)
  this._onMousemove = this._onMousemove.bind(this)
  this._onMapLoad = this._onMapLoad.bind(this)

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

MapboxInspector.prototype.toggleInspector = function() {
  if(!this.inspectorEnabled) {
    this._originalStyle = this._map.getStyle();
  }
  this.inspectorEnabled = !this.inspectorEnabled;
  this._renderInspector();
};

MapboxInspector.prototype._renderInspector = function() {
  if(this.inspectorEnabled) {
    this._map.setStyle(this._inspectStyle);
    this._toggle.setMapIcon();
  } else {
    this._map.setStyle(this._originalStyle);
    this._toggle.setInspectIcon();
  }
};

MapboxInspector.prototype._onSourceChange = function() {
  var sources = this.sources;
  var map = this._map;
  var previousSources = Object.assign({}, sources);

  //NOTE: This heavily depends on the internal API of Mapbox GL
  //so this breaks between Mapbox GL JS releases
  Object.keys(map.style.sourceCaches).forEach(function(sourceId) {
    sources[sourceId] = map.style.sourceCaches[sourceId]._source.vectorLayerIds;
  })

  if(!isEqual(previousSources, sources)) {
    var coloredLayers = stylegen.generateColoredLayers(sources);
    this._inspectStyle = stylegen.generateInspectStyle(map.getStyle(), coloredLayers);
  }
};

MapboxInspector.prototype._onMapLoad = function() {
  this._originalStyle = this._map.getStyle();
  this._renderInspector();
};

MapboxInspector.prototype._onMousemove = function(e) {
  if(!this.popupEnabled || !this.inspectorEnabled) return;
  var features = this._map.queryRenderedFeatures(e.point, { layers: this.layers })
  this._map.getCanvas().style.cursor = (features.length) ? 'pointer' : ''

  if(features.length < 1) return
  this._popup.setLngLat(e.lngLat)
    .setHTML(FeaturePopup(features[0]))
    .addTo(this._map)
};

MapboxInspector.prototype.onAdd = function(map) {
  this._map = map;
  map.on("tiledata", this._onSourceChange);
  map.on("sourcedata", this._onSourceChange);
  map.on("load", this._onMapLoad);
  map.on('mousemove', this._onMousemove);
  return this._toggle.elem;
};

MapboxInspector.prototype.onRemove = function() {
  map.off("tiledata", this._onSourceChange);
  map.off("sourcedata", this._onSourceChange);
  map.off("load", this._onMapLoad);
  map.off('mousemove', this._onMousemove);

  var elem = this._toggle.elem
  elem.parentNode.removeChild(elem);
  this._map = undefined;
};

module.exports = MapboxInspector;
