/**
 * Leaflet Measure Control Plugin
 * 用于在 Leaflet 地图上进行距离和面积测量
 */
L.Measure = L.Control.extend({
    options: {
        position: 'topright',
        mode: 'distance',
        unit: 'metric',
        styles: {
            strokeColor: '#006eff',
            strokeWeight: 3,
            fillColor: '#ff7800',
            fillOpacity: 0.2,
            pointRadius: 6,
            previewStrokeColor: '#00ccff',
            previewStrokeWeight: 2,
            areaPreviewStrokeColor: '#ff7800'
        },
        textStyles: {
            distanceLabel: '📏 距离',
            areaLabel: '⬡ 面积',
            startBtn: '🎯 开始测量',
            endBtn: '✔ 结束测量',
            cancelBtn: '✖ 取消测量',
            clearBtn: '🗑️ 清除'
        }
    },

    initialize: function(options) {
        L.Control.prototype.initialize.call(this, options);
        this._isMeasuring = false;
        this._points = [];
        this._tempLayers = [];
        this._measureHistory = [];
        this._clickTimeout = null;
        this._lastClickLatLng = null;
        this._map = null;
    },

    onAdd: function(map) {
        this._map = map;
        this._container = L.DomUtil.create('div', 'leaflet-measure-control');

        this._createControlPanel();

        L.DomEvent.disableClickPropagation(this._container);
        return this._container;
    },

    onRemove: function(map) {
        this._cleanup();
        return this._container;
    },

    _createControlPanel: function() {
        var options = this.options;
        var textStyles = options.textStyles;

        var panelTitle = L.DomUtil.create('div', 'measure-panel-title', this._container);
        panelTitle.innerHTML = '📏 测量工具';

        var modeSwitch = L.DomUtil.create('div', 'measure-mode-switch', this._container);
        this._modeDistanceBtn = L.DomUtil.create('button', 'measure-mode-btn', modeSwitch);
        this._modeDistanceBtn.innerHTML = '📍 距离';
        this._modeDistanceBtn.classList.add('active');

        this._modeAreaBtn = L.DomUtil.create('button', 'measure-mode-btn', modeSwitch);
        this._modeAreaBtn.innerHTML = '⬡ 面积';

        this._toggleBtn = L.DomUtil.create('button', 'measure-ctrl-btn', this._container);
        this._toggleBtn.innerHTML = textStyles.startBtn;

        this._cancelBtn = L.DomUtil.create('button', 'measure-ctrl-btn', this._container);
        this._cancelBtn.innerHTML = textStyles.cancelBtn;
        this._cancelBtn.style.display = 'none';

        this._clearBtn = L.DomUtil.create('button', 'measure-ctrl-btn', this._container);
        this._clearBtn.innerHTML = textStyles.clearBtn;
        this._clearBtn.style.display = 'none';

        this._resultDiv = L.DomUtil.create('div', 'measure-result', this._container);
        this._resultDiv.style.display = 'none';

        this._resultLabel = L.DomUtil.create('div', '', this._resultDiv);
        this._resultLabel.innerHTML = '📏 距离:';

        this._resultValue = L.DomUtil.create('div', '', this._resultDiv);
        this._resultValue.innerHTML = '<span>--</span>';

        this._historyDiv = L.DomUtil.create('div', 'measure-history', this._container);
        this._historyDiv.innerHTML = '<div class="measure-no-history">暂无测量记录</div>';

        this._infoDiv = L.DomUtil.create('div', 'leaflet-measure-info');
        this._infoText = L.DomUtil.create('div', '', this._infoDiv);
        this._infoText.innerHTML = '📏 距离和面积测量工具';

        this._bindEvents();
    },

    _bindEvents: function() {
        var self = this;

        L.DomEvent.on(this._modeDistanceBtn, 'click', function() {
            self.setMode('distance');
        });

        L.DomEvent.on(this._modeAreaBtn, 'click', function() {
            self.setMode('area');
        });

        L.DomEvent.on(this._toggleBtn, 'click', function() {
            if (self._isMeasuring) {
                self.finishMeasuring(false, null);
            } else {
                self.startMeasuring();
            }
        });

        L.DomEvent.on(this._cancelBtn, 'click', function() {
            self.cancelMeasuring();
        });

        L.DomEvent.on(this._clearBtn, 'click', function() {
            self.clearAllResults();
        });
    },

    setMode: function(mode) {
        if (this._isMeasuring) return;

        this.options.mode = mode;
        if (mode === 'distance') {
            this._modeDistanceBtn.classList.add('active');
            this._modeAreaBtn.classList.remove('active');
            this._resultLabel.innerHTML = '📏 距离:';
            this._infoText.innerHTML = '📏 距离测量模式';
        } else {
            this._modeAreaBtn.classList.add('active');
            this._modeDistanceBtn.classList.remove('active');
            this._resultLabel.innerHTML = '⬡ 面积:';
            this._infoText.innerHTML = '⬡ 面积测量模式';
        }
    },

    startMeasuring: function() {
        this._isMeasuring = true;
        this._points = [];
        this._tempLayers = [];
        this._map.getContainer().style.cursor = 'crosshair';

        this._map.on('mousemove', this._onMouseMove, this);
        this._map.on('click', this._onMapClick, this);
        this._map.on('dblclick', this._onDoubleClick, this);
        this._map.doubleClickZoom.disable();

        this._toggleBtn.innerHTML = this.options.textStyles.endBtn;
        this._cancelBtn.style.display = 'block';
        this._resultDiv.style.display = 'block';
        this._resultValue.innerHTML = '<span>--</span>';

        if (this._map.hasLayer(this._infoDiv)) {
            this._map.removeLayer(this._infoDiv);
        }
        this._infoDiv.addTo(this._map);

        var mode = this.options.mode;
        this._resultLabel.innerHTML = mode === 'distance' ? '📏 距离:' : '⬡ 面积:';
        this._infoText.innerHTML = mode === 'distance' ? '📏 距离测量 - 点击添加点' : '⬡ 面积测量 - 点击添加点';

        this.fire('measure:start', { mode: mode });
    },

    stopMeasuring: function() {
        this._isMeasuring = false;
        this._lastClickLatLng = null;
        this._map.getContainer().style.cursor = '';
        this._map.off('mousemove', this._onMouseMove, this);
        this._map.off('click', this._onMapClick, this);
        this._map.off('dblclick', this._onDoubleClick, this);
        this._map.doubleClickZoom.enable();
        this._clearTempLayers();
    },

    finishMeasuring: function(addLastPoint, lastPoint) {
        var mode = this.options.mode;
        var pointCount = addLastPoint ? this._points.length + 1 : this._points.length;
        var isValid = (mode === 'distance' && pointCount >= 2) || (mode === 'area' && pointCount >= 3);

        if (isValid) {
            if (addLastPoint && lastPoint) {
                this._points.push(lastPoint);
            }

            var result = this._calculateResult();
            this._clearTempLayers();

            var finalGeometries = [];
            var styles = this.options.styles;

            var self = this;
            this._points.forEach(function(pt) {
                var marker = L.circleMarker(pt, {
                    radius: styles.pointRadius,
                    color: styles.strokeColor,
                    fillColor: styles.strokeColor,
                    fillOpacity: 1
                }).addTo(self._map);
                finalGeometries.push(marker);
            });

            if (mode === 'distance') {
                var polyline = L.polyline(this._points.slice(), {
                    color: styles.strokeColor,
                    weight: styles.strokeWeight
                }).addTo(this._map);
                finalGeometries.push(polyline);
            } else {
                var polygon = L.polygon(this._points.slice(), {
                    color: styles.fillColor,
                    fillColor: styles.fillColor,
                    fillOpacity: styles.fillOpacity
                }).addTo(this._map);
                finalGeometries.push(polygon);
            }

            this._measureHistory.push({
                type: mode,
                unit: this.options.unit,
                points: this._points.slice(),
                geometries: finalGeometries,
                result: result
            });

            this._tempLayers = [];
            this._points = [];
            this.stopMeasuring();

            this._toggleBtn.innerHTML = this.options.textStyles.startBtn;
            this._cancelBtn.style.display = 'none';
            this._clearBtn.style.display = 'block';
            this._updateHistoryDisplay();
            this._resultLabel.innerHTML = mode === 'distance' ? '📏 距离:' : '⬡ 面积:';
            this._resultValue.innerHTML = '<span>' + this._formatResult(result) + '</span>';

            this.fire('measure:end', {
                type: mode,
                result: result,
                points: this._points.slice(),
                geometries: finalGeometries
            });
        } else {
            this.cancelMeasuring();
        }
    },

    cancelMeasuring: function() {
        this._isMeasuring = false;
        this._lastClickLatLng = null;
        this._map.getContainer().style.cursor = '';
        this._map.off('mousemove', this._onMouseMove, this);
        this._map.off('click', this._onMapClick, this);
        this._map.off('dblclick', this._onDoubleClick, this);
        this._map.doubleClickZoom.enable();
        this._clearTempLayers();
        this._tempLayers = [];
        this._points = [];

        this._toggleBtn.innerHTML = this.options.textStyles.startBtn;
        this._cancelBtn.style.display = 'none';
        this._resultDiv.style.display = 'none';
        this._infoText.innerHTML = this.options.mode === 'distance' ? '📏 距离测量模式' : '⬡ 面积测量模式';

        this.fire('measure:cancel');
    },

    clearAllResults: function() {
        var self = this;
        this._measureHistory.forEach(function(measurement) {
            measurement.geometries.forEach(function(layer) {
                if (self._map.hasLayer(layer)) {
                    self._map.removeLayer(layer);
                }
            });
        });
        this._measureHistory = [];
        this._updateHistoryDisplay();
        this._clearBtn.style.display = 'none';
        this._resultDiv.style.display = 'none';
        this._infoText.innerHTML = this.options.mode === 'distance' ? '📏 距离和面积测量工具' : '⬡ 面积测量模式';

        this.fire('measure:clear');
    },

    getHistory: function() {
        return this._measureHistory;
    },

    _cleanup: function() {
        if (this._isMeasuring) {
            this.cancelMeasuring();
        }
        if (this._map && this._map.hasLayer(this._infoDiv)) {
            this._map.removeLayer(this._infoDiv);
        }
    },

    _isSamePosition: function(latLng1, latLng2) {
        if (!latLng1 || !latLng2) return false;
        return latLng1.distanceTo(latLng2) < 5;
    },

    _addPoint: function(latLng) {
        this._points.push(latLng);
        var styles = this.options.styles;
        var marker = L.circleMarker(latLng, {
            radius: styles.pointRadius,
            color: styles.strokeColor,
            fillColor: styles.strokeColor,
            fillOpacity: 1
        }).addTo(this._map);
        this._tempLayers.push(marker);
        this._updateTempLayers();
        this._updatePreviewResults();
    },

    _onMapClick: function(e) {
        var self = this;

        if (this._clickTimeout && this._lastClickLatLng) {
            if (this._isSamePosition(this._lastClickLatLng, e.latlng)) {
                clearTimeout(this._clickTimeout);
                this._clickTimeout = null;
                this._lastClickLatLng = null;
            } else {
                clearTimeout(this._clickTimeout);
                this._addPoint(this._lastClickLatLng);
                this._lastClickLatLng = e.latlng;
                this._clickTimeout = setTimeout(function() {
                    self._addPoint(e.latlng);
                    self._lastClickLatLng = null;
                    self._clickTimeout = null;
                }, 150);
            }
        } else {
            this._lastClickLatLng = e.latlng;
            this._clickTimeout = setTimeout(function() {
                self._addPoint(e.latlng);
                self._lastClickLatLng = null;
                self._clickTimeout = null;
            }, 150);
        }
    },

    _onMouseMove: function(e) {
        if (this._points.length > 0) {
            var lastPoint = this._points[this._points.length - 1];
            var styles = this.options.styles;
            this._clearTempLayers();

            for (var i = 0; i < this._points.length; i++) {
                var marker = L.circleMarker(this._points[i], {
                    radius: styles.pointRadius,
                    color: styles.strokeColor,
                    fillColor: styles.strokeColor,
                    fillOpacity: 1
                }).addTo(this._map);
                this._tempLayers.push(marker);
            }

            var previewLine = L.polyline([lastPoint, e.latlng], {
                color: styles.previewStrokeColor,
                weight: styles.previewStrokeWeight,
                dashArray: '5, 5',
                opacity: 0.8
            }).addTo(this._map);
            this._tempLayers.push(previewLine);

            var previewMarker = L.circleMarker(e.latlng, {
                radius: 4,
                color: styles.previewStrokeColor,
                fillColor: styles.previewStrokeColor,
                fillOpacity: 0.8
            }).addTo(this._map);
            this._tempLayers.push(previewMarker);

            if (this.options.mode === 'area' && this._points.length > 0) {
                var previewLine2 = L.polyline([this._points[0], e.latlng], {
                    color: styles.areaPreviewStrokeColor,
                    weight: styles.previewStrokeWeight,
                    dashArray: '5, 5',
                    opacity: 0.6
                }).addTo(this._map);
                this._tempLayers.push(previewLine2);
            }

            if (this._points.length > 1) {
                var polyline = L.polyline(this._points.slice(), {
                    color: styles.strokeColor,
                    weight: styles.strokeWeight
                }).addTo(this._map);
                this._tempLayers.push(polyline);
            }
        }
    },

    _onDoubleClick: function(e) {
        if (this._isMeasuring) {
            L.DomEvent.stopPropagation(e);
            if (this._clickTimeout) {
                clearTimeout(this._clickTimeout);
                this._clickTimeout = null;
            }
            this._lastClickLatLng = null;
            this.finishMeasuring(true, e.latlng);
        }
    },

    _calculateResult: function() {
        if (this.options.mode === 'distance') {
            var distance = 0;
            for (var i = 1; i < this._points.length; i++) {
                distance += this._points[i].distanceTo(this._points[i - 1]);
            }
            return distance;
        } else {
            return this._geodesicArea(this._points);
        }
    },

    _formatResult: function(value) {
        var unit = this.options.unit;
        if (this.options.mode === 'distance') {
            switch (unit) {
                case 'km':
                    return value > 1000 ? (value / 1000).toFixed(2) + ' km' : value.toFixed(2) + ' m';
                case 'ft':
                    return (value * 3.28084).toFixed(2) + ' ft';
                case 'nm':
                    return (value * 0.000539957).toFixed(2) + ' nm';
                default:
                    return value > 1000 ? (value / 1000).toFixed(2) + ' km' : value.toFixed(2) + ' m';
            }
        } else {
            switch (unit) {
                case 'km2':
                    return value > 1000000 ? (value / 1000000).toFixed(2) + ' km²' : value.toFixed(2) + ' m²';
                case 'ha':
                    return (value / 10000).toFixed(2) + ' ha';
                case 'ac':
                    return (value * 0.000247105).toFixed(2) + ' ac';
                default:
                    return value > 1000000 ? (value / 1000000).toFixed(2) + ' km²' : value.toFixed(2) + ' m²';
            }
        }
    },

    _updateTempLayers: function() {
        this._clearTempLayers();
        var styles = this.options.styles;
        var self = this;
        this._points.forEach(function(pt) {
            var marker = L.circleMarker(pt, {
                radius: styles.pointRadius,
                color: styles.strokeColor,
                fillColor: styles.strokeColor,
                fillOpacity: 1
            }).addTo(self._map);
            self._tempLayers.push(marker);
        });
        if (this._points.length > 1) {
            var polyline = L.polyline(this._points.slice(), {
                color: styles.strokeColor,
                weight: styles.strokeWeight
            }).addTo(this._map);
            this._tempLayers.push(polyline);
        }
    },

    _clearTempLayers: function() {
        var self = this;
        this._tempLayers.forEach(function(layer) {
            if (self._map.hasLayer(layer)) {
                self._map.removeLayer(layer);
            }
        });
        this._tempLayers = [];
    },

    _updatePreviewResults: function() {
        var length = 0;
        var area = 0;
        if (this._points.length > 1) {
            for (var i = 1; i < this._points.length; i++) {
                length += this._points[i].distanceTo(this._points[i - 1]);
            }
        }
        if (this._points.length > 2) {
            area = this._geodesicArea(this._points);
        }
        this._resultLabel.innerHTML = this.options.mode === 'distance' ? '📏 距离:' : '⬡ 面积:';
        if (this.options.mode === 'distance') {
            this._resultValue.innerHTML = '<span>' + (length > 1000 ? (length / 1000).toFixed(2) + ' km' : length.toFixed(2) + ' m') + '</span>';
        } else {
            this._resultValue.innerHTML = '<span>' + (area > 1000000 ? (area / 1000000).toFixed(2) + ' km²' : area.toFixed(2) + ' m²') + '</span>';
        }
    },

    _updateHistoryDisplay: function() {
        if (this._measureHistory.length === 0) {
            this._historyDiv.innerHTML = '<div class="measure-no-history">暂无测量记录</div>';
        } else {
            var html = '';
            this._measureHistory.forEach(function(m) {
                html += '<div class="measure-history-item">';
                html += '<span>' + (m.type === 'distance' ? '📏' : '⬡') + '</span>';
                html += '<span>' + m.points.length + '点</span>';
                html += '<span>' + m.result.toFixed(2) + '</span>';
                html += '</div>';
            });
            this._historyDiv.innerHTML = html;
        }
    },

    _geodesicArea: function(latlngs) {
        var earthRadius = 6371000;
        var total = 0;
        var len = latlngs.length;
        if (len > 2) {
            for (var i = 0; i < len; i++) {
                var p1 = latlngs[i];
                var p2 = latlngs[(i + 1) % len];
                var lat1 = p1.lat * Math.PI / 180;
                var lat2 = p2.lat * Math.PI / 180;
                var lon1 = p1.lng * Math.PI / 180;
                var lon2 = p2.lng * Math.PI / 180;
                total += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
            }
            total = Math.abs(total * earthRadius * earthRadius / 2);
        }
        return total;
    }
});

L.Measure.include(L.Mixin.Events);

L.measure = function(options) {
    return new L.Measure(options);
};

L.Control.Measure = L.Measure;

L.Map.addInitHook(function() {
    if (this.options.measureControl) {
        this.measureControl = L.measure(this.options.measureControl);
        this.addControl(this.measureControl);
    }
});

L.Map.mergeOptions({
    measureControl: false
});
