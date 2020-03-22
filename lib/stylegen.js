const KEY = "__mapbox-gl-inspect:";

function circleLayer(color, source, vectorLayer) {
  var layer = {
    id: [KEY, source, vectorLayer, 'circle'].join('_'),
    source: source,
    type: 'circle',
    paint: {
      'circle-color': color,
      'circle-radius': 2
    },
    filter: ['==', '$type', 'Point']
  };
  if (vectorLayer) {
    layer['source-layer'] = vectorLayer;
  }
  return layer;
}

function polygonLayer(color, outlineColor, source, vectorLayer) {
  var layer = {
    id: [KEY, source, vectorLayer, 'polygon'].join('_'),
    source: source,
    type: 'fill',
    paint: {
      'fill-color': color,
      'fill-antialias': true,
      'fill-outline-color': color
    },
    filter: ['==', '$type', 'Polygon']
  };
  if (vectorLayer) {
    layer['source-layer'] = vectorLayer;
  }
  return layer;
}

function lineLayer(color, source, vectorLayer) {
  var layer = {
    id: [KEY, source, vectorLayer, 'line'].join('_'),
    source: source,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    type: 'line',
    paint: {
      'line-color': color
    },
    filter: ['==', '$type', 'LineString']
  };
  if (vectorLayer) {
    layer['source-layer'] = vectorLayer;
  }
  return layer;
}

/**
 * Generate colored layer styles for the given sources
 * TODO: Improve docs
 * @param {Object} Sources dict containing the vector layer IDs
 * @param {Function} Function to generate a color for a layer
 * @return {array} Array of Mapbox GL layers
 */
function generateColoredLayers(sources, assignLayerColor) {
  var polyLayers = [];
  var circleLayers = [];
  var lineLayers = [];

  function alphaColors(layerId) {
    var color = assignLayerColor.bind(null, layerId);
    var obj = {
      circle: color(0.8),
      line: color(0.6),
      polygon: color(0.3),
      polygonOutline: color(0.6),
      default: color(1)
    };
    return obj;
  }

  Object.keys(sources).forEach(function (sourceId) {
    var layers = sources[sourceId];

    if (!layers || layers.length === 0) {
      var colors = alphaColors(sourceId);
      circleLayers.push(circleLayer(colors.circle, sourceId));
      lineLayers.push(lineLayer(colors.line, sourceId));
      polyLayers.push(polygonLayer(colors.polygon, colors.polygonOutline, sourceId));
    } else {
      layers.forEach(function (layerId) {
        var colors = alphaColors(layerId);

        circleLayers.push(circleLayer(colors.circle, sourceId, layerId));
        lineLayers.push(lineLayer(colors.line, sourceId, layerId));
        polyLayers.push(polygonLayer(colors.polygon, colors.polygonOutline, sourceId, layerId));
      });
    }
  });

  return polyLayers.concat(lineLayers).concat(circleLayers);
}

function generateNormalStyle(originalMapStyle, opts) {
  var invisibleLayers = [];

  var sources = {};
  Object.keys(originalMapStyle.sources).forEach(function (sourceId) {
    var source = originalMapStyle.sources[sourceId];
    if (
      ['video', 'image'].indexOf(source.type) > -1 &&
      source.coordinates.length === 4
    ) {
      var oc = source.coordinates;
      sources["__mapbox-gl-inspect:"+sourceId] = {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {
            // Store the original source for use by inspector
            "mapbox-gl-inspect:source": source
          },
          'geometry': {
            'type': 'Polygon',
            'coordinates': [
              [
                source.coordinates[0],
                source.coordinates[1],
                source.coordinates[2],
                source.coordinates[3],
                source.coordinates[0],
              ]
            ],
          }
        }
      };

      invisibleLayers.push({
        id: ["__mapbox-gl-inspect:", sourceId, 'polygon'].join('_'),
        source: "__mapbox-gl-inspect:"+sourceId,
        type: 'fill',
        paint: {
          'fill-color': "rgba(0,0,0,0)",
        },
        filter: ['==', '$type', 'Polygon']
      })
    }
  });

  return Object.assign({},
    originalMapStyle,
    {
      layers: invisibleLayers,
      sources: sources
    }
  );
}

/**
 * Create inspection style out of the original style and the new colored layera
 * @param {Object} Original map styles
 * @param {array} Array of colored Mapbox GL layers
 * @return {Object} Colored inspect style
 */
function generateInspectStyle(originalMapStyle, coloredLayers, opts) {
  opts = Object.assign({
    backgroundColor: '#fff'
  }, opts);

  var backgroundLayer = {
    'id': 'background',
    'type': 'background',
    'paint': {
      'background-color': opts.backgroundColor
    }
  };

  var sources = {};
  Object.keys(originalMapStyle.sources).forEach(function (sourceId) {
    var source = originalMapStyle.sources[sourceId];
    if (source.type === 'vector' || source.type === 'geojson') {
      sources[sourceId] = source;
    }
    if (
      ['video', 'image'].indexOf(source.type) > -1 &&
      source.coordinates.length === 4
    ) {
      var oc = source.coordinates;
      sources[sourceId] = {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {
            // Store the original source for use by inspector
            "mapbox-gl-inspect:source": source
          },
          'geometry': {
            'type': 'Polygon',
            'coordinates': [
              [
                source.coordinates[0],
                source.coordinates[1],
                source.coordinates[2],
                source.coordinates[3],
                source.coordinates[0],
              ]
            ],
          }
        }
      };
    }
  });

  return Object.assign(
    {},
    originalMapStyle,
    {
      layers: [backgroundLayer].concat(coloredLayers),
      sources: sources
    }
  );
}

exports.polygonLayer = polygonLayer;
exports.lineLayer = lineLayer;
exports.circleLayer = circleLayer;
exports.generateInspectStyle = generateInspectStyle;
exports.generateColoredLayers = generateColoredLayers;
exports.generateNormalStyle = generateNormalStyle;
