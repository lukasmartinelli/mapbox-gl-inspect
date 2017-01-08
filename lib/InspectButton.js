function container(child, show) {
  var container = document.createElement('div');
  container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
  container.appendChild(child);
  if (!show) {
    container.style.display = 'none';
  }
  return container;
}

function button() {
  var btn = document.createElement('button');
  btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-inspect';
  btn.type = 'button';
  btn['aria-label'] = 'Inspect';
  return btn;
}

function InspectButton(options) {
  options = Object.assign({
    show: true,
    onToggle: function () {}
  }, options);

  this._btn = button();
  this._btn.onclick = options.onToggle;
  this.elem = container(this._btn, options.show);
}

InspectButton.prototype.setInspectIcon = function () {
  this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-inspect';
};

InspectButton.prototype.setMapIcon = function () {
  this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-map';
};

module.exports = InspectButton;
