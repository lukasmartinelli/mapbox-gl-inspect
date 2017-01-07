function container(child) {
  var container = document.createElement('div');
  container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
  container.appendChild(child);
  return container;
}

function button() {
  var btn = document.createElement('button');
  btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-inspect';
  btn.type = 'button';
  btn['aria-label'] = 'Inspect';
  return btn;
}

function InspectToggle(opts) {
  opts = Object.assign({
    onToggle: function () {}
  }, opts);

  this._btn = button();
  this._btn.onclick = opts.onToggle;
  this.elem = container(this._btn);
}

InspectToggle.prototype.setInspectIcon = function () {
  this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-inspect';
};

InspectToggle.prototype.setMapIcon = function () {
  this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-map';
};

module.exports = InspectToggle;
