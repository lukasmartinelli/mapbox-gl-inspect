var throttle = require('lodash.throttle');
var isEqual = require('lodash.isequal');

function LayerWatcher(opts) {
  opts = Object.assign({
    onSourcesChange: function() {},
    onVectorLayersChange: function() {}
  }, opts);

  var sources = {};
  var vectorLayers = {};

  this.analyzeMap = function(map) {
    var previousSources = Object.assign({}, sources);

    Object.keys(map.style.sourceCaches).forEach(function(sourceId) {
      //NOTE: This heavily depends on the internal API of Mapbox GL
      //so this breaks between Mapbox GL JS releases
      sources[sourceId] = map.style.sourceCaches[sourceId]._source.vectorLayerIds;
    })

    if(!isEqual(previousSources, sources)) {
      opts.onSourcesChange(sources);
    }
  }
}

module.exports = LayerWatcher
