var InspectIcon = require('./inspecticon');
var MapIcon = require('./mapicon');

function container(child) {
  var container = document.createElement('div');
  container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
  container.appendChild(child)
  return container
}

function button() {
  var btn = document.createElement("button");
  btn.className = "mapboxgl-ctrl-icon mapboxgl-ctrl-inspector";
  btn.type = 'button';
  btn['aria-label'] = 'Inspect';
  return btn;
}

function InspectToggle(opts) {
  opts = Object.assign({
    onToggle: function() {}
  }, opts);

  this._btn = button();
  this._btn.onclick = opts.onToggle;
  this.elem = container(this._btn)
}

InspectToggle.prototype.setInspectIcon = function() {
  this._btn.style['background-image'] = 'url(data:image/svg+xml;charset=utf8,' + encodeURI(InspectIcon) + ')';
};

InspectToggle.prototype.setMapIcon= function() {
  this._btn.style['background-image'] = 'url(data:image/svg+xml;charset=utf8,' + encodeURI(MapIcon) + ')';
};

module.exports = InspectToggle
