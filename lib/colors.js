var randomColor = require('randomcolor');

/**
 * Assign a color to a unique layer ID and also considering
 * common layer names such as water or wood.
 * @param {string} layerId
 * @return {string} Unique random for the layer ID
 */
function brightColor(layerId, alpha) {
  var luminosity = 'bright';
  var hue = null;

  if (/water|ocean|lake|sea|river/.test(layerId)) {
    hue = 'blue';
  }

  if (/state|country|place/.test(layerId)) {
    hue = 'pink';
  }

  if (/road|highway|transport/.test(layerId)) {
    hue = 'orange';
  }

  if (/contour|building/.test(layerId)) {
    hue = 'monochrome';
  }

  if (/building/.test(layerId)) {
    luminosity = 'dark';
  }

  if (/contour|landuse/.test(layerId)) {
    hue = 'yellow';
  }

  if (/wood|forest|park|landcover/.test(layerId)) {
    hue = 'green';
  }

  var rgb = randomColor({
    luminosity: luminosity,
    hue: hue,
    seed: layerId,
    format: 'rgbArray'
  });

  var rgba = rgb.concat([alpha || 1]);
  return 'rgba(' + rgba.join(', ') + ')';
}

exports.brightColor = brightColor;
