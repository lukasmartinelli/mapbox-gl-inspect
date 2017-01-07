'use strict';
var stylegen = require('./stylegen');

function InspectButton() {
  var btn = document.createElement("button");
  btn.className = "mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-in"
  btn.type = 'button'
  btn['aria-label'] = 'Inspect'
  btn.onclick = function() {
    console.log('Enable inspect')
  }
  return btn
}

function MapboxInspector(options) {
  if (!(this instanceof MapboxInspector)) {
    throw new Error("MapboxInspector needs to be called with the new keyword");
  }

  this.onAdd = function(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    this._container.appendChild(InspectButton())
    return this._container;
  };

  this.onRemove = function() {
     this._container.parentNode.removeChild(this._container);
     this._map = undefined;
  };
}

module.exports = MapboxInspector;
