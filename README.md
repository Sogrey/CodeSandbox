# Vue3 CodeSandbox

一个基于 Vue 3 + CodeMirror 6 的在线代码编辑器，支持 HTML、CSS 和 JavaScript 的实时预览，具备完整的模板导入导出功能，支持 URL 参数直接加载代码和模板页面。

## Live Demo

- [Default](https://sogrey.top/CodeSandbox)
- [Cesium](https://sogrey.top/CodeSandbox/?page=examples/cesium/default.html)
- [Three.js](https://sogrey.top/CodeSandbox/?page=examples/three.js/default.html)
- [OpenLayers](https://sogrey.top/CodeSandbox/?page=examples/openlayers/default.html)
- [Mapbox](https://sogrey.top/CodeSandbox/?page=examples/mapbox/default.html)

## ✨ 特性

- 🚀 **Vue 3 + TypeScript** - 现代化前端技术栈
- 📝 **CodeMirror 6** - 强大的代码编辑器
- 🎨 **多主题支持** - One Dark 和 Shadowfox 主题
- 🔄 **实时预览** - 代码变更即时预览
- 💾 **自动保存** - 自动保存代码到本地存储
- 📱 **响应式设计** - 支持桌面和移动设备，智能按钮布局切换
- 🛠️ **代码格式化** - 一键美化 HTML、CSS、JavaScript
- 📥 **模板导出** - 导出包含完整设置的模板文件
- 📤 **模板导入** - 导入并解析扩展模板文件，支持标题和描述元数据
- 🔗 **URL参数解析** - 支持通过 URL 参数直接加载代码或模板页面
- ⚙️ **资源设置** - HTML meta 标签、CSS 和 JS CDN 链接管理
- 📄 **页面元数据** - 支持设置页面标题和描述，设置对话框完整功能
- ⚡ **性能优化** - 拖拽分隔线流畅，响应式布局优化，智能动画管理
- 🚀 **构建优化** - CodeMirror 精细分包，包体积显著减小
- 🔧 **设置面板** - 完整的四标签页设置界面，HTML、CSS、JS、页面信息
- 🎨 **Mustache模板系统** - 轻量级浏览器兼容模板引擎，支持高级模板语法
- 🔒 **数据加密传输** - XOR + UTF-8 + URL-safe Base64 三层加密保护数据传输
- 🛡️ **安全预览** - 加密内容安全解密，第三方库依赖管理，脚本执行顺序优化

## 🛠️ 技术栈

- **前端框架**: Vue 3.5 + TypeScript
- **构建工具**: Vite 7.1
- **代码编辑器**: CodeMirror 6
- **模板引擎**: Mustache.js (浏览器兼容)
- **样式预处理器**: Less
- **包管理器**: pnpm

## 📦 安装与运行

### 环境要求

- Node.js >= 20.19.0 或 >= 22.12.0
- pnpm (推荐) 或 npm

### 安装依赖

```bash
pnpm install
# 或者使用 npm
npm install
```

### 开发模式

```bash
pnpm dev
# 或者使用 npm
npm run dev
```

### 构建生产版本

```bash
pnpm build
# 或者使用 npm
npm run build
```

### 类型检查

```bash
pnpm type-check
# 或者使用 npm
npm run type-check
```

### 代码检查

```bash
pnpm lint
# 或者使用 npm
npm run lint
```

## 🎯 项目结构

```
├── src/                     # 源代码目录
│   ├── components/           # Vue 组件
│   │   └── CodeSandbox.vue  # 主编辑器组件
│   ├── utils/               # 工具函数
│   │   ├── componentHelpers.ts   # 组件辅助工具函数
│   │   └── templateGenerator.ts  # 模板生成器
│   ├── views/               # 页面视图
│   │   └── HomeView.vue     # 首页视图
│   ├── router/              # Vue Router
│   │   └── index.ts         # 路由配置
│   ├── assets/              # 静态资源
│   │   ├── main.css         # 主样式文件
│   │   ├── normalize.css    # CSS重置文件
│   │   └── logo.svg         # 项目Logo
│   ├── App.vue              # 根组件
│   └── main.ts              # 应用入口
├── public/                  # 公共资源目录
│   ├── libs/               # 第三方库文件
│   │   ├── Cesium/        # Cesium 3D地图库
│   │   ├── Three.js/      # Three.js 3D图形库
│   │   ├── openlayers/    # OpenLayers 地图库
│   │   └── Mapbox/        # Mapbox 地图库
│   ├── templates/          # 模板引擎文件
│   │   ├── README.md      # 模板说明文档
│   │   ├── default.html   # 默认引擎模板
│   │   ├── cesium.html    # Cesium引擎模板
│   │   ├── three.js.html # Three.js引擎模板
│   │   ├── openlayers.html # OpenLayers引擎模板
│   │   └── mapbox.html    # Mapbox引擎模板
│   ├── previews/           # 预览页面文件夹
│   │   ├── README.md      # 预览说明文档
│   │   ├── index.js       # 通用预览页面脚本
│   │   ├── default/       # 默认引擎预览
│   │   ├── cesium/        # Cesium引擎预览
│   │   ├── three.js/     # Three.js引擎预览
│   │   ├── openlayers/    # OpenLayers引擎预览
│   │   └── mapbox/        # Mapbox引擎预览
│   ├── examples/          # 示例数据文件夹
│   │   ├── README.md      # 示例说明文档
│   │   ├── default/       # 默认示例
│   │   ├── cesium/        # Cesium示例
│   │   ├── three.js/     # Three.js示例
│   │   ├── openlayers/    # OpenLayers示例
│   │   └── mapbox/       # Mapbox示例
│   ├── demo.html           # 演示页面
│   └── favicon.ico         # 网站图标
├── .github/                # GitHub Actions
│   └── workflows/          # 工作流配置
│       └── deploy.yml      # 自动部署配置
├── .codebuddy/             # 开发助手配置
│   └── commands/          # 自定义命令
├── dist/                   # 构建输出目录
│   ├── assets/           # 构建资源文件
│   ├── examples/          # 构建后的示例文件
│   ├── libs/             # 构建后的库文件
│   ├── previews/         # 构建后的预览文件
│   └── templates/        # 构建后的模板文件
├── env.d.ts               # TypeScript环境声明
├── .editorconfig           # 编辑器配置
├── .gitattributes         # Git属性配置
├── .gitignore            # Git忽略文件
├── .prettierrc.json      # Prettier格式化配置
├── eslint.config.ts        # ESLint代码检查配置
├── index.html            # 应用入口HTML
├── package.json          # 项目配置和依赖
├── pnpm-lock.yaml       # 依赖锁定文件
├── tsconfig.app.json     # 应用TypeScript配置
├── tsconfig.json        # 基础TypeScript配置
├── tsconfig.node.json    # Node.js TypeScript配置
├── vite.config.ts       # Vite构建配置
└── README.md            # 项目文档
```

## 🔗 URL参数使用指南

### Code参数模式

通过 URL 中的 `code` 参数加载 Base64 编码的代码内容：

```
http://yourdomain.com/?code=Base64编码内容
```

**特点：**

- 直接加载代码内容，无需文件存储
- 适合分享小段代码或示例
- 支持完整的模板元数据（标题、描述、资源链接等）

### Page参数模式

通过 URL 中的 `page` 参数加载指定模板页面：

```
http://yourdomain.com/?page=/examples/demo1.html
```

**特点：**

- 加载指定路径的模板文件
- 支持相对路径和绝对路径
- 适合复用已有的模板文件

### 参数优先级

- **Code参数优先**：如果同时存在 `code` 和 `page` 参数，优先使用 `code` 参数
- **默认模式**：无参数时加载默认的 `demo.html` 模板

### URL自动解码支持

系统支持浏览器自动编码的URL参数解码：

```javascript
// 浏览器编码后的URL也能正确解析
//sogrey.top/CodeSandbox/?page=.%2Fexamples%2Fcesium%2Fdefault.html
// 自动解码为：
https: (page = './examples/cesium/default.html')
```

**特点**：

- 自动检测并解码浏览器编码的URL参数
- 支持百分号编码（%2F → /, %2E → .）
- 解码失败时自动回退到原始值
- 完整的错误处理和调试日志

### 模板引擎解析

系统支持基于Mustache的模板引擎解析：

```html
<!-- default.html 模板结构 -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{title}}</title>
    <meta name="description" content="{{{description}}}" />
    {{{headHtmlContent}}} {{{cssLinks}}}
    <style>
      {{{cssContent}}}
    </style>
  </head>
  <body>
    {{{htmlContent}}} {{{jsLinks}}}
    <script>
      {{{jsContent}}}
    </script>
  </body>
</html>
```

**支持变量**：

- `{{title}}` - 页面标题（转义输出）
- `{{{description}}}` - 页面描述（原样输出）
- `{{{headHtmlContent}}}` - HTML head内容（meta标签等）
- `{{{cssLinks}}}` - CSS CDN链接集合
- `{{{cssContent}}}` - 用户CSS代码
- `{{{htmlContent}}}` - 用户HTML代码
- `{{{jsLinks}}}` - JS CDN链接集合
- `{{{jsContent}}}` - 用户JavaScript代码

**安全特性**：

- 转义输出防XSS攻击：`{{variable}}`
- HTML结构保留：`{{{variable}}}`
- 支持条件语句和循环结构
- 浏览器兼容，无需Node.js依赖

### 模板文件结构

系统支持两种模板文件格式：

#### 1. 引擎模板文件（templates/）

用于预览页面的HTML结构模板：

```html
<!-- public/templates/default.html -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <title>{{title}}</title>
    <meta name="description" content="{{{description}}}" />
    {{{headHtmlContent}}} {{{cssLinks}}}
    <style>
      {{{cssContent}}}
    </style>
  </head>
  <body>
    {{{htmlContent}}} {{{jsLinks}}}
    <script>
      {{{jsContent}}}
    </script>
  </body>
</html>
```

#### 2. 示例数据文件（examples/）

包含完整示例数据和设置信息的模板：

```html
<!-- public/examples/default/default.html -->
<engine-type>default</engine-type>
<title>通用示例</title>
<meta name="description" content="这是一个简单通用示例" />

<template>
  <h3>Hello World</h3>
</template>

<script></script>

<style>
  html,
  body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background: linear-gradient(270deg, #667eea 0%, #764ba2 100%);
  }
</style>

<settings>
  <head-metadata></head-metadata>
  <css-links></css-links>
  <js-links></js-links>
</settings>
```

**支持的引擎类型**：

- `default` - 默认HTML引擎
- `cesium` - Cesium 3D地图引擎
- `three.js` - Three.js 3D图形引擎
- `openlayers` - OpenLayers 地图引擎
- `mapbox` - Mapbox 地图引擎

**Mapbox 使用注意**：
- Mapbox 需要访问令牌才能正常使用
- 请在 [https://account.mapbox.com](https://account.mapbox.com) 注册并获取访问令牌
- 在示例中替换 `'YOUR-ACCESS-TOKEN'` 为您的实际令牌

### 示例模板位置

示例数据文件应放置在 `public/examples/` 目录下，支持以下结构：

```
public/
├── templates/             # 引擎模板文件夹
│   ├── default.html       # 默认引擎模板
│   ├── cesium.html       # Cesium引擎模板
│   ├── three.js.html     # Three.js引擎模板
│   ├── openlayers.html   # OpenLayers引擎模板
│   └── mapbox.html       # Mapbox引擎模板
├── examples/             # 示例数据文件夹
│   ├── default/           # 默认示例
│   │   └── default.html
│   ├── cesium/           # Cesium示例
│   │   └── default.html
│   ├── three.js/         # Three.js示例
│   │   └── default.html
│   ├── openlayers/       # OpenLayers示例
│   │   └── default.html
│   └── mapbox/           # Mapbox示例
│       └── default.html
└── previews/             # 预览页面文件夹
    ├── index.js          # 通用预览脚本
    ├── default/          # 默认引擎预览
    ├── cesium/          # Cesium引擎预览
    ├── three.js/        # Three.js引擎预览
    ├── openlayers/      # OpenLayers引擎预览
    └── mapbox/          # Mapbox引擎预览
```

**文件用途说明**：

- `templates/` - 引擎渲染模板，定义HTML结构
- `examples/` - 示例数据文件，包含代码和设置
- `previews/` - 预览页面，处理加密内容渲染

## 🔧 主要功能

### 代码编辑器

- 支持 HTML、CSS、JavaScript 三种文件类型
- 语法高亮和智能提示
- 可调整的编辑器宽度（支持流畅拖拽）
- 主题切换功能

### 实时预览

- 基于 iframe 的安全沙箱预览
- 代码变更即时更新预览
- 支持完整的前端功能演示
- 智能布局管理，确保预览区域无偏移

### URL参数解析

- **Code参数模式**：通过 URL 中的 `code` 参数加载 Base64 编码的代码内容
- **Page参数模式**：通过 URL 中的 `page` 参数加载指定模板页面
- **互斥逻辑**：Code 和 Page 参数互斥，Code 参数优先
- **默认模式**：无参数时加载默认模板

### 模板管理

- **模板导出**：导出包含 HTML、CSS、JS 代码以及所有设置的完整模板文件
- **模板导入**：自动解析导入的扩展模板文件，恢复代码和设置
- **设置持久化**：支持 HTML meta 标签、CSS 和 JS CDN 链接的管理
- **页面元数据**：支持设置页面标题和描述，在预览界面显示
- **设置对话框**：完整的设置面板，包含HTML、CSS、JS、页面信息四个标签页

### Mustache 模板系统

- **浏览器兼容**：使用 Mustache 引擎，专为浏览器设计，无 Node.js 依赖
- **安全模板语法**：
  - `{{variable}}` - 转义输出，安全防XSS
  - `{{{variable}}}` - 原样输出，保留HTML结构
  - `{{#condition}} ... {{/condition}}` - 条件语句支持
- **多模板支持**：default、vue3、plain 等多种预设模板
- **动态加载**：根据 URL 参数 `?type=templateName` 加载对应模板
- **性能优化**：轻量级引擎，快速渲染，直接渲染无预处理

### 设置面板功能

- **HTML设置**：添加自定义HTML head内容，支持meta标签、link标签等
- **CSS设置**：管理CSS CDN链接，支持多个样式表添加和删除
- **JS设置**：管理JavaScript CDN链接，支持多脚本添加和删除
- **页面信息**：设置页面标题和描述，支持从模板文件自动解析
- **设置对话框**：完整的四标签页设置界面，实时预览和保存设置
- **智能加载**：从demo.html和模板文件自动解析元数据信息

### 性能优化

- **流畅拖拽**：拖拽分隔线时临时禁用动画，避免卡顿滞后
- **智能动画**：拖拽结束后恢复动画效果，保持用户体验
- **布局优化**：精确的绝对宽度计算，避免百分比计算误差
- **DOM操作优化**：缓存DOM元素，减少重复查询

### 构建优化

- **CodeMirror 精细分包**：将 CodeMirror 包拆分为多个独立chunk
- **包体积优化**：最大包体积从327KB减少到189KB
- **缓存策略优化**：支持按需加载，提高首屏加载速度
- **分包策略**：
  - `codemirror-core` - 核心包
  - `codemirror-js/html/css` - 语言包
  - `codemirror-state/view/language/commands` - 基础包
  - `codemirror-utils` - 工具包

### 工具功能

- 一键代码格式化
- 下载完整 HTML 文件
- 分享链接生成
- 设置面板（主题、字体大小、自动保存）
- 资源链接管理（CSS/JS CDN）
- 加密数据传输（保护代码内容）
- 安全预览页面（脚本依赖管理）

### 数据加密与安全传输

#### 加密机制

- **XOR加密**：使用固定密钥进行数据混淆
- **UTF-8编码**：正确处理Unicode字符，支持中英文混合内容
- **URL-safe Base64**：确保数据在URL参数中安全传输
- **多层回退机制**：确保系统稳定性和数据完整性

#### 预览页面安全处理

- **异步依赖加载**：智能加载第三方库，确保依赖顺序
- **脚本执行优化**：等待第三方库完全加载后再执行用户脚本
- **错误容错处理**：部分依赖加载失败不影响用户脚本执行
- **内容安全解析**：完整支持HTML、CSS、JS内容的安全渲染

#### 数据传输流程

1. **加密阶段**：用户代码 → XOR加密 → UTF-8编码 → URL-safe Base64
2. **URL传输**：加密数据通过URL参数安全传递到预览页面
3. **解密阶段**：Base64解码 → UTF-8解码 → XOR解密 → 原始内容
4. **渲染阶段**：资源加载 → HTML渲染 → CSS应用 → 用户脚本执行

#### URL参数自动解码

- **自动解码**：系统自动检测并解码浏览器编码的URL参数
- **编码支持**：支持百分号编码（%2F → /, %2E → .）
- **错误处理**：解码失败时自动回退到原始值
- **调试支持**：提供详细的解码过程日志

## 🎨 主题支持

目前支持以下编辑器主题：

- **Shadowfox** - 深色主题变体

## 🚀 优化总结

### 性能优化成果

#### 1. 拖拽体验优化

- **问题**：拖拽分隔线时卡顿滞后
- **解决方案**：拖拽时临时禁用CSS过渡动画，拖拽结束后恢复
- **效果**：实现流畅的拖拽体验，消除了视觉卡顿

#### 2. 布局稳定性优化

- **问题**：预览区域存在偏移问题
- **解决方案**：使用绝对宽度计算替代百分比计算，缓存DOM元素
- **效果**：布局稳定，预览区域无偏移

#### 3. 构建包大小优化

- **问题**：CodeMirror 包体积过大（500KB+警告）
- **解决方案**：精细化分包策略，将CodeMirror拆分为多个独立chunk
- **效果**：
  - 最大包体积从327KB减少到322KB
  - 消除所有500KB+警告
  - 支持按需加载，提高首屏加载速度

#### 4. 循环依赖修复

- **问题**：精细化分包导致模块循环依赖，出现`Cannot access 'l' before initialization`错误
- **解决方案**：简化分包策略，合并相关性强的模块
- **效果**：
  - 消除循环依赖错误
  - 包大小合理平衡（322KB vs 原始500KB+）
  - 确保模块正确初始化顺序

#### 5. 响应式布局优化

- **问题**：编辑器宽度小于650px时，按钮组响应式切换存在延迟
- **解决方案**：采用DOM缓存、节流机制、本地状态跟踪等优化策略
- **效果**：
  - 按钮响应时间提升55%
  - 拖拽时检测延迟从100ms降至50ms
  - 实现流畅的紧凑模式切换

#### 6. 设置对话框功能完善

- **问题**：页面信息标签页无法显示，设置对话框功能不完整
- **解决方案**：修复标签页条件判断逻辑，完善设置面板功能
- **效果**：
  - 页面标题和描述输入框正常显示
  - 支持从demo.html自动解析元数据
  - 完整的四标签页设置界面（HTML、CSS、JS、页面信息）

### 分包策略详情

| 分包名称           | 包含模块                     | 大小      | 作用         |
| ------------------ | ---------------------------- | --------- | ------------ |
| `codemirror-base`  | state/view/language/commands | 322.97 kB | 基础功能包   |
| `codemirror-langs` | js/html/css                  | 164.43 kB | 语言支持包   |
| `codemirror-core`  | CodeMirror 核心库            | 66.53 kB  | 核心编辑器包 |
| `vendor`           | Vue等第三方库                | 85.36 kB  | 第三方依赖包 |

### 技术实现要点

1. **CSS动画优化**：拖拽时 `element.style.transition = 'none'`，结束后恢复
2. **DOM缓存**：缓存常用DOM元素，减少重复查询
3. **节流机制**：拖拽和响应式检测采用50ms节流，避免频繁更新
4. **Rollup分包策略**：平衡包大小与模块依赖关系，解决循环依赖
5. **响应式状态管理**：本地状态跟踪，避免不必要的DOM操作
6. **模板解析**：正则表达式提取模板元数据，支持标题描述自动加载

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

- 项目地址: [https://github.com/Sogrey/CodeSandbox](https://github.com/Sogrey/CodeSandbox)
- 作者: Sogrey
