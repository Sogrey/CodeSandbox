# L.Measure - Leaflet 测量控件

用于 Leaflet 地图的距离和面积测量插件，支持可选 UI 和无 UI 模式。

## 引入

```html
<!-- 先引入 Leaflet 库 -->
<link rel="stylesheet" href="../../libs/leaflet/1.9.4/leaflet.css" />
<script src="../../libs/leaflet/1.9.4/leaflet.js"></script>

<!-- 引入 L.Measure 插件 -->
<link rel="stylesheet" href="L.Measure.css">
<script src="L.Measure.js"></script>
```

## 快速开始

### 带 UI 的测量控件

```javascript
var map = L.map('map').setView([30.53, 114.3], 13);

var measureControl = L.measure('distance', {
    position: 'topright',
    showUI: true
}).addTo(map);
```

### 无 UI 的测量控件（通过代码控制）

```javascript
var measureControl = L.measure('distance', {
    position: 'topright',
    showUI: false
}).addTo(map);

// 通过代码开始测量
measureControl.startMeasuring();

// 通过代码结束测量
measureControl.finishMeasuring();

// 监听测量结果
measureControl.on('measure:end', function(e) {
    console.log('测量结果:', e.result);
    console.log('测量模式:', e.mode);
    console.log('测量点:', e.points);
});
```

## 构造函数

### `L.measure(mode, options)`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mode` | `String` | `'distance'` | 测量模式，可选 `'distance'`(距离) 或 `'area'`(面积) |
| `options` | `Object` | `{}` | 配置选项 |

### 配置选项 (options)

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `String` | `'topright'` | 控件位置，可选 `'topleft'`, `'topright'`, `'bottomleft'`, `'bottomright'` |
| `mode` | `String` | `'distance'` | 测量模式，可选 `'distance'` 或 `'area'` |
| `showUI` | `Boolean` | `false` | 是否显示内置 UI，设为 `true` 可显示内置控制面板 |
| `unit` | `String` | `'m'` | 结果单位，详见下方单位说明 |
| `styles` | `Object` | `{}` | 样式配置，详见下方样式选项 |
| `language` | `Object` | `{}` | 语言文本配置 |

### 单位选项 (unit)

**距离单位：**
| 值 | 说明 |
|---|---|
| `'m'` | 米（默认） |
| `'km'` | 千米 |
| `'ft'` | 英尺 |
| `'nm'` | 海里 |

**面积单位：**
| 值 | 说明 |
|---|---|
| `'m2'` | 平方米（默认） |
| `'km2'` | 平方千米 |
| `'ha'` | 公顷 |
| `'ac'` | 英亩 |

### 样式选项 (styles)

```javascript
{
    strokeColor: '#006eff',        // 线/边框颜色
    strokeWeight: 3,               // 线宽
    fillColor: '#ff7800',          // 面积填充颜色
    fillOpacity: 0.2,              // 面积填充透明度
    pointRadius: 6,                // 测量点半径
    previewStrokeColor: '#00ccff', // 预览线颜色
    previewStrokeWeight: 2,        // 预览线宽
    areaPreviewStrokeColor: '#ff7800' // 面积预览时连接首尾点的线颜色
}
```

### 语言选项 (language)

```javascript
{
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
```

## 方法

### 测量控制

| 方法 | 说明 |
|------|------|
| `startMeasuring()` | 开始测量 |
| `stopMeasuring()` | 停止测量（不保存结果） |
| `finishMeasuring()` | 结束测量并保存结果 |
| `cancelMeasuring()` | 取消当前测量 |
| `clearAllResults()` | 清除所有测量结果 |

### 模式切换

| 方法 | 说明 |
|------|------|
| `setMode(mode)` | 设置测量模式，`mode` 为 `'distance'` 或 `'area'` |
| `getMode()` | 获取当前测量模式 |

### 其他

| 方法 | 说明 |
|------|------|
| `getHistory()` | 获取测量历史记录 |

## 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `measure:start` | `{ mode }` | 测量开始时触发 |
| `measure:end` | `{ mode, result, points, geometries, unit }` | 测量结束时触发 |
| `measure:cancel` | - | 测量取消时触发 |
| `measure:clear` | - | 清除所有结果时触发 |
| `measure:modeChange` | `{ mode }` | 测量模式改变时触发 |
| `measure:pointAdded` | `{ latlng, points, pointCount }` | 每次添加测量点时触发 |

### measure:end 事件返回数据示例

```javascript
{
    mode: 'distance',           // 测量模式
    unit: 'm',                  // 测量单位
    result: 1523.45,            // 测量原始结果（米）
    points: [                   // 测量点数组
        L.latLng(30.53, 114.3),
        L.latLng(30.54, 114.4),
        L.latLng(30.55, 114.35)
    ],
    geometries: [               // 地图上的图形对象（可用于删除）
        L.circleMarker(...),
        L.circleMarker(...),
        L.polyline(...)
    ],
    resultLabel: L.Tooltip(...) // 地图上的实时结果标签对象
}
```

## 实时结果标签

插件会在地图上实时显示测量结果标签：
- **距离测量**：点击第1个点后开始显示，跟随鼠标位置
- **面积测量**：点击第2个点后开始显示，显示在当前多边形的中心点
- **标签保持**：测量结束后，结果标签会一直保留在地图上
- **标签清除**：只有在调用 `clearAllResults()` 时才会清除所有结果标签

## 完整示例

### 示例 1：带 UI 的完整测量工具

```javascript
var map = L.map('map').setView([30.53, 114.3], 13);

var measureControl = L.measure('distance', {
    position: 'topright',
    showUI: true,
    unit: 'm'
}).addTo(map);

// 监听测量事件
measureControl.on('measure:end', function(e) {
    console.log('测量完成！');
    console.log('模式:', e.mode);
    console.log('结果:', e.result);
});

// 监听模式切换
measureControl.on('measure:modeChange', function(e) {
    console.log('切换到:', e.mode === 'distance' ? '距离测量' : '面积测量');
});
```

### 示例 2：无 UI 自定义测量（距离测量）

```javascript
var measureControl = L.measure('distance', {
    position: 'topright',
    showUI: false,
    unit: 'km'
}).addTo(map);

measureControl.on('measure:end', function(e) {
    var formattedResult = (e.result / 1000).toFixed(2) + ' km';
    console.log('距离测量结果:', formattedResult);
});

// 开始测量
document.getElementById('startBtn').onclick = function() {
    measureControl.startMeasuring();
};

// 结束测量
document.getElementById('endBtn').onclick = function() {
    measureControl.finishMeasuring();
};
```

### 示例 3：无 UI 自定义测量（面积测量）

```javascript
var measureControl = L.measure('area', {
    position: 'topright',
    showUI: false,
    unit: 'km2',
    styles: {
        strokeColor: '#ff0000',
        fillColor: '#ff0000',
        fillOpacity: 0.3
    }
}).addTo(map);

measureControl.on('measure:end', function(e) {
    var formattedResult = (e.result / 1000000).toFixed(2) + ' km²';
    console.log('面积测量结果:', formattedResult);
});

measureControl.on('measure:pointAdded', function(e) {
    console.log('已添加第', e.pointCount, '个点');
});
```

### 示例 4：通过地图初始化选项启用

```javascript
var map = L.map('map', {
    center: [30.53, 114.3],
    zoom: 13,
    measureControl: {
        mode: 'distance',
        position: 'topright',
        showUI: true
    }
});
```

## 测量规则

1. **距离测量**：至少需要 2 个点才能完成测量
2. **面积测量**：至少需要 3 个点才能完成测量
3. **双击结束**：双击地图可结束测量，并将双击位置作为最后一个点
4. **快速点击**：快速点击不同位置会正确记录每个点
5. **同位置点击**：同位置快速点击会被识别为双击，不会添加重复点

### 示例 5：完整外部控制示例（control-measure.html）

参考 [control-measure.html](https://github.com/Sogrey/CodeSandbox/blob/main/public/examples/leaflet/control-measure.html) 文件，展示了如何通过外部按钮控制测量：

```html
<div class="demo-toolbar">
  <button id="btnStart" class="toolbar-btn">🎯 开始测量</button>
  <button id="btnEnd" class="toolbar-btn" disabled>✔ 结束测量</button>
  <button id="btnClear" class="toolbar-btn" disabled>🗑️ 清除</button>
  <span class="result-display" id="resultDisplay">结果: --</span>
</div>
```

```javascript
// 使用插件 - 无 UI 模式，通过外部按钮控制
var measureControl = L.measure('distance', {
    position: 'topright',
    showUI: false,
    unit: 'm'
}).addTo(map);

// 外部 UI 控制
var btnStart = document.getElementById('btnStart');
var btnEnd = document.getElementById('btnEnd');
var btnClear = document.getElementById('btnClear');
var resultDisplay = document.getElementById('resultDisplay');

btnStart.addEventListener('click', function() {
    measureControl.startMeasuring();
    btnStart.disabled = true;
    btnEnd.disabled = false;
    resultDisplay.textContent = '测量中... 点击添加点';
});

btnEnd.addEventListener('click', function() {
    measureControl.finishMeasuring();
    btnStart.disabled = false;
    btnEnd.disabled = true;
});

btnClear.addEventListener('click', function() {
    measureControl.clearAllResults();
    btnStart.disabled = false;
    btnEnd.disabled = true;
    btnClear.disabled = true;
    resultDisplay.textContent = '结果: --';
});

// 监听测量事件
measureControl.on('measure:start', function(e) {
    console.log('测量开始', e.mode);
    btnClear.disabled = false;
});

measureControl.on('measure:end', function(e) {
    console.log('测量结束', e);
    var value = e.result > 1000 ? (e.result / 1000).toFixed(2) + ' km' : e.result.toFixed(2) + ' m';
    resultDisplay.textContent = '结果: ' + value;
});

measureControl.on('measure:cancel', function() {
    console.log('测量取消');
    resultDisplay.textContent = '结果: --';
});

measureControl.on('measure:clear', function() {
    console.log('测量结果已清除');
    resultDisplay.textContent = '结果: --';
});

measureControl.on('measure:pointAdded', function(e) {
    console.log('添加了点', e.pointCount, '个', e.latlng);
});
```

## 许可证

MIT