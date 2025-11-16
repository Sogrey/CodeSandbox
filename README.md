# Vue3 CodeSandbox

一个基于 Vue 3 + CodeMirror 6 的在线代码编辑器，支持 HTML、CSS 和 JavaScript 的实时预览，具备完整的模板导入导出功能，支持 URL 参数直接加载代码和模板页面。

## ✨ 特性

- 🚀 **Vue 3 + TypeScript** - 现代化前端技术栈
- 📝 **CodeMirror 6** - 强大的代码编辑器
- 🎨 **多主题支持** - One Dark 和 Shadowfox 主题
- 🔄 **实时预览** - 代码变更即时预览
- 💾 **自动保存** - 自动保存代码到本地存储
- 📱 **响应式设计** - 支持桌面和移动设备
- 🛠️ **代码格式化** - 一键美化 HTML、CSS、JavaScript
- 📥 **模板导出** - 导出包含完整设置的模板文件
- 📤 **模板导入** - 导入并解析扩展模板文件，支持标题和描述元数据
- 🔗 **URL参数解析** - 支持通过 URL 参数直接加载代码或模板页面
- ⚙️ **资源设置** - HTML meta 标签、CSS 和 JS CDN 链接管理
- 📄 **页面元数据** - 支持设置页面标题和描述

## 🛠️ 技术栈

- **前端框架**: Vue 3.5 + TypeScript
- **构建工具**: Vite 7.1
- **代码编辑器**: CodeMirror 6
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
├── src/
│   ├── components/          # Vue 组件
│   │   └── TheWelcome.vue   # 主编辑器组件
│   ├── utils/              # 工具函数
│   │   ├── componentHelpers.ts  # 组件辅助工具函数
│   │   ├── templateGenerator.ts # 模板生成器
│   │   └── templateManager.ts   # 模板管理器
│   └── main.ts             # 应用入口
├── public/                # 静态资源
│   ├── demo.html           # 示例文件
│   └── examples/           # 模板示例文件夹
│       └── demo1.html      # 示例模板文件
└── package.json
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

### 示例模板位置
模板文件应放置在 `public/examples/` 目录下，支持以下结构：

```
public/
├── demo.html              # 默认模板
└── examples/              # 示例模板文件夹
    ├── demo1.html         # 示例模板1
    ├── demo2.html         # 示例模板2
    └── other/             # 子文件夹支持
        └── template.html  # 嵌套模板
```

## 🔧 主要功能

### 代码编辑器
- 支持 HTML、CSS、JavaScript 三种文件类型
- 语法高亮和智能提示
- 可调整的编辑器宽度
- 主题切换功能

### 实时预览
- 基于 iframe 的安全沙箱预览
- 代码变更即时更新预览
- 支持完整的前端功能演示

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

### 工具功能
- 一键代码格式化
- 下载完整 HTML 文件
- 分享链接生成
- 设置面板（主题、字体大小、自动保存）
- 资源链接管理（CSS/JS CDN）

## 🎨 主题支持

目前支持以下编辑器主题：
- **One Dark** - 经典的深色主题
- **Shadowfox** - 深色主题变体

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

- 项目地址: [https://github.com/Sogrey/CodeSandbox](https://github.com/Sogrey/CodeSandbox)
- 作者: Sogrey
