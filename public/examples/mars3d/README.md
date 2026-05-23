# Mars3D 示例开发记录

## 项目概述

基于 Mars3D (Cesium) 的三维地图示例开发，规范模板位于 `public\examples\mars3d\default.html`

## 已完成的示例

### 1. 开场动画 (openFlyAnimation.html)
- **功能**: 从太空飞向地球的视角动画
- **位置**: 西安上空
- **GUI控制**: 起点/终点坐标、飞行时长、缓动函数
- **操作**: 播放/停止/飞到起点/飞到终点

### 2. 旋转的地球 (earth-rotate.html)
- **功能**: 地球持续旋转动画
- **GUI控制**: 启用旋转、旋转速度、旋转方向(顺时针/逆时针)
- **操作**: 开始/停止/切换旋转

### 3. 视点飞行 (setCameraViewList.html)
- **功能**: 多视点顺序飞行（大雁塔周边4个视点）
- **GUI控制**: 自动开始、每步时长、缓动函数
- **操作**: 开始/暂停/继续/停止
- **日志**: 每个视点切换时打印日志

### 4. 视角书签 (bookmark.html)
- **功能**: 保存当前视角为书签，点击飞向该视角
- **面板位置**: 右上角
- **功能**: 添加书签（带缩略图）、飞向书签、删除书签
- **持久化**: localStorage 存储书签数据

### 5. 坐标拾取 (selectPoint.html)
- **功能**: 点击地图拾取坐标
- **面板位置**: 右上角
- **坐标格式**: 十进制、度分秒、平面坐标(3度带/6度带)
- **核心API**: mars3d.LngLatPoint.fromCartesian()

### 6. 坐标批量转换 (pointTrans.html)
- **功能**: 多种坐标系批量转换
- **支持转换**:
  - WGS84 ↔ GCJ02 (国测局)
  - WGS84 ↔ BD09 (百度)
  - WGS84 ↔ WebMercator (墨卡托)
  - WGS84 ↔ CGCS2000 3度带/6度带
- **输入**: 多行坐标，逗号分隔

### 7. 高德地图图层 (gaode.html)
- **功能**: 动态加载高德在线地图图层
- **加载方式**: 使用 map.addLayer() 动态添加
- **图层类型**: 电子地图、影像地图、实时路况、注记层
- **GUI控制**: 图层选择、透明度、亮度、对比度、饱和度
- **审图号**: 显示在左下角

## 技术规范

### 模板结构
```html
<!-- CodeSandbox Template File -->
<engine-type>mars3d</engine-type>
<title>示例标题</title>
<meta name="description" content="示例描述" />
<template>
  <div id="map3dContainer"></div>
</template>
<script>
  function initMap() {
    // 核心代码
  }
  initMap()
</script>
<style>...</style>
<!-- Settings Section -->
<settings>
  <css-links>相对路径</css-links>
  <js-links>相对路径</js-links>
</settings>
```

### 路径规范
- 示例文件: `public\examples\mars3d\*.html`
- dat.gui 路径: `../../libs/utils/dat.gui-0.7.9/dat.gui.min.js`

### 布局规范
- **GUI面板**: `top: 50px; right: 20px`
- **日志面板**: `bottom: 20px; right: 20px`
- **书签面板**: `top: 50px; right: 20px`
- **审图号**: `bottom: 8px; left: 10px`

### 坐标系规范
- 优先使用西安坐标范围: lat ≈ 34.265°, lng ≈ 108.954°
- 高度根据需求调整

### 核心API参考
- `mars3d.Map()` - 创建地图
- `map.getCameraView()` - 获取当前视角
- `map.setCameraView()` - 飞向指定视角
- `map.setCameraViewList()` - 多视点飞行
- `map.camera.flyTo()` - 相机飞行动画
- `map.camera.cancelFlight()` - 取消飞行
- `map.addLayer()` - 添加图层
- `map.removeLayer()` - 移除图层
- `mars3d.EventType.clockTick` - 时钟事件
- `mars3d.PointTrans.*` - 坐标转换

## 待开发示例

参考 `tmp\example.json` 中的示例列表，继续开发：
- 地形相关（地形开挖、坡度分析等）
- 矢量数据加载
- 3D 模型加载
- 特效与后处理
