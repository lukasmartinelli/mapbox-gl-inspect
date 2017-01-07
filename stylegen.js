var randomColor = require('randomcolor');
var Color = require('color');

/**
 * Assign a color to a unique layer ID and also considering
 * common layer names such as water or wood.
 * @param {string} layerId
 * @return {string} Unique random for the layer ID
 */
function assignVectorLayerColor(layerId) {
  var hue = null
  if(/water|ocean|lake|sea|river/.test(layerId)) {
    hue = 'blue'
  }

  if(/road|highway|transport/.test(layerId)) {
    hue = 'orange'
  }

  if(/building/.test(layerId)) {
    hue = 'yellow'
  }

  if(/wood|forest|park|landcover|landuse/.test(layerId)) {
    hue = 'green'
  }

  return randomColor({
    luminosity: 'bright',
    hue: hue,
    seed: layerId,
  })
}

function circleLayer(color, source, vectorLayer) {
  var layer = {
    id: [source, vectorLayer, 'circle'].join('_'),
    source: source,
    type: 'circle',
    paint: {
      'circle-color': color,
      'circle-radius': 2,
    },
    filter: ["==", "$type", "Point"]
  }
  if(vectorLayer) {
    layer['source-layer'] = vectorLayer
  }
  return layer
}

function polygonLayer(color, source, vectorLayer) {
  var layer = {
    id: [source, vectorLayer, 'polygon'].join('_'),
    source: source,
    type: 'fill',
    paint: {
      'fill-color': color,
      'fill-antialias': true,
      'fill-outline-color': color,
    },
    filter: ["==", "$type", "Polygon"]
  }
  if(vectorLayer) {
    layer['source-layer'] = vectorLayer
  }
  return layer
}

function lineLayer(color, source, vectorLayer) {
  var layer = {
    id: [source, vectorLayer, 'line'].join('_'),
    source: source,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    type: 'line',
    paint: {
      'line-color': color,
    },
    filter: ["==", "$type", "LineString"]
  }
  if(vectorLayer) {
    layer['source-layer'] = vectorLayer
  }
  return layer
}

/**
 * Generate colored layer styles for the given sources
 * TODO: Improve docs
 * @param {Object} Sources dict containing the vector layer IDs
 * @return {array} Array of Mapbox GL layers
 */
function generateColoredLayers(sources) {
  var polyLayers = [];
  var circleLayers = [];
  var lineLayers = [];

  Object.keys(sources).forEach(function(sourceId) {
    var layers = sources[sourceId];

    var circleLayer = circleLayer.bind(null, color.alpha(0.3), sourceId);
    var lineLayer = circleLayer.bind(null, color.alpha(0.3), sourceId);
    var polyLayer = circleLayer.bind(null, color.alpha(0.2), sourceId);

    if(!layers) {
      var color = Color(assignVectorLayerColor(sourceId));

      circleLayers.push(circleLayer());
      lineLayers.push(lineLayer());
      polyLayers.push(polygonLayer());
    } else {
      layers.forEach(function(layerId) {
        var color = Color(assignVectorLayerColor(layerId));

        circleLayers.push(circleLayer(layerId));
        lineLayers.push(lineLayer(layerId));
        polyLayers.push(polygonLayer(layerId));
      })
    }
  });

  return polyLayers.concat(lineLayers).concat(circleLayers);
}
