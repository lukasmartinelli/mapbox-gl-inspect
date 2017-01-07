function properties(feature) {
  console.log('Render', feature)
  return Object.keys(feature.properties).map(propertyName => {
    var property = feature.properties[propertyName];
    return '<div><div>' + propertyName + '</div><div>' + JSON.stringify(property) + '</div></div>';
  }).join('');
}

function FeaturePopup(feature) {
  console.log(properties(feature))
  return '<div>' + properties(feature) + '</div>';
}

module.exports = FeaturePopup;
