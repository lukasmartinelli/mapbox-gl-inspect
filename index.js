'use strict';
var stylegen = require('./lib/stylegen');
var LayerWatcher = require('./lib/layerwatcher');

function InspectToggle(opts) {
  var enabled = false;

  var btn = document.createElement("button");
  btn.className = "mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-in"
  btn.type = 'button'
  btn['aria-label'] = 'Inspect'
  btn.onclick = function() {
    enabled = !enabled;
    opts.onToggle(enabled);
    console.log('Enable inspect')
  }

  var container = document.createElement('div');
  container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
  container.appendChild(btn)
  return container
}

function MapboxInspector(options) {
  if (!(this instanceof MapboxInspector)) {
    throw new Error("MapboxInspector needs to be called with the new keyword");
  }
  this.onAdd = function(map) {
    console.log(stylegen);
    var inspectStyle = stylegen.generateInspectStyle({
      version: 8,
      layers: [],
      sources: []
    }, []);

    var watcher = new LayerWatcher({
      onSourcesChange: function(sources) {
        var coloredLayers = stylegen.generateColoredLayers(sources);
        inspectStyle = stylegen.generateInspectStyle(map.getStyle(), coloredLayers);
      }
    });

    //TODO: We need to unsubscribe on remove
    map.on("data", function(e) {
      if(e.dataType !== 'tile') return;
      watcher.analyzeMap(map);
    });

    this._map = map;
    this._container = InspectToggle({
      onToggle: function(enable) {
        console.log('Toggle', enable)
        if(enable) {
          map.setStyle(inspectStyle);
        } else {
        }
      }
    });
    return this._container;
  };

  this.onRemove = function() {
     this._container.parentNode.removeChild(this._container);
     this._map = undefined;
  };
}

module.exports = MapboxInspector;
