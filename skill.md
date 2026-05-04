明白了！我会在每次生成的内容开头添加这个固定的注释头，并根据实际 demo 内容修改对应部分（生成时间、页面标题）。

以下是完善后的 Skill 规范：

---

# CodeSandbox 分享文件模板 Skill

## 一、完整模板格式

```xml
<!--
CodeSandbox 分享文件
生成时间: 2026/xx/xx xx:xx:xx
页面标题: 【根据实际内容修改】
原始页面链接: https://sogrey.top/CodeSandbox/
-->

<!-- CodeSandbox Template File -->
<!-- 该文件包含完整的模板数据和设置信息，可以被重新导入 -->

<engine-type>引擎类型</engine-type>
<title>页面标题</title>
<meta name="description" content="页面描述" />
<template>
<div id="map"></div>
<!-- 可选：按钮、面板等 -->
</template>
<script>
// 核心 JavaScript 逻辑
</script>
<style>
/* CSS 样式 */
</style>
<settings>
<head-metadata>

</head-metadata>
<css-links>

</css-links>
<js-links>

</js-links>
</settings>
```

## 二、标签说明

| 标签 | 作用 | 示例值 |
|------|------|--------|
| `<!-- 注释头 -->` | 文件元信息 | 包含生成时间、页面标题、原始链接 |
| `<engine-type>` | 引擎类型 | `leaflet`、`cesium`、`mapbox`、`mapbox-cgcs2000`、`openlayers`、`three.js` （均是小写）|
| `<title>` | 页面标题 | `Leaflet 加载高德地图` |
| `<meta name="description">` | 页面描述 | `这是一个简单 Leaflet 示例` |
| `<template>` | HTML 结构 | 地图容器 + 按钮/面板 |
| `<script>` | 核心逻辑 | 完整的 JavaScript 代码 |
| `<style>` | CSS 样式 | 地图容器样式、面板位置样式 |
| `<settings>` | CDN 配置 | 按行分割，不需要的留空 |

## 三、样式规范

- **按钮/面板优先位置**：
  - 右上角：`top: 20px; right: 20px;`
  - 右下角：`bottom: 20px; right: 20px;`
- **地图容器**：`#map` 需占满全屏

## 四、Leaflet 基础模板示例

```xml
<!--
CodeSandbox 分享文件
生成时间: 2026/5/4 14:30:00
页面标题: Leaflet 基础地图
原始页面链接: https://sogrey.top/CodeSandbox/
-->

<!-- CodeSandbox Template File -->
<!-- 该文件包含完整的模板数据和设置信息，可以被重新导入 -->

<engine-type>leaflet</engine-type>
<title>Leaflet 基础地图</title>
<meta name="description" content="Leaflet 基础地图示例" />
<template>
<div id="map"></div>
</template>
<script>
var map = L.map('map').setView([39.9042, 116.4074], 10);
L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    subdomains: ['1', '2', '3', '4'],
    attribution: '&copy; 高德地图'
}).addTo(map);
</script>
<style>
html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }
</style>
<settings>
<head-metadata>

</head-metadata>
<css-links>

</css-links>
<js-links>

</js-links>
</settings>
```

## 五、带控制面板的模板示例

```xml
<!--
CodeSandbox 分享文件
生成时间: 2026/5/4 14:30:00
页面标题: Leaflet 带控制面板
原始页面链接: https://sogrey.top/CodeSandbox/
-->

<!-- CodeSandbox Template File -->
<!-- 该文件包含完整的模板数据和设置信息，可以被重新导入 -->

<engine-type>leaflet</engine-type>
<title>Leaflet 带控制面板</title>
<meta name="description" content="带图层切换按钮的地图示例" />
<template>
<div id="map"></div>
<button class="control-btn" id="toggleBtn">🗺️ 隐藏图层</button>
<div class="info-panel" id="infoPanel">状态信息</div>
</template>
<script>
var map = L.map('map').setView([39.9042, 116.4074], 10);
L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    subdomains: ['1', '2', '3', '4'],
    attribution: '&copy; 高德地图'
}).addTo(map);

var btn = document.getElementById('toggleBtn');
var infoDiv = document.getElementById('infoPanel');
var visible = true;

btn.onclick = function() {
    if (visible) {
        // 隐藏操作
        btn.innerHTML = '🗺️ 显示图层';
        infoDiv.innerHTML = '图层已隐藏';
    } else {
        // 显示操作
        btn.innerHTML = '🗺️ 隐藏图层';
        infoDiv.innerHTML = '图层已显示';
    }
    visible = !visible;
};
</script>
<style>
html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }
.control-btn {
    position: absolute; top: 20px; right: 20px; z-index: 1000;
    background: white; border: none; padding: 6px 14px;
    border-radius: 20px; cursor: pointer; font-weight: bold;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.control-btn:hover { background: #0066cc; color: white; }
.info-panel {
    position: absolute; bottom: 20px; left: 20px; z-index: 1000;
    background: rgba(0,0,0,0.7); color: white; padding: 8px 15px;
    border-radius: 6px; font-size: 12px; font-family: monospace;
}
</style>
<settings>
<head-metadata>

</head-metadata>
<css-links>

</css-links>
<js-links>

</js-links>
</settings>
```

## 六、CDN 链接配置

当需要引入插件时，在 `<css-links>` 或 `<js-links>` 中按行添加：

```xml
<css-links>
https://unpkg.com/leaflet@1.9.4/dist/leaflet.css
</css-links>
<js-links>
https://unpkg.com/leaflet@1.9.4/dist/leaflet.js
https://cdn.jsdelivr.net/npm/leaflet-gpx@1.4.0/gpx.min.js
</js-links>
```

## 七、常用 CDN 链接

| 库 | CDN 地址 |
|----|---------|
| Leaflet CSS | `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css` |
| Leaflet JS | `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` |
| leaflet-gpx | `https://cdn.jsdelivr.net/npm/leaflet-gpx@1.4.0/gpx.min.js` |
| leaflet-wfst | `https://unpkg.com/leaflet-wfst@2.0.1-beta.27/dist/leaflet-wfst.min.js` |
| toGeoJSON | `https://cdn.jsdelivr.net/npm/@tmcw/togeojson@4.3.0/dist/togeojson.umd.min.js` |
| proj4 | `https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.9.0/proj4.js` |
| proj4leaflet | `https://cdn.jsdelivr.net/npm/proj4leaflet@1.0.2/src/proj4leaflet.js` |

## 八、使用说明

1. 确定需求类型（Leaflet、Cesium、Mapbox 等）
2. 设置对应的 `<engine-type>` (小写的)
3. **在注释头中修改生成时间和页面标题**
4. 填写 `<title>` 和 `<meta description>`
5. 编写 `<template>` 中的 HTML 结构
6. 编写 `<script>` 中的核心逻辑
7. 编写 `<style>` 中的样式
8. 在 `<settings>` 中配置所需的 CDN 链接
9. 将完整内容返回给用户

## 九、注意事项

- **必须包含完整的注释头**，并修改其中对应的内容
- 模板文件不能独立运行，需导入到自有系统中
- 按钮/面板优先放在右上角或右下角
- CDN 链接按行分割，不需要的标签留空
- 保持 `<style>` 中地图容器 `#map` 占满全屏