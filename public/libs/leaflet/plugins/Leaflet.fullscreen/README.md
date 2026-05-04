# Leaflet Fullscreen Plugin

Leaflet 全屏插件，支持网页全屏和全屏事件监听。

## 安装

引入插件文件：

```html
<!-- CSS -->
<link rel="stylesheet" href="Leaflet.fullscreen.css">

<!-- JS -->
<script src="Leaflet.fullscreen.js"></script>
```

## 使用方法

### 1. 基本使用

```javascript
var map = L.map('map').setView([51.505, -0.09], 13);

// 添加全屏控件
var fullscreenControl = L.control.fullscreen({
    position: 'topright',
    titleEnter: '进入全屏',
    titleExit: '退出全屏'
}).addTo(map);
```

### 2. 隐藏 UI，只保留功能

```javascript
var fullscreenControl = L.control.fullscreen({
    showUI: false
}).addTo(map);
```

### 3. 手动切换全屏

```javascript
// 切换全屏
map.toggleFullscreen();

// 进入全屏
map.enterFullscreen();

// 退出全屏
map.exitFullscreen();
```

### 4. 监听全屏事件

```javascript
// 监听 map 上的事件
map.on('fullscreenchange', function() {
    var isFullscreen = map.isFullscreen();
    console.log('全屏状态:', isFullscreen);
});

// 监听 control 上的事件
fullscreenControl.on('fullscreenchange', function() {
    var isFullscreen = map.isFullscreen();
    console.log('全屏状态:', isFullscreen);
});
```

## 接口说明

### L.control.fullscreen(options)

创建全屏控件。

**参数：**
- `options` - 配置选项

**返回值：**
- `L.Control.Fullscreen` - 全屏控件实例

### map.toggleFullscreen()

切换全屏状态。如果当前是全屏则退出，否则进入全屏。

### map.enterFullscreen()

进入全屏模式（网页全屏）。

### map.exitFullscreen()

退出全屏模式。

### map.isFullscreen()

检查当前是否在全屏模式。

**返回值：**
- `boolean` - 是否在全屏模式

### fullscreenControl.on(type, fn, context)

添加事件监听器。

**参数：**
- `type` - 事件类型（'fullscreenchange'）
- `fn` - 回调函数
- `context` - 回调函数的 this 上下文（可选）

### fullscreenControl.off(type, fn)

移除事件监听器。

**参数：**
- `type` - 事件类型（不传则移除所有类型）
- `fn` - 回调函数（不传则移除该类型所有监听器）

### fullscreenControl.fire(type, data)

触发事件。

**参数：**
- `type` - 事件类型
- `data` - 事件数据（可选）

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | string | 'topleft' | 控件位置 |
| `titleEnter` | string | 'Enter Fullscreen' | 进入全屏时的提示文本 |
| `titleExit` | string | 'Exit Fullscreen' | 退出全屏时的提示文本 |
| `showUI` | boolean | true | 是否显示 UI |

## 完整示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>Leaflet Fullscreen Example</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="leaflet.css">
    <link rel="stylesheet" href="Leaflet.fullscreen.css">
    <style>
        #map {
            width: 100%;
            height: 400px;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <button id="toggleBtn">切换全屏</button>
    <p id="status">普通模式</p>

    <script src="leaflet.js"></script>
    <script src="Leaflet.fullscreen.js"></script>
    <script>
        var map = L.map('map').setView([51.505, -0.09], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        var fullscreenControl = L.control.fullscreen({
            position: 'topright',
            titleEnter: '进入全屏',
            titleExit: '退出全屏'
        }).addTo(map);

        // 监听全屏事件
        map.on('fullscreenchange', function() {
            var isFullscreen = map.isFullscreen();
            document.getElementById('status').textContent = isFullscreen ? '全屏模式' : '普通模式';
        });

        // 按钮点击切换全屏
        document.getElementById('toggleBtn').addEventListener('click', function() {
            map.toggleFullscreen();
        });
    </script>
</body>
</html>
```

## 浏览器兼容性

- Chrome 15+
- Firefox 10+
- Safari 5.1+
- IE 11+
- Edge

## License

MIT
