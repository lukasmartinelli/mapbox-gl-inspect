var randomColor = require('randomcolor');
var Color = require('color');

/**
 * Assign a color to a unique layer ID and also considering
 * common layer names such as water or wood.
 * @param {string} layerId
 * @return {string} Unique random for the layer ID
 */
function assignVectorLayerColor(layerId, opts) {
  opts = Object.assign({
    luminosity: 'bright'
  }, opts);
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
    luminosity: opts.luminosity,
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

function polygonLayer(color, outlineColor, source, vectorLayer) {
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

  function alphaColors(color) {
    return {
      circle: color.alpha(0.8).string(),
      line: color.alpha(0.6).string(),
      polygon: color.alpha(0.2).string(),
      polygonOutline: color.alpha(0.6).string(),
      default: color.string()
    };
  }

  Object.keys(sources).forEach(function(sourceId) {
    var layers = sources[sourceId];


    if(!layers) {
      var colors = alphaColors(Color(assignVectorLayerColor(sourceId)));

      circleLayers.push(circleLayer(colors.circle, sourceId));
      lineLayers.push(lineLayer(colors.line, sourceId));
      polyLayers.push(polygonLayer(colors.polygon, colors.polygonOutline, sourceId));
    } else {
      layers.forEach(function(layerId) {
      var colors = alphaColors(Color(assignVectorLayerColor(layerId)));

        circleLayers.push(circleLayer(colors.circle, sourceId, layerId));
        lineLayers.push(lineLayer(colors.line, sourceId, layerId));
        polyLayers.push(polygonLayer(colors.polygon, colors.polygonOutline, sourceId, layerId));
      })
    }
  });

  return polyLayers.concat(lineLayers).concat(circleLayers);
}

/**
 * Create inspection style out of the original style and the new colored layers
 * @param {Object} Original map styles
 * @param {array} Array of colored Mapbox GL layers
 * @return {Object} Colored inspect style
 */
function generateInspectStyle(originalMapStyle, coloredLayers, opts) {
  opts = Object.assign({
    backgroundColor: '#fff'
  }, opts);

  var backgroundLayer = {
    "id": "background",
    "type": "background",
    "paint": {
      "background-color": opts.backgroundColor,
    }
  };

  return Object.assign(originalMapStyle, {
    layers: [backgroundLayer].concat(coloredLayers)
  });
}

module.exports = {
  generateInspectStyle: generateInspectStyle,
  generateColoredLayers: generateColoredLayers
};
