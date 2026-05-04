(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);
    } else if (typeof module !== 'undefined') {
        module.exports = factory(require('leaflet'));
    } else {
        if (typeof window.L === 'undefined') {
            throw new Error('Leaflet must be loaded first');
        }
        factory(window.L);
    }
}(function (L) {
    L.Control.Fullscreen = L.Control.extend({
        options: {
            position: 'topleft',
            titleEnter: 'Enter Fullscreen',
            titleExit: 'Exit Fullscreen',
            forceSeparate: false,
            showUI: true
        },

        initialize: function(options) {
            L.Util.setOptions(this, options);
            L.Control.prototype.initialize.call(this, options);
            this._eventHandlers = {};
            this._isFullscreen = false;
        },

        onAdd: function(map) {
            this._map = map;
            this._map._fullscreenControl = this;

            if (!this.options.showUI) {
                this._container = L.DomUtil.create('div');
                return this._container;
            }

            var container = L.DomUtil.create('div', 'leaflet-control-fullscreen leaflet-bar leaflet-control');

            this.link = L.DomUtil.create('a', 'leaflet-control-fullscreen-button leaflet-bar-part', container);
            this.link.href = '#';
            this.link.title = this.options.titleEnter;

            this._toggleTitle();

            L.DomEvent.on(this.link, 'click', this._click, this);

            return container;
        },

        _click: function (e) {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            this._map.toggleFullscreen();
        },

        _toggleTitle: function() {
            if (this.link) {
                this.link.title = this._isFullscreen ? this.options.titleExit : this.options.titleEnter;
            }
        },

        isFullscreen: function() {
            return this._isFullscreen;
        },

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
        }
    });

    L.Map.include({
        isFullscreen: function () {
            var fullscreenElement = document.fullscreenElement ||
                document.mozFullScreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement;
            return !!fullscreenElement;
        },

        toggleFullscreen: function () {
            if (this.isFullscreen()) {
                this.exitFullscreen();
            } else {
                this.enterFullscreen();
            }
        },

        enterFullscreen: function() {
            var elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        },

        exitFullscreen: function() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        },

        _onFullscreenChange: function () {
            var fullscreenElement = document.fullscreenElement ||
                document.mozFullScreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement;
            this._isFullscreen = !!fullscreenElement;
            if (this._fullscreenControl) {
                this._fullscreenControl._isFullscreen = this._isFullscreen;
                this._fullscreenControl._toggleTitle();
                this._fullscreenControl.fire('fullscreenchange');
            }
            this.fire('fullscreenchange');
        }
    });

    L.Map.mergeOptions({
        fullscreenControl: false
    });

    L.Map.addInitHook(function () {
        if (this.options.fullscreenControl) {
            this.fullscreenControl = new L.Control.Fullscreen(this.options.fullscreenControl);
            this.addControl(this.fullscreenControl);
        }

        var fullscreenchange;
        if ('onfullscreenchange' in document) {
            fullscreenchange = 'fullscreenchange';
        } else if ('onmozfullscreenchange' in document) {
            fullscreenchange = 'mozfullscreenchange';
        } else if ('onwebkitfullscreenchange' in document) {
            fullscreenchange = 'webkitfullscreenchange';
        } else if ('onmsfullscreenchange' in document) {
            fullscreenchange = 'MSFullscreenChange';
        }

        if (fullscreenchange) {
            var that = this;
            this.whenReady(function () {
                L.DomEvent.on(document, fullscreenchange, that._onFullscreenChange, that);
            });
        }
    });

    L.control.fullscreen = function (options) {
        return new L.Control.Fullscreen(options);
    };
}));
