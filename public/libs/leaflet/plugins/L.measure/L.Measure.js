/**
 * Leaflet Measure Control Plugin
 * 用于在 Leaflet 地图上进行距离和面积测量
 * 支持可选UI和无UI模式
 */
L.Measure = L.Control.extend({
    options: {
        position: 'topright',
        mode: 'distance',
        showUI: false,
        unit: 'm',
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
        language: {
            distanceLabel: '📏 距离',
            areaLabel: '⬡ 面积',
            startBtn: '🎯 开始测量',
            endBtn: '✔ 结束测量',
            cancelBtn: '✖ 取消测量',
            clearBtn: '🗑️ 清除',
            panelTitle: '📏 测量工具',
            noHistory: '暂无测量记录',
            modeDistance: '📍 距离',
            modeArea: '⬡ 面积',
            infoDefault: '📏 距离和面积测量工具',
            infoDistance: '📏 距离测量 - 点击添加点',
            infoArea: '⬡ 面积测量 - 点击添加点'
        }
    },

    initialize: function(mode, options) {
        if (typeof mode === 'object') {
            options = mode;
            mode = 'distance';
        }
        var finalOptions = options || {};
        finalOptions.mode = mode || 'distance';

        L.Control.prototype.initialize.call(this, finalOptions);

        // 添加 L.Evented 的功能
        if (!this._eventHandlers) {
            this._eventHandlers = {};
        }

        this._isMeasuring = false;
        this._points = [];
        this._tempLayers = [];
        this._measureHistory = [];
        this._clickTimeout = null;
        this._lastClickLatLng = null;
        this._lastMouseLatLng = null;
        this._resultLabelOnMap = null;
        this._currentResultLabel = null; // 当前正在测量的临时 label
        this._map = null;
        this._container = null;
        this._modeDistanceBtn = null;
        this._modeAreaBtn = null;
        this._toggleBtn = null;
        this._cancelBtn = null;
        this._clearBtn = null;
        this._resultDiv = null;
        this._resultLabel = null;
        this._resultValue = null;
        this._historyDiv = null;
        this._infoDiv = null;
    },

    // 添加 L.Evented 的方法
    on: function(type, fn, context) {
        if (!this._eventHandlers[type]) {
            this._eventHandlers[type] = [];
        }
        this._eventHandlers[type].push({ fn: fn, context: context || this });
        return this;
    },

    off: function(type, fn) {
        if (type === undefined) {
            this._eventHandlers = {};
        } else if (fn === undefined) {
            this._eventHandlers[type] = [];
        } else {
            var handlers = this._eventHandlers[type];
            if (handlers) {
                for (var i = 0; i < handlers.length; i++) {
                    if (handlers[i].fn === fn) {
                        handlers.splice(i, 1);
                        i--;
                    }
                }
            }
        }
        return this;
    },

    fire: function(type, data) {
        var handlers = this._eventHandlers[type];
        if (handlers) {
            for (var i = 0; i < handlers.length; i++) {
                handlers[i].fn.call(handlers[i].context, data || {});
            }
        }
        return this;
    },

    onAdd: function(map) {
        this._map = map;

        if (!this.options.showUI) {
            this._container = L.DomUtil.create('div', 'leaflet-measure-control');
            this._container.style.display = 'none';
            return this._container;
        }

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
        var lang = this.options.language;

        var panelTitle = L.DomUtil.create('div', 'measure-panel-title', this._container);
        panelTitle.innerHTML = lang.panelTitle;

        var modeSwitch = L.DomUtil.create('div', 'measure-mode-switch', this._container);
        this._modeDistanceBtn = L.DomUtil.create('button', 'measure-mode-btn', modeSwitch);
        this._modeDistanceBtn.innerHTML = lang.modeDistance;
        if (this.options.mode === 'distance') {
            this._modeDistanceBtn.classList.add('active');
        }

        this._modeAreaBtn = L.DomUtil.create('button', 'measure-mode-btn', modeSwitch);
        this._modeAreaBtn.innerHTML = lang.modeArea;
        if (this.options.mode === 'area') {
            this._modeAreaBtn.classList.add('active');
        }

        this._toggleBtn = L.DomUtil.create('button', 'measure-ctrl-btn', this._container);
        this._toggleBtn.innerHTML = lang.startBtn;

        this._cancelBtn = L.DomUtil.create('button', 'measure-ctrl-btn', this._container);
        this._cancelBtn.innerHTML = lang.cancelBtn;
        this._cancelBtn.style.display = 'none';

        this._clearBtn = L.DomUtil.create('button', 'measure-ctrl-btn', this._container);
        this._clearBtn.innerHTML = lang.clearBtn;
        this._clearBtn.style.display = 'none';

        this._resultDiv = L.DomUtil.create('div', 'measure-result', this._container);
        this._resultDiv.style.display = 'none';

        this._resultLabel = L.DomUtil.create('div', '', this._resultDiv);
        this._resultLabel.innerHTML = this.options.mode === 'distance' ? lang.distanceLabel + ':' : lang.areaLabel + ':';

        this._resultValue = L.DomUtil.create('div', '', this._resultDiv);
        this._resultValue.innerHTML = '<span>--</span>';

        this._historyDiv = L.DomUtil.create('div', 'measure-history', this._container);
        this._historyDiv.innerHTML = '<div class="measure-no-history">' + lang.noHistory + '</div>';

        this._infoDiv = L.DomUtil.create('div', 'leaflet-measure-info');
        var infoText = L.DomUtil.create('div', '', this._infoDiv);
        infoText.innerHTML = lang.infoDefault;

        this._bindEvents();
    },

    _bindEvents: function() {
        var self = this;

        if (this._modeDistanceBtn) {
            L.DomEvent.on(this._modeDistanceBtn, 'click', function() {
                self.setMode('distance');
            });
        }

        if (this._modeAreaBtn) {
            L.DomEvent.on(this._modeAreaBtn, 'click', function() {
                self.setMode('area');
            });
        }

        if (this._toggleBtn) {
            L.DomEvent.on(this._toggleBtn, 'click', function() {
                if (self._isMeasuring) {
                    self.finishMeasuring(false, null);
                } else {
                    self.startMeasuring();
                }
            });
        }

        if (this._cancelBtn) {
            L.DomEvent.on(this._cancelBtn, 'click', function() {
                self.cancelMeasuring();
            });
        }

        if (this._clearBtn) {
            L.DomEvent.on(this._clearBtn, 'click', function() {
                self.clearAllResults();
            });
        }
    },

    setMode: function(mode) {
        if (this._isMeasuring) return;
        this.options.mode = mode;
        if (this._modeDistanceBtn && this._modeAreaBtn) {
            if (mode === 'distance') {
                this._modeDistanceBtn.classList.add('active');
                this._modeAreaBtn.classList.remove('active');
            } else {
                this._modeAreaBtn.classList.add('active');
                this._modeDistanceBtn.classList.remove('active');
            }
        }
        this.fire('measure:modeChange', { mode: mode });
    },

    getMode: function() {
        return this.options.mode;
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

        if (this._toggleBtn) {
            this._toggleBtn.innerHTML = this.options.language.endBtn;
        }
        if (this._cancelBtn) {
            this._cancelBtn.style.display = 'block';
        }
        if (this._resultDiv) {
            this._resultDiv.style.display = 'block';
        }
        if (this._resultValue) {
            this._resultValue.innerHTML = '<span>--</span>';
        }

        if (this._infoDiv) {
            if (this._map.hasLayer(this._infoDiv)) {
                this._map.removeLayer(this._infoDiv);
            }
            this._infoDiv.addTo(this._map);
        }

        var mode = this.options.mode;
        if (this._resultLabel) {
            this._resultLabel.innerHTML = mode === 'distance' ? this.options.language.distanceLabel + ':' : this.options.language.areaLabel + ':';
        }

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

            var measurement = {
                mode: mode,
                unit: this.options.unit,
                points: this._points.slice(),
                geometries: finalGeometries,
                result: result
            };

            this._measureHistory.push(measurement);

            this._tempLayers = [];
            // 测量结束时，确定最终 label 的位置
            var finalPosition;
            if (mode === 'distance') {
                finalPosition = this._points[this._points.length - 1];
            } else {
                finalPosition = this._getPolygonCenter(this._points);
            }

            // 创建最终的 result label 并保存到历史记录中
            if (finalPosition && this._currentResultLabel) {
                var finalLabel = L.tooltip({
                    className: 'leaflet-measure-result-label',
                    permanent: true,
                    direction: 'top',
                    offset: [0, -10]
                }).setContent(this._formatResult(result)).setLatLng(finalPosition).addTo(this._map);
                measurement.resultLabel = finalLabel;
            }

            // 清除当前临时 label
            this._removeResultLabelOnMap();
            this._points = [];
            this.stopMeasuring();

            if (this._toggleBtn) {
                this._toggleBtn.innerHTML = this.options.language.startBtn;
            }
            if (this._cancelBtn) {
                this._cancelBtn.style.display = 'none';
            }
            if (this._clearBtn) {
                this._clearBtn.style.display = 'block';
            }
            this._updateHistoryDisplay();
            if (this._resultLabel) {
                this._resultLabel.innerHTML = mode === 'distance' ? this.options.language.distanceLabel + ':' : this.options.language.areaLabel + ':';
            }
            if (this._resultValue) {
                this._resultValue.innerHTML = '<span>' + this._formatResult(result) + '</span>';
            }

            this.fire('measure:end', measurement);
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
        this._removeResultLabelOnMap();
        this._tempLayers = [];
        this._points = [];

        if (this._toggleBtn) {
            this._toggleBtn.innerHTML = this.options.language.startBtn;
        }
        if (this._cancelBtn) {
            this._cancelBtn.style.display = 'none';
        }
        if (this._resultDiv) {
            this._resultDiv.style.display = 'none';
        }

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
            if (measurement.resultLabel && self._map.hasLayer(measurement.resultLabel)) {
                self._map.removeLayer(measurement.resultLabel);
            }
        });
        this._measureHistory = [];
        this._updateHistoryDisplay();
        if (this._clearBtn) {
            this._clearBtn.style.display = 'none';
        }
        if (this._resultDiv) {
            this._resultDiv.style.display = 'none';
        }

        this.fire('measure:clear');
    },

    getHistory: function() {
        return this._measureHistory;
    },

    _cleanup: function() {
        if (this._isMeasuring) {
            this.cancelMeasuring();
        }
        if (this._map && this._infoDiv && this._map.hasLayer(this._infoDiv)) {
            this._map.removeLayer(this._infoDiv);
        }
    },

    _isSamePosition: function(latLng1, latLng2) {
        if (!latLng1 || !latLng2) return false;
        return latLng1.distanceTo(latLng2) < 5;
    },

    _addPoint: function(latLng) {
        this._points.push(latLng);
        this._updatePreviewResults();

        // 立即更新动态线，使用最后记录的鼠标位置或当前点击位置
        var updatePosition = this._lastMouseLatLng || latLng;
        this._updateDynamicLines(updatePosition);

        this.fire('measure:pointAdded', {
            latlng: latLng,
            points: this._points.slice(),
            pointCount: this._points.length
        });
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
        this._lastMouseLatLng = e.latlng;
        this._updateDynamicLines(e.latlng);
    },

    _updateDynamicLines: function(latlng) {
        if (this._points.length > 0 && latlng) {
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

            var previewLine = L.polyline([lastPoint, latlng], {
                color: styles.previewStrokeColor,
                weight: styles.previewStrokeWeight,
                dashArray: '5, 5',
                opacity: 0.8
            }).addTo(this._map);
            this._tempLayers.push(previewLine);

            var previewMarker = L.circleMarker(latlng, {
                radius: 4,
                color: styles.previewStrokeColor,
                fillColor: styles.previewStrokeColor,
                fillOpacity: 0.8
            }).addTo(this._map);
            this._tempLayers.push(previewMarker);

            if (this.options.mode === 'area' && this._points.length > 0) {
                var previewLine2 = L.polyline([this._points[0], latlng], {
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

            // 距离测量：从第1个点开始显示实时结果
            if (this.options.mode === 'distance' && this._points.length >= 1) {
                var distance = 0;
                for (var di = 1; di < this._points.length; di++) {
                    distance += this._points[di].distanceTo(this._points[di - 1]);
                }
                // 加上到鼠标当前位置的距离
                if (latlng) {
                    distance += lastPoint.distanceTo(latlng);
                }
                var distanceText = this._formatResult(distance);
                // 跟随鼠标位置
                this._updateResultLabelOnMap(latlng, distanceText);
            }
            // 面积测量：从第2个点开始显示（此时有3个点可计算面积）
            else if (this.options.mode === 'area' && this._points.length >= 2) {
                var areaPoints = this._points.slice();
                if (latlng) {
                    areaPoints.push(latlng);
                }
                var area = this._geodesicArea(areaPoints);
                var areaText = this._formatResult(area);
                // 面积测量时显示在中心点
                var labelPosition = this._getPolygonCenter(areaPoints);
                this._updateResultLabelOnMap(labelPosition, areaText);
            } else {
                this._removeResultLabelOnMap();
            }
        }
    },

    _updateResultLabelOnMap: function(latlng, text) {
        if (!latlng || !text) {
            this._removeResultLabelOnMap();
            return;
        }

        if (this._currentResultLabel) {
            this._currentResultLabel._currentText = text;
            this._currentResultLabel.setLatLng(latlng);
            this._currentResultLabel.setContent(text);
        } else {
            this._currentResultLabel = L.tooltip({
                className: 'leaflet-measure-result-label',
                permanent: true,
                direction: 'top',
                offset: [0, -10]
            }).setContent(text).setLatLng(latlng).addTo(this._map);
            this._currentResultLabel._currentText = text;
        }
    },

    _removeResultLabelOnMap: function() {
        if (this._currentResultLabel) {
            if (this._map.hasLayer(this._currentResultLabel)) {
                this._map.removeLayer(this._currentResultLabel);
            }
            this._currentResultLabel = null;
        }
    },

    _getPolygonCenter: function(latlngs) {
        if (!latlngs || latlngs.length === 0) return null;
        var sumLat = 0, sumLng = 0;
        for (var i = 0; i < latlngs.length; i++) {
            sumLat += latlngs[i].lat;
            sumLng += latlngs[i].lng;
        }
        return L.latLng(sumLat / latlngs.length, sumLng / latlngs.length);
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
        if (!this._resultLabel || !this._resultValue) return;

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
        this._resultLabel.innerHTML = this.options.mode === 'distance' ? this.options.language.distanceLabel + ':' : this.options.language.areaLabel + ':';
        if (this.options.mode === 'distance') {
            this._resultValue.innerHTML = '<span>' + (length > 1000 ? (length / 1000).toFixed(2) + ' km' : length.toFixed(2) + ' m') + '</span>';
        } else {
            this._resultValue.innerHTML = '<span>' + (area > 1000000 ? (area / 1000000).toFixed(2) + ' km²' : area.toFixed(2) + ' m²') + '</span>';
        }
    },

    _updateHistoryDisplay: function() {
        if (!this._historyDiv) return;

        var lang = this.options.language;
        if (this._measureHistory.length === 0) {
            this._historyDiv.innerHTML = '<div class="measure-no-history">' + lang.noHistory + '</div>';
            return;
        }

        var html = '<div class="measure-history-title">' + lang.clearBtn + '</div>';
        var self = this;
        this._measureHistory.forEach(function(m, index) {
            var icon = m.mode === 'distance' ? '📏' : '⬡';
            var label = m.mode === 'distance' ? lang.distanceLabel : lang.areaLabel;
            var value = self._formatResult(m.result);
            html += '<div class="measure-history-item" data-index="' + index + '">';
            html += '<span class="measure-history-icon">' + icon + '</span>';
            html += '<span class="measure-history-label">' + label + ':</span>';
            html += '<span class="measure-history-value">' + value + '</span>';
            html += '</div>';
        });
        this._historyDiv.innerHTML = html;

        var self = this;
        var items = this._historyDiv.querySelectorAll('.measure-history-item');
        items.forEach(function(item) {
            L.DomEvent.on(item, 'click', function() {
                var index = parseInt(this.getAttribute('data-index'));
                var measurement = self._measureHistory[index];
                if (measurement) {
                    measurement.geometries.forEach(function(layer) {
                        if (self._map.hasLayer(layer)) {
                            self._map.removeLayer(layer);
                        }
                    });
                    self._measureHistory.splice(index, 1);
                    self._updateHistoryDisplay();
                }
            });
        });
    },

    _geodesicArea: function(latLngs) {
        var points = [];
        for (var i = 0; i < latLngs.length; i++) {
            points.push([latLngs[i].lat, latLngs[i].lng]);
        }
        var rad = Math.PI / 180;
        var earthRadius = 6371000;
        var area = 0;
        var len = points.length;
        if (len < 3) return 0;

        for (var i = 0; i < len; i++) {
            var j = (i + 1) % len;
            var xi = points[i][0] * rad;
            var yi = points[i][1] * rad;
            var xj = points[j][0] * rad;
            var yj = points[j][1] * rad;

            area += yj * Math.sin(xi) - yi * Math.sin(xj);
        }

        area = Math.abs(area * earthRadius * earthRadius / 2);
        return area;
    }
});

L.measure = function(mode, options) {
    return new L.Measure(mode, options);
};

L.Map.addInitHook(function(opts) {
    if (opts && opts.measureControl) {
        var mode = 'distance';
        var options = opts.measureControl;
        if (typeof opts.measureControl === 'string') {
            mode = opts.measureControl;
            options = {};
        } else if (typeof opts.measureControl === 'object') {
            mode = opts.measureControl.mode || 'distance';
            options = opts.measureControl;
        }
        this.measureControl = L.measure(mode, options);
        this.addControl(this.measureControl);
    }
});
