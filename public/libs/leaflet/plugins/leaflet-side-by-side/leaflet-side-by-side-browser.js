(function (L) {
  'use strict';

  var isDragging = false;
  var mapWasDragEnabled;
  var mapWasTapEnabled;

  function cancelMapDrag() {
    if (!this._map) return;
    mapWasDragEnabled = this._map.dragging.enabled();
    mapWasTapEnabled = this._map.tap && this._map.tap.enabled();
    this._map.dragging.disable();
    this._map.tap && this._map.tap.disable();
  }

  function uncancelMapDrag(e) {
    if (!this._map) return;
    this._refocusOnMap && this._refocusOnMap(e);
    if (mapWasDragEnabled) {
      this._map.dragging.enable();
    }
    if (mapWasTapEnabled) {
      this._map.tap.enable();
    }
  }

  function asArray(arg) {
    return (arg === 'undefined') ? [] : Array.isArray(arg) ? arg : [arg];
  }

  function noop() {}

  L.Control.SideBySide = L.Control.extend({
    options: {
      thumbSize: 42,
      padding: 0
    },

    initialize: function(leftLayers, rightLayers, options) {
      this.setLeftLayers(leftLayers);
      this.setRightLayers(rightLayers);
      L.setOptions(this, options);
    },

    getPosition: function() {
      var rangeValue = this._range.value;
      var offset = (0.5 - rangeValue) * (2 * this.options.padding + this.options.thumbSize);
      return this._map.getSize().x * rangeValue + offset;
    },

    setPosition: noop,

    includes: L.Evented.prototype || L.Mixin.Events,

    addTo: function(map) {
      this.remove();
      this._map = map;

      var container = this._container = L.DomUtil.create('div', 'leaflet-sbs', map._controlContainer);

      this._divider = L.DomUtil.create('div', 'leaflet-sbs-divider', container);
      this._dividerHandle = L.DomUtil.create('div', 'leaflet-sbs-divider-handle', this._divider);

      var range = this._range = L.DomUtil.create('input', 'leaflet-sbs-range', container);
      range.type = 'range';
      range.min = 0;
      range.max = 1;
      range.step = 'any';
      range.value = 0.5;
      range.style.paddingLeft = range.style.paddingRight = this.options.padding + 'px';

      this._dragOverlay = L.DomUtil.create('div', 'leaflet-sbs-overlay', map._controlContainer);

      this._addEvents();
      this._updateLayers();
      return this;
    },

    remove: function() {
      if (!this._map) {
        return this;
      }
      if (this._leftLayer) {
        this._leftLayer.getContainer().style.clip = '';
      }
      if (this._rightLayer) {
        this._rightLayer.getContainer().style.clip = '';
      }
      this._removeEvents();
      L.DomUtil.remove(this._container);

      this._map = null;

      return this;
    },

    setLeftLayers: function(leftLayers) {
      this._leftLayers = asArray(leftLayers);
      this._updateLayers();
      return this;
    },

    setRightLayers: function(rightLayers) {
      this._rightLayers = asArray(rightLayers);
      this._updateLayers();
      return this;
    },

    _updateClip: function() {
      var map = this._map;
      if (!map) return;

      var nw = map.containerPointToLayerPoint([0, 0]);
      var se = map.containerPointToLayerPoint(map.getSize());
      var clipX = nw.x + this.getPosition();
      var dividerX = this.getPosition();

      this._divider.style.left = dividerX + 'px';
      this.fire('dividermove', {x: dividerX});

      var clipLeft = 'rect(' + [nw.y, clipX, se.y, nw.x].join('px,') + 'px)';
      var clipRight = 'rect(' + [nw.y, se.x, se.y, clipX].join('px,') + 'px)';

      if (this._leftLayer) {
        this._leftLayer.getContainer().style.clip = clipLeft;
      }
      if (this._rightLayer) {
        this._rightLayer.getContainer().style.clip = clipRight;
      }
    },

    _updateLayers: function() {
      if (!this._map) {
        return this;
      }
      var prevLeft = this._leftLayer;
      var prevRight = this._rightLayer;
      this._leftLayer = this._rightLayer = null;
      this._leftLayers.forEach(function(layer) {
        if (this._map.hasLayer(layer)) {
          this._leftLayer = layer;
        }
      }, this);
      this._rightLayers.forEach(function(layer) {
        if (this._map.hasLayer(layer)) {
          this._rightLayer = layer;
        }
      }, this);
      if (prevLeft !== this._leftLayer) {
        prevLeft && this.fire('leftlayerremove', {layer: prevLeft});
        this._leftLayer && this.fire('leftlayeradd', {layer: this._leftLayer});
      }
      if (prevRight !== this._rightLayer) {
        prevRight && this.fire('rightlayerremove', {layer: prevRight});
        this._rightLayer && this.fire('rightlayeradd', {layer: this._rightLayer});
      }
      this._updateClip();
    },

    _onDividerMouseDown: function(e) {
      L.DomEvent.stop(e);
      L.DomEvent.preventDefault(e);

      isDragging = true;
      cancelMapDrag.call(this);

      this._dragOverlay.style.display = 'block';

      this._addDragEvents();
    },

    _addDragEvents: function() {
      L.DomEvent.on(this._dragOverlay, 'mousemove', this._onMouseMove, this);
      L.DomEvent.on(this._dragOverlay, 'mouseup', this._onMouseUp, this);
      L.DomEvent.on(this._dragOverlay, 'touchmove', this._onMouseMove, this);
      L.DomEvent.on(this._dragOverlay, 'touchend', this._onMouseUp, this);
    },

    _removeDragEvents: function() {
      L.DomEvent.off(this._dragOverlay, 'mousemove', this._onMouseMove, this);
      L.DomEvent.off(this._dragOverlay, 'touchmove', this._onMouseMove, this);
      L.DomEvent.off(this._dragOverlay, 'mouseup', this._onMouseUp, this);
      L.DomEvent.off(this._dragOverlay, 'touchend', this._onMouseUp, this);
    },

    _onMouseMove: function(e) {
      if (!isDragging || !this._map || !this._range) return;

      var containerPoint = L.DomEvent.getMousePosition(e, this._map.getContainer());
      var containerWidth = this._map.getSize().x;

      var newValue = containerPoint.x / containerWidth;
      newValue = Math.max(0, Math.min(1, newValue));

      this._range.value = newValue;
      this._updateClip();
    },

    _onMouseUp: function(e) {
      if (!isDragging) return;

      isDragging = false;
      this._dragOverlay.style.display = 'none';
      this._removeDragEvents();
      uncancelMapDrag.call(this, e);
    },

    _addEvents: function() {
      var range = this._range;
      var map = this._map;
      if (!map || !range) return;

      map.on('move', this._updateClip, this);
      map.on('layeradd layerremove', this._updateLayers, this);

      var rangeEvent = 'oninput' in range ? 'input' : 'change';
      L.DomEvent.on(range, rangeEvent, this._updateClip, this);
      L.DomEvent.on(this._divider, 'mousedown', this._onDividerMouseDown, this);
      L.DomEvent.on(this._divider, 'touchstart', this._onDividerMouseDown, this);
      L.DomEvent.on(this._dividerHandle, 'mousedown', this._onDividerMouseDown, this);
      L.DomEvent.on(this._dividerHandle, 'touchstart', this._onDividerMouseDown, this);
    },

    _removeEvents: function() {
      var range = this._range;
      var map = this._map;

      this._removeDragEvents();

      if (range) {
        var rangeEvent = 'oninput' in range ? 'input' : 'change';
        L.DomEvent.off(range, rangeEvent, this._updateClip, this);
      }
      if (this._divider) {
        L.DomEvent.off(this._divider, 'mousedown', this._onDividerMouseDown, this);
        L.DomEvent.off(this._divider, 'touchstart', this._onDividerMouseDown, this);
      }
      if (this._dividerHandle) {
        L.DomEvent.off(this._dividerHandle, 'mousedown', this._onDividerMouseDown, this);
        L.DomEvent.off(this._dividerHandle, 'touchstart', this._onDividerMouseDown, this);
      }
      if (map) {
        map.off('layeradd layerremove', this._updateLayers, this);
        map.off('move', this._updateClip, this);
      }
    }
  });

  L.control.sideBySide = function(leftLayers, rightLayers, options) {
    return new L.Control.SideBySide(leftLayers, rightLayers, options);
  };

  var css = '.leaflet-sbs {' +
    'position: absolute;' +
    'top: 0;' +
    'left: 0;' +
    'width: 100%;' +
    'height: 100%;' +
    'z-index: 500;' +
    'pointer-events: none;' +
    '}' +
    '.leaflet-sbs-range {' +
    'position: absolute;' +
    'top: 50%;' +
    'width: 100%;' +
    'height: 100%;' +
    'margin: 0;' +
    'padding: 0;' +
    'background: transparent;' +
    '-webkit-appearance: none;' +
    'appearance: none;' +
    'pointer-events: none;' +
    'z-index: 10;' +
    'opacity: 0;' +
    '}' +
    '.leaflet-sbs-divider {' +
    'position: absolute;' +
    'top: 0;' +
    'bottom: 0;' +
    'width: 4px;' +
    'margin-left: -2px;' +
    'background: #fff;' +
    'box-shadow: 0 0 8px rgba(0,0,0,0.4);' +
    'cursor: ew-resize;' +
    'pointer-events: auto;' +
    'z-index: 999;' +
    '}' +
    '.leaflet-sbs-divider-handle {' +
    'position: absolute;' +
    'top: 50%;' +
    'left: 50%;' +
    'transform: translate(-50%, -50%);' +
    'width: 40px;' +
    'height: 40px;' +
    'background: #fff;' +
    'border-radius: 50%;' +
    'box-shadow: 0 2px 8px rgba(0,0,0,0.3);' +
    'cursor: ew-resize;' +
    'pointer-events: auto;' +
    'z-index: 1000;' +
    '}' +
    '.leaflet-sbs-divider-handle::after {' +
    'content: "";' +
    'position: absolute;' +
    'top: 50%;' +
    'left: 50%;' +
    'transform: translate(-50%, -50%);' +
    'width: 16px;' +
    'height: 18px;' +
    'background: linear-gradient(to right, #999 0%, #999 12%, transparent 12%, transparent 40%, #666 40%, #666 60%, transparent 60%, transparent 88%, #999 88%, #999 100%);' +
    '}' +
    '.leaflet-sbs-overlay {' +
    'position: absolute;' +
    'top: 0;' +
    'left: 0;' +
    'width: 100%;' +
    'height: 100%;' +
    'background: transparent;' +
    'cursor: ew-resize;' +
    'pointer-events: auto;' +
    'z-index: 800;' +
    'display: none;' +
    '}';

  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = css;
  document.getElementsByTagName('head')[0].appendChild(style);

})(L);