'use strict';
var stylegen = require('./stylegen');
var InspectToggle = require('./InspectToggle');
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
  this.sources = {};
  this.toggleInspector = this.toggleInspector.bind(this)
  this._onSourceChange = this._onSourceChange.bind(this)
  this._onMapLoad = this._onMapLoad.bind(this)

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
}

MapboxInspector.prototype.onAdd = function(map) {
  this._map = map;
  map.on("tiledata", this._onSourceChange);
  map.on("sourcedata", this._onSourceChange);
  map.on("load", this._onMapLoad);
  return this._toggle.elem;
};

MapboxInspector.prototype.onRemove = function() {
  map.off("tiledata", this._onSourceChange);
  map.off("sourcedata", this._onSourceChange);
  map.off("load", this._onMapLoad);

  var elem = this._toggle.elem
  elem.parentNode.removeChild(elem);
  this._map = undefined;
};

module.exports = MapboxInspector;
