function displayValue(value) {
  if (typeof value === 'undefined' || value === null) return value;
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === 'object' ||
          typeof value === 'number' ||
          typeof value === 'string') return value.toString();
  return value;
}

function renderProperty(propertyName, property) {
  return '<div class="mapbox-gl-inspect_property">' +
    '<div class="mapbox-gl-inspect_property-name">' + propertyName + '</div>' +
    '<div class="mapbox-gl-inspect_property-value">' + displayValue(property) + '</div>' +
    '</div>';
}

function renderLayer(layerId) {
  return '<div class="mapbox-gl-inspect_layer">' + layerId + '</div>';
}

function renderProperties(feature) {
  var sourceProperty = renderLayer(feature.layer['source-layer'] || feature.layer.source);
  var typeProperty = renderProperty('$type', feature.geometry.type);
  var properties = Object.keys(feature.properties).map(function (propertyName) {
    return renderProperty(propertyName, feature.properties[propertyName]);
  });
  return [sourceProperty, typeProperty].concat(properties).join('');
}

function renderFeatures(features) {
  return features.map(function (ft) {
    return '<div class="mapbox-gl-inspect_feature">' + renderProperties(ft) + '</div>';
  }).join('');
}

function renderPopup(features) {
  return '<div class="mapbox-gl-inspect_popup">' + renderFeatures(features) + '</div>';
}

module.exports = renderPopup;
