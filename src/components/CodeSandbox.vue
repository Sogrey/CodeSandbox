<template>
  <div id="code-sandbox" class="code-sandbox-container">
    <div class="code-editor-preview">
      <!-- 编辑器和预览区 -->
      <div class="editor-preview-container">
        <!-- 编辑器区域 -->
        <div class="editor-panel" :style="{ width: isPreviewMode ? '0px' : editorWidth + 'px' }"
          :class="{ 'preview-mode': isPreviewMode, 'drag-over': isDragOver }" @dragover.prevent="handleDragOver"
          @dragenter.prevent="handleDragEnter" @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop">
          <!-- 编辑器工具栏 -->
          <div class="editor-toolbar">
            <div class="editor-tabs">
              <button v-for="file in files" :key="file.name" :class="{ active: currentFile === file.name }"
                @click="switchFile(file.name)" class="editor-tab">
                {{ file.language.toUpperCase() }}
              </button>
            </div>
            <div class="editor-actions">
              <div class="button-group" :class="{ compact: isButtonsCompact }">
                <button @click="formatCode" class="action-btn" title="格式化代码">
                  <span class="btn-icon">📝</span>
                  <span class="btn-text">格式化</span>
                </button>
                <button @click="runCode" class="action-btn primary" title="运行代码">
                  <span class="btn-icon">▶️</span>
                  <span class="btn-text">运行</span>
                </button>
                <button @click="downloadFullHtml" class="action-btn" title="下载HTML文件" style="display: none;">
                  <span class="btn-icon">📥</span>
                  <span class="btn-text">下载</span>
                </button>
                <button @click="handleImportFile" class="action-btn" title="导入分享文件">
                  <span class="btn-icon">📂</span>
                  <span class="btn-text">导入</span>
                </button>
                <!-- 隐藏的文件输入 -->
                <input ref="fileInput" type="file" accept=".html,.htm" @change="handleFileUpload"
                  style="display: none;" />
                <button @click="handleShowShare" class="action-btn" title="分享链接">
                  <span class="btn-icon">🔗</span>
                  <span class="btn-text">分享</span>
                </button>
              </div>
              <button @click="showSettings = true" class="action-btn settings-btn"
                :class="{ compact: isButtonsCompact }" title="设置选项">
                <span class="btn-icon">⚙️</span>
                <span class="btn-text">设置</span>
              </button>
            </div>
          </div>

          <!-- 分享气泡浮窗 -->
          <div v-if="showSharePopup" class="share-popup-container">
            <div class="share-popup" @click.stop>
              <div class="share-header">
                <span>分享链接</span>
                <button class="share-close" @click="showSharePopup = false">&times;</button>
              </div>
              <div class="share-body">
                <div class="url-input-group">
                  <input ref="shareUrlInput" v-model="shareUrl" type="text" readonly class="url-input" />
                  <div class="button-group">
                    <button @click="previewShareUrl" class="preview-btn" title="预览分享链接">
                      <span class="preview-icon">👁️</span>
                      <span class="preview-text">预览</span>
                    </button>
                    <button @click="copyShareUrl" class="copy-btn" title="复制链接">
                      <span class="copy-icon">📋</span>
                      <span class="copy-text">复制</span>
                    </button>
                  </div>
                </div>

                <!-- 内容大小提示 -->
                <div v-if="shareSizeInfo.isTooLong || shareSizeInfo.recommendedAction !== '内容大小正常'"
                  class="share-size-warning">
                  <span :class="{ 'warning-text': shareSizeInfo.isTooLong }">
                    {{ shareSizeInfo.recommendedAction }}
                  </span>
                  <div class="size-details">
                    内容大小: {{ formatFileSize(shareSizeInfo.originalSize) }} →
                    加密后: {{ formatFileSize(shareSizeInfo.compressedSize) }}
                  </div>
                </div>

                <!-- 下载完整数据文件按钮 -->
                <div class="download-suggestion">
                  <button @click="downloadShareFile" class="download-btn">
                    <span>📥</span>
                    <span>下载完整版分享文件</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="share-overlay" @click="showSharePopup = false"></div>
          </div>

          <!-- 代码编辑器 -->
          <div ref="editorContainer" class="code-editor"></div>

          <!-- 左侧宽度显示 -->
          <div v-if="showWidthInfo" class="width-info left-width-info">
            {{ editorWidth }}px
          </div>
        </div>

        <!-- 分割线 -->
        <div class="resize-handle" :class="{ 'preview-mode': isPreviewMode }" @mousedown="startResize"
          @touchstart="startResize"></div>

        <!-- 预览区域 -->
        <div class="preview-panel"
          :style="{ width: isPreviewMode ? '100%' : 'calc(100% - ' + (editorWidth + 3) + 'px)' }">
          <div class="preview-header">
            <span>{{ pageTitle }}: {{ pageDescription }}</span>
          </div>
          <iframe ref="previewFrame" class="preview-frame">
          </iframe>

          <!-- 编辑/预览模式切换按钮 -->
          <button class="preview-mode-toggle" @click="togglePreviewMode" :title="isPreviewMode ? '切换到编辑模式' : '切换到预览模式'">
            <span class="toggle-text">
              {{ isPreviewMode ? '编辑模式 ⇨' : '⇦ 预览模式' }}
            </span>
          </button>

          <!-- 右侧宽度显示 -->
          <div v-if="showWidthInfo" class="width-info right-width-info">
            {{ previewWidth }}px
          </div>
        </div>
      </div>
    </div>

    <!-- 设置模态对话框 -->
    <div v-if="showSettings" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>资源设置</h3>
          <button class="modal-close" @click="showSettings = false">&times;</button>
        </div>
        <div class="modal-body">
          <!-- 标签页 -->
          <div class="setting-tabs">
            <button v-for="tab in settingTabs" :key="tab.id" :class="{ active: currentSettingTab === tab.id }"
              @click="currentSettingTab = tab.id" class="setting-tab">
              {{ tab.label }}
            </button>
          </div>

          <!-- HTML 设置 -->
          <div v-if="currentSettingTab === 'html'" class="tab-content">
            <div class="setting-item">
              <label>HTML Head内容</label>
              <textarea v-model="headHtmlContent" class="setting-textarea" placeholder="可添加meta标签、link标签等HTML head内容..."
                rows="6">
              </textarea>
            </div>
          </div>

          <!-- CSS 设置 -->
          <div v-if="currentSettingTab === 'css'" class="tab-content">
            <div class="setting-item">
              <label>CSS CDN链接</label>
              <div v-for="(css, index) in cssLinks" :key="index" class="link-input-group">
                <input v-model="cssLinks[index]" type="text" class="setting-input link-input"
                  placeholder="例如：https://cdn.example.com/style.css">
                <button @click="handleRemoveCssLink(index)" class="link-btn remove" title="删除">🗑</button>
                <button @click="handleAddCssLink" v-if="index === cssLinks.length - 1" class="link-btn add"
                  title="添加">➕</button>
              </div>
            </div>
          </div>

          <!-- JS 设置 -->
          <div v-if="currentSettingTab === 'js'" class="tab-content">
            <div class="setting-item">
              <label>JS CDN链接</label>
              <div v-for="(js, index) in jsLinks" :key="index" class="link-input-group">
                <input v-model="jsLinks[index]" type="text" class="setting-input link-input"
                  placeholder="例如：https://cdn.example.com/script.js">
                <button @click="handleRemoveJsLink(index)" class="link-btn remove" title="删除">🗑</button>
                <button @click="handleAddJsLink" v-if="index === jsLinks.length - 1" class="link-btn add"
                  title="添加">➕</button>
              </div>
            </div>
          </div>

          <!-- 页面信息设置 -->
          <div v-if="currentSettingTab === 'page'" class="tab-content">
            <div class="setting-item">
              <label>页面标题</label>
              <input v-model="pageTitle" type="text" class="setting-input" placeholder="例如：我的代码沙盒页面">
            </div>
            <div class="setting-item">
              <label>页面描述</label>
              <textarea v-model="pageDescription" class="setting-textarea" placeholder="例如：这是一个用来展示前端代码的沙盒页面..."
                rows="3">
              </textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="showSettings = false">取消</button>
          <button class="modal-btn confirm" @click="handleSaveSettings">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import jsBeautify from 'js-beautify'
import { buildFullHtml, generateExtendedTemplate } from '@/utils/templateGenerator'
import type { ParsedExampleData } from '@/utils/componentHelpers'
import {
  getCurrentFile,
  getFileContents,
  parseDemoHtml,
  parseUrlCode,
  parseUrlPage,
  parseShareFileContent,
  parseEngineType,
  checkUrlParams,
  saveSettings,
  getLanguageExtension,
  addCssLink,
  removeCssLink,
  addJsLink,
  removeJsLink,
  downloadHtml,
  encryptContent,
  checkShareContentSize,
  optimizedEncryptContent
} from '@/utils/componentHelpers'
import type { FileInfo } from '@/utils/componentHelpers'

// IndexedDB 数据存储
interface PreviewData {
  content: string
  timestamp: number
  used: boolean
}

// 存储预览数据到 IndexedDB
const storePreviewData = async (jsonData: string): Promise<string> => {
  try {
    // 检查 IndexedDB 支持
    if (!window.indexedDB) {
      console.warn('浏览器不支持 IndexedDB，回退到 URL 参数方式')
      // 回退到原来的方式
      const content = encryptContent(jsonData)
      const data = JSON.parse(jsonData)
      previewFrame.value!.src = `./previews/${data.engineType}/default.html?content=${content}`
      return ''
    }

    // 生成短令牌
    const token = generateShortToken()

    const data: PreviewData = {
      content: jsonData,
      timestamp: Date.now(),
      used: false
    }

    // 打开 IndexedDB
    const db = await openIndexedDB()
    const transaction = db.transaction(['previews'], 'readwrite')
    const store = transaction.objectStore('previews')

    // 存储数据
    await store.put(data, token)

    console.log('预览数据已存储，令牌:', token)
    return token
  } catch (error) {
    console.error('存储预览数据失败:', error)
    // 回退到 URL 参数方式
    const content = encryptContent(jsonData)
    const data = JSON.parse(jsonData)
    previewFrame.value!.src = `./previews/${data.engineType}/default.html?content=${content}`
    return ''
  }
}

// 打开 IndexedDB 数据库
const openIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CodeSandboxDB', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('previews')) {
        db.createObjectStore('previews')
      }
    }
  })
}

// 生成短令牌
const generateShortToken = (): string => {
  // 8位字符：大小写字母+数字
  return Math.random()
    .toString(36)
    .substring(2, 10)
    .padEnd(8, '0')
}

// CodeMirror 动态导入
let EditorView: any = null
let basicSetup: any = null
let javascript: any = null
let html: any = null
let css: any = null
let codemirrorTheme: any = null
let EditorState: any = null

// 动态加载 CodeMirror
const loadCodeMirror = async () => {
  if (typeof window !== 'undefined') {
    const { EditorView: EV, basicSetup: BS } = await import('codemirror')
    const { javascript: JS } = await import('@codemirror/lang-javascript')
    const { html: HT } = await import('@codemirror/lang-html')
    const { css: CS } = await import('@codemirror/lang-css')
    const { monokai: OD } = await import('@fsegurai/codemirror-theme-monokai')
    const { EditorState: ES } = await import('@codemirror/state')

    EditorView = EV
    basicSetup = BS
    javascript = JS
    html = HT
    css = CS
    codemirrorTheme = OD
    EditorState = ES
  }
}

// 文件列表
const files = ref<FileInfo[]>([])
// 当前引擎类型
const currentEngineType = ref('default')
// 当前js类型：'' 或 'moudle
const currentJsType = ref('')

// 初始化文件内容
const initFiles = async () => {
  // 检查URL参数类型
  const paramType = checkUrlParams()

  let parsedData: ParsedExampleData | null

  switch (paramType?.toLowerCase()) {
    case 'code':
      // 处理code参数：从URL参数中加载代码内容
      parsedData = parseUrlCode()
      console.log('从URL参数加载代码内容成功，跳过默认模板加载')
      break;
    case 'page':
      // 处理page参数：从指定的模板数据页URL加载内容
      parsedData = await parseUrlPage()
      console.log('从指定模板数据页加载代码内容成功')
      break;
    default:
      parsedData = await parseDemoHtml('./examples/default/default.html')
      console.log('未检测到有效URL参数，加载默认模板内容')
      break;
  }

  // 设置模板类型
  currentEngineType.value = parsedData!.engineType || 'default'
  currentJsType.value = parsedData!.jsType || ''

  files.value = [
    {
      name: 'index.html',
      language: 'html',
      content: parsedData!.html || '<div>请编写你的HTML代码</div>'
    },
    {
      name: 'style.css',
      language: 'css',
      content: parsedData!.css || '/* 请编写你的CSS样式 */'
    },
    {
      name: 'script.js',
      language: 'javascript',
      content: parsedData!.js || '// 请编写你的JavaScript代码'
    }
  ]

  // 更新设置状态 - 仅使用URL参数中的设置数据
  headHtmlContent.value = parsedData!.headHtmlContent || ''
  cssLinks.value = parsedData!.cssLinks.length > 0 ? parsedData!.cssLinks : ['']
  jsLinks.value = parsedData!.jsLinks.length > 0 ? parsedData!.jsLinks : ['']

  // 更新标题和描述
  pageTitle.value = parsedData!.title || 'CodeSandbox Preview'
  pageDescription.value = parsedData!.description || 'A code sandbox preview page'
}

const currentFile = ref('script.js') // 当前编辑的文件名
const editorContainer = ref<HTMLElement>() // 编辑器容器引用
const previewFrame = ref<HTMLIFrameElement>() // 预览iframe引用
const editorWidth = ref(650) // 默认编辑器宽度
const previewWidth = ref(0) // 预览区域宽度
const showWidthInfo = ref(false) // 是否显示宽度信息
const showSettings = ref(false) // 是否显示设置模态框
const isButtonsCompact = ref(false) // 按钮是否处于紧凑模式

// 编辑/预览模式相关状态
const isPreviewMode = ref(false) // 是否为预览模式

// 分享功能相关状态
const showSharePopup = ref(false) // 是否显示分享气泡浮窗
const shareUrlInput = ref<HTMLInputElement>() // 分享链接输入框引用
const currentUrl = ref('') // 当前页面URL（不带参数）
const shareUrl = ref('') // 生成的分享链接
const shareSizeInfo = ref({ // 分享内容大小信息
  isTooLong: false,
  originalSize: 0,
  compressedSize: 0,
  recommendedAction: '内容大小正常'
})

// 文件导入相关状态
const fileInput = ref<HTMLInputElement>() // 文件输入框引用
const isImporting = ref(false) // 是否正在导入
const isDragOver = ref(false) // 是否正在拖拽悬停

// 设置相关状态
const currentSettingTab = ref('html') // 当前设置标签页
const settingTabs = [
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'js', label: 'JS' },
  { id: 'page', label: '页面信息' }
]
const headHtmlContent = ref('') // HTML head内容
const cssLinks = ref(['']) // CSS CDN链接数组
const jsLinks = ref(['']) // JS CDN链接数组

// 标题和描述状态
const pageTitle = ref('CodeSandbox Preview') // 页面标题
const pageDescription = ref('A code sandbox preview page') // 页面描述

let editor: any = null
let isResizing = false
let startX = 0
let startWidth = 0
let hideTimeout: any = null // 隐藏延迟定时器

// 切换文件
const switchFile = (fileName: string) => {
  currentFile.value = fileName
  updateEditor()
}

// 更新编辑器内容
const updateEditor = () => {
  const file = getCurrentFile(files.value, currentFile.value)
  if (!file || !editor) return

  // 确保模块已加载
  if (!EditorState || !EditorView || !basicSetup) {
    console.warn('CodeMirror 模块未加载，跳过更新')
    return
  }

  const newState = EditorState.create({
    doc: file.content,
    extensions: [
      basicSetup,
      getLanguageExtension(file.language) === 'html' ? html() :
        getLanguageExtension(file.language) === 'css' ? css() :
          getLanguageExtension(file.language) === 'javascript' ? javascript() : null,
      codemirrorTheme,
      EditorView.updateListener.of((update: { docChanged: boolean; state: { doc: { toString: () => string } } }) => {
        if (update.docChanged) {
          file.content = update.state.doc.toString()
        }
      })
    ]
  })

  editor.setState(newState)
}

// 格式化代码
const formatCode = () => {
  // 格式化所有文件
  files.value.forEach(file => {
    let formatted = file.content

    try {
      switch (file.language.toLowerCase()) {
        case 'html':
          formatted = jsBeautify.html(formatted, {
            indent_size: 2,
            indent_char: ' ',
            max_preserve_newlines: 1,
            preserve_newlines: true,
            indent_scripts: 'normal',
            end_with_newline: false,
            indent_inner_html: false
          })
          break;
        case 'css':
          formatted = jsBeautify.css(formatted, {
            indent_size: 2,
            indent_char: ' ',
            selector_separator_newline: true,
            newline_between_rules: true,
            preserve_newlines: true
          })
          break;
        case 'javascript':
        case 'js':
          formatted = jsBeautify.js(formatted, {
            indent_size: 2,
            indent_char: ' ',
            preserve_newlines: true,
            brace_style: 'collapse'
          })
          break;
        default:
          break;
      }

      file.content = formatted
    } catch (error) {
      console.error(`格式化 ${file.name} 失败:`, error)
    }
  })

  // 更新当前编辑器显示
  updateEditor()
}

// 运行代码
const runCode = async () => {
  if (!previewFrame.value) return

  // 获取当前编辑内容
  const { htmlContent, cssContent, jsContent } = getFileContents(files.value)

  const data: ParsedExampleData = {
    engineType: currentEngineType.value,
    html: htmlContent,
    css: cssContent,
    js: jsContent,
    title: pageTitle.value,
    description: pageDescription.value,
    headHtmlContent: headHtmlContent.value,
    cssLinks: cssLinks.value,
    jsLinks: jsLinks.value,
    jsType: currentJsType.value
  }

  // 使用IndexedDB + 令牌机制传递数据
  const jsonData = JSON.stringify(data)
  const token = await storePreviewData(jsonData)

  // 如果获取到token，使用token方式；否则已在storePreviewData中处理回退
  if (token) {
    previewFrame.value.src = `./previews/${data.engineType}/default.html?token=${token}`
  }
  // 如果token为空，说明在storePreviewData中已经处理了回退逻辑

  // 解密在 public\previews\index.js
}

// 保存设置
const handleSaveSettings = () => {
  // 调用工具函数保存设置
  saveSettings(headHtmlContent.value, cssLinks.value, jsLinks.value)

  // 关闭设置面板
  showSettings.value = false
}

// 下载完整HTML代码
const downloadFullHtml = async () => {
  // 获取当前编辑内容
  const { htmlContent, cssContent, jsContent } = getFileContents(files.value)

  const data: ParsedExampleData = {
    engineType: currentEngineType.value,
    html: htmlContent,
    css: cssContent,
    js: jsContent,
    title: pageTitle.value,
    description: pageDescription.value,
    headHtmlContent: headHtmlContent.value,
    cssLinks: cssLinks.value,
    jsLinks: jsLinks.value,
    jsType: currentJsType.value
  }

  const fullHtml = await buildFullHtml(data)
  // 下载完整HTML文件
  downloadHtml(fullHtml, data.title ? `${data.title}.html` : 'code-sandbox.html')

  // 下载扩展的HTML模板文件（包含所有编辑和设置数据）
  const templateHtml = generateExtendedTemplate(data)

  downloadHtml(templateHtml, data.title ? `${data.title}-template.html` : 'code-sandbox-template.html')
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 拖拽事件处理函数
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()

  // 添加拖拽悬停样式
  isDragOver.value = true
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()

  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()

  // 检查是否真的离开了编辑器面板
  const editorPanel = event.currentTarget as HTMLElement
  if (!editorPanel.contains(event.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()

  isDragOver.value = false

  const files = event.dataTransfer?.files
  if (!files || files.length === 0) {
    return
  }

  const file = files[0]

  // 检查文件类型
  const fileName = file.name.toLowerCase()
  const isHtmlFile = fileName.endsWith('.html') || fileName.endsWith('.htm') ||
    file.type === 'text/html' || file.type === 'application/html'

  if (!isHtmlFile) {
    console.error('请拖入HTML文件')
    alert('请拖入 .html 或 .htm 文件')
    return
  }

  // 检查文件大小（限制10MB）
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    console.error('文件过大')
    alert('文件过大，请拖入小于10MB的文件')
    return
  }

  try {
    isImporting.value = true

    // 读取文件内容
    const fileContent = await readFileContent(file)

    // 解析文件内容
    const parsedData = await parseShareFileContent(fileContent)

    // 应用解析的数据到当前编辑器
    await applyImportedData(parsedData)

    console.log('拖拽文件导入成功:', parsedData.title || '未命名项目')

    // 显示成功提示（可选）
    // alert('文件导入成功！')

  } catch (error) {
    console.error('拖拽文件导入失败:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    alert(`文件导入失败: ${errorMessage}`)
  } finally {
    isImporting.value = false
  }
}

// 处理文件导入
const handleImportFile = () => {
  if (!fileInput.value) {
    console.error('文件输入框未找到')
    return
  }

  fileInput.value.click()
}

// 处理文件上传
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    return
  }

  // 检查文件类型
  const validTypes = ['text/html', 'application/html', '.html', '.htm']
  const fileName = file.name.toLowerCase()
  const isHtmlFile = fileName.endsWith('.html') || fileName.endsWith('.htm') ||
    file.type === 'text/html' || file.type === 'application/html'

  if (!isHtmlFile) {
    console.error('请上传HTML文件')
    alert('请上传 .html 或 .htm 文件')
    return
  }

  // 检查文件大小（限制10MB）
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    console.error('文件过大')
    alert('文件过大，请上传小于10MB的文件')
    return
  }

  try {
    isImporting.value = true

    // 读取文件内容
    const fileContent = await readFileContent(file)

    // 解析文件内容
    const parsedData = await parseShareFileContent(fileContent)
    console.log('解析完成，得到数据:', parsedData)

    // 应用解析的数据到当前编辑器
    await applyImportedData(parsedData)

    console.log('文件导入成功:', parsedData.title || '未命名项目')

    // 显示成功提示（可选）
    // alert('文件导入成功！')

  } catch (error) {
    console.error('文件导入失败:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    alert(`文件导入失败: ${errorMessage}`)
  } finally {
    isImporting.value = false
    // 清空文件输入，允许重新选择同一文件
    if (target) {
      target.value = ''
    }
  }
}

// 读取文件内容
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target?.result
      if (typeof content === 'string') {
        resolve(content)
      } else {
        reject(new Error('文件内容读取失败'))
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取错误'))
    }

    reader.readAsText(file, 'utf-8')
  })
}

// 应用导入的数据到编辑器
const applyImportedData = async (data: ParsedExampleData) => {
  try {
    console.log('开始应用导入数据，传入的数据:', data)
    console.log('应用前的files.value:', files.value)

    // 设置模板类型（与page参数处理一致）
    currentEngineType.value = data.engineType || 'default'
    currentJsType.value = data.jsType || ''
    console.log('设置模板类型后 - currentEngineType:', currentEngineType.value, 'currentJsType:', currentJsType.value)

    // 重新创建文件数组（与page参数处理一致）
    files.value = [
      {
        name: 'index.html',
        language: 'html',
        content: data.html || '<!-- 请编写你的HTML代码 -->'
      },
      {
        name: 'style.css',
        language: 'css',
        content: data.css || '/* 请编写你的CSS样式 */'
      },
      {
        name: 'script.js',
        language: 'javascript',
        content: data.js || '// 请编写你的JavaScript代码'
      }
    ]
    console.log('重新创建files.value后的结果:', files.value)

    // 更新设置状态 - 仅使用导入数据中的设置数据（与page参数处理一致）
    headHtmlContent.value = data.headHtmlContent || ''
    cssLinks.value = data.cssLinks.length > 0 ? data.cssLinks : ['']
    jsLinks.value = data.jsLinks.length > 0 ? data.jsLinks : ['']
    console.log('设置状态更新后 - headHtmlContent长度:', headHtmlContent.value.length,
      'cssLinks数量:', cssLinks.value.length,
      'jsLinks数量:', jsLinks.value.length)

    // 更新标题和描述（与page参数处理一致）
    pageTitle.value = data.title || 'CodeSandbox Preview'
    pageDescription.value = data.description || 'A code sandbox preview page'
    console.log('标题描述更新后 - pageTitle:', pageTitle.value, 'pageDescription:', pageDescription.value)

    console.log('导入的数据已应用到编辑器:', {
      engineType: currentEngineType.value,
      title: pageTitle.value,
      description: pageDescription.value,
      jsType: currentJsType.value,
      cssLinksCount: cssLinks.value.length,
      jsLinksCount: jsLinks.value.length,
      filesCount: files.value.length,
      htmlContentLength: files.value[0]?.content?.length || 0,
      cssContentLength: files.value[1]?.content?.length || 0,
      jsContentLength: files.value[2]?.content?.length || 0
    })

    // 自动运行导入的代码
    console.log('开始自动运行导入的代码...')

    // 使用 nextTick 确保DOM更新后再运行代码
    await nextTick()

    // 延迟一小段时间确保编辑器完全更新
    setTimeout(() => {
      // 强制刷新编辑器显示
      refreshEditors()

      // 再延迟一下运行代码，确保编辑器完全刷新
      setTimeout(() => {
        if (runCode) {
          runCode()
          console.log('导入代码已自动运行')
        } else {
          console.warn('runCode函数不可用')
        }
      }, 200)
    }, 300)

  } catch (error) {
    console.error('应用导入数据失败:', error)
    throw new Error('应用导入数据失败')
  }
}

// 强制刷新编辑器显示
const refreshEditors = () => {
  try {
    console.log('开始刷新编辑器显示...')

    // 强制更新所有文件的编辑器显示
    const currentFileName = currentFile.value

    // 使用 nextTick 确保 DOM 更新
    nextTick(() => {
      // 强制更新当前显示的文件编辑器
      updateEditor()
      console.log('编辑器已强制刷新，当前文件:', currentFileName)

      // 如果需要，可以短暂切换到其他文件再切回来以确保刷新
      const otherFile = files.value.find(f => f.name !== currentFileName)
      if (otherFile) {
        // 切换到其他文件
        currentFile.value = otherFile.name
        setTimeout(() => {
          // 切换回原文件，触发双重刷新
          currentFile.value = currentFileName
          console.log('编辑器双重刷新完成')
        }, 50)
      } else {
        // 如果只有一个文件或切换失败，直接更新编辑器
        updateEditor()
      }
    })

  } catch (error) {
    console.error('刷新编辑器失败:', error)
  }
}

// 下载分享文件
const downloadShareFile = () => {
  // 获取当前编辑内容
  const { htmlContent, cssContent, jsContent } = getFileContents(files.value)

  const data: ParsedExampleData = {
    engineType: currentEngineType.value,
    html: htmlContent,
    css: cssContent,
    js: jsContent,
    title: pageTitle.value || 'CodeSandbox分享',
    description: pageDescription.value,
    headHtmlContent: headHtmlContent.value,
    cssLinks: cssLinks.value,
    jsLinks: jsLinks.value,
    jsType: currentJsType.value
  }

  // 生成扩展的HTML模板内容
  const templateContent = generateExtendedTemplate(data)

  // 生成带参数的分享链接用于文件内说明
  const url = new URL(window.location.href)
  url.search = '' // 清空所有参数

  // 添加分享说明注释
  const shareInfo = `<!--
CodeSandbox 分享文件
生成时间: ${new Date().toLocaleString()}
页面标题: ${data.title}
原始页面链接: ${url.toString()}
-->
`

  const finalContent = shareInfo + templateContent

  // 下载文件
  const filename = `${data.title || 'CodeSandbox'}-share-${Date.now()}.html`
  downloadHtml(finalContent, filename)

  // 关闭分享弹窗
  showSharePopup.value = false

  console.log('分享文件已下载:', filename)
}

// 显示分享弹窗
const handleShowShare = () => {
  generateShareUrl()
  showSharePopup.value = true
}

// 生成分享链接
const generateShareUrl = () => {
  // 获取当前URL并去除参数
  const url = new URL(window.location.href)
  url.search = '' // 清空所有参数
  currentUrl.value = url.toString()

  // 获取当前编辑内容
  const { htmlContent, cssContent, jsContent } = getFileContents(files.value)

  const data: ParsedExampleData = {
    engineType: currentEngineType.value,
    html: htmlContent,
    css: cssContent,
    js: jsContent,
    title: pageTitle.value,
    description: pageDescription.value,
    headHtmlContent: headHtmlContent.value,
    cssLinks: cssLinks.value,
    jsLinks: jsLinks.value,
    jsType: currentJsType.value
  }

  // 生成扩展的HTML模板内容
  const templateContent = generateExtendedTemplate(data)

  // 对内容进行加密处理（XOR + Base64双重保护）
  const encryptedContent = encryptContent(templateContent)

  // 检查内容大小（仅用于显示提示）
  shareSizeInfo.value = checkShareContentSize(encryptedContent)
  shareSizeInfo.value.originalSize = templateContent.length
  shareSizeInfo.value.compressedSize = encryptedContent.length // 使用加密后的长度

  // 生成带参数的分享链接
  shareUrl.value = `${currentUrl.value}?code=${encryptedContent}`

  console.log('分享链接生成完成:', {
    原始大小: templateContent.length,
    加密后大小: encryptedContent.length,
    是否过长: shareSizeInfo.value.isTooLong,
    建议: shareSizeInfo.value.recommendedAction
  })
}

// 预览分享链接
const previewShareUrl = () => {
  if (!shareUrl.value) {
    console.error('分享链接为空')
    return
  }

  try {
    // 在新标签页中打开分享链接
    const previewWindow = window.open(shareUrl.value, '_blank')

    if (!previewWindow) {
      // 如果弹窗被阻止，提示用户
      console.warn('弹窗被浏览器阻止，请允许弹窗或手动复制链接')
      // 可以在这里添加用户提示，比如使用 toast 或 alert
      return
    }

    console.log('预览窗口已打开:', shareUrl.value)

    // 可选：预览窗口打开后关闭分享弹窗
    // showSharePopup.value = false

  } catch (error) {
    console.error('打开预览窗口失败:', error)
    // 如果 window.open 失败，可以尝试其他方式
    try {
      // 备用方案：使用 location.href（当前窗口）
      console.log('使用当前窗口打开预览')
      window.location.href = shareUrl.value
    } catch (fallbackError) {
      console.error('所有预览方案都失败:', fallbackError)
    }
  }
}

// 复制分享链接
const copyShareUrl = async () => {
  if (!shareUrlInput.value) return

  try {
    // 选中输入框中的文本
    shareUrlInput.value.select()
    shareUrlInput.value.setSelectionRange(0, 99999) // 对于移动设备

    // 使用 Clipboard API 复制文本
    await navigator.clipboard.writeText(shareUrl.value)

    // 关闭气泡浮窗
    showSharePopup.value = false

    // 可以添加一个简单的提示信息（可选）
    console.log('分享链接已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    // 备用方案：使用 document.execCommand
    try {
      document.execCommand('copy')
      showSharePopup.value = false
      console.log('分享链接已复制到剪贴板')
    } catch (fallbackError) {
      console.error('备用复制方法也失败:', fallbackError)
    }
  }
}

// 设置相关方法

// 添加CSS链接输入框
const handleAddCssLink = () => {
  addCssLink(cssLinks.value)
}

// 删除CSS链接输入框
const handleRemoveCssLink = (index: number) => {
  removeCssLink(cssLinks.value, index)
}

// 添加JS链接输入框
const handleAddJsLink = () => {
  addJsLink(jsLinks.value)
}

// 删除JS链接输入框
const handleRemoveJsLink = (index: number) => {
  removeJsLink(jsLinks.value, index)
}

// 切换编辑/预览模式
const togglePreviewMode = () => {
  isPreviewMode.value = !isPreviewMode.value

  // 如果切换到预览模式，立即运行一次代码确保预览最新内容
  if (isPreviewMode.value) {
    setTimeout(runCode, 100)
  }
}

// 初始化编辑器
onMounted(async () => {

  currentEngineType.value = await parseEngineType()
  // 首先初始化文件内容
  await initFiles()

  // 然后加载 CodeMirror 模块
  await loadCodeMirror()

  if (!editorContainer.value) return

  const file = getCurrentFile(files.value, currentFile.value)
  if (!file) return

  // 确保所有需要的模块都已加载
  if (!EditorState || !EditorView || !basicSetup) {
    console.error('CodeMirror 模块未正确加载')
    return
  }

  editor = new EditorView({
    state: EditorState.create({
      doc: file.content,
      extensions: [
        basicSetup,
        getLanguageExtension(file.language) === 'html' ? html() :
          getLanguageExtension(file.language) === 'css' ? css() :
            getLanguageExtension(file.language) === 'javascript' ? javascript() : null,
        codemirrorTheme,
        EditorView.updateListener.of((update: { docChanged: boolean; state: { doc: { toString: () => string } } }) => {
          if (update.docChanged) {
            file.content = update.state.doc.toString()
          }
        })
      ]
    }),
    parent: editorContainer.value
  })

  // 初始运行一次
  setTimeout(runCode, 100)
})

// 开始调整大小
const startResize = (e: MouseEvent | TouchEvent) => {
  e.preventDefault()
  isResizing = true
  startX = e instanceof MouseEvent ? e.clientX : e.touches[0]!.clientX
  startWidth = editorWidth.value

  // 显示宽度信息
  showWidthInfo.value = true

  // 清除之前的隐藏定时器
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }

  // 添加事件监听器到 window 而不是 document，提高稳定性
  window.addEventListener('mousemove', handleResize)
  window.addEventListener('mouseup', stopResize)
  window.addEventListener('touchmove', handleResize, { passive: false })
  window.addEventListener('touchend', stopResize)

  // 防止文本选中和拖拽
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'

  // 添加半透明蒙层提高视觉反馈
  const overlay = document.createElement('div')
  overlay.id = 'resize-overlay'
  overlay.style.cssText = `
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: transparent;
z-index: 9999;
cursor: col-resize;
`
  document.body.appendChild(overlay)
}

// 缓存DOM元素以提高性能
let cachedContainer: HTMLElement | null = null
let cachedPreviewPanel: HTMLElement | null = null

// 处理调整大小
const handleResize = (e: MouseEvent | TouchEvent) => {
  if (!isResizing) return
  e.preventDefault()

  const currentX = e instanceof MouseEvent ? e.clientX : e.touches[0]!.clientX
  const deltaX = currentX - startX

  // 获取容器宽度（缓存以提高性能）
  if (!cachedContainer) {
    cachedContainer = document.querySelector('.editor-preview-container') as HTMLElement
  }
  const containerWidth = cachedContainer?.clientWidth || 1200

  const minWidth = 500 // 左侧最小宽度
  const maxWidth = containerWidth - 50 - 3 // 右侧保留50px宽度（减去分割线宽度）
  const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX))

  throttleUpdateButtonsMode(newWidth)

  // 直接更新宽度值，避免DOM操作在动画帧中
  editorWidth.value = newWidth
  previewWidth.value = containerWidth - newWidth - 3

  // 实时更新预览区域宽度（使用绝对宽度计算，避免百分比计算误差）
  if (previewFrame.value) {
    if (!cachedPreviewPanel) {
      cachedPreviewPanel = previewFrame.value.closest('.preview-panel') as HTMLElement
    }
    if (cachedPreviewPanel) {
      // 临时禁用预览面板的CSS过渡动画，避免在拖拽时执行动画逻辑
      cachedPreviewPanel.style.transition = 'none'
      // 使用绝对宽度计算，确保布局稳定
      cachedPreviewPanel.style.width = `${containerWidth - newWidth - 3}px`
      // 强制重绘以提升性能
      cachedPreviewPanel.style.display = 'block'
    }
  }

  // 临时禁用编辑器面板的CSS过渡动画
  const editorPanel = document.querySelector('.editor-panel') as HTMLElement
  if (editorPanel) {
    editorPanel.style.transition = 'none'
  }
}

// 缓存DOM元素，避免重复查询
let cachedButtonGroup: HTMLElement | null = null
let cachedSettingsBtn: HTMLElement | null = null

let lastWidth = 0
let lastCompactState = false

const throttleUpdateButtonsMode = (width: number) => {
  // 如果宽度变化很小，跳过更新
  if (Math.abs(width - lastWidth) < 5) return
  lastWidth = width

  // 立即检查是否需要更新，避免不必要的延迟
  const shouldBeCompact = width < 650
  if (lastCompactState === shouldBeCompact) return

  updateButtonsMode(width)
}

// 更新按钮显示模式
const updateButtonsMode = (width: number) => {
  // 当编辑器宽度小于650px时，切换到紧凑模式（只显示图标）
  const shouldBeCompact = width < 650

  // 如果状态没有变化，直接返回
  if (lastCompactState === shouldBeCompact) return
  lastCompactState = shouldBeCompact

  // 缓存DOM元素，避免重复查询
  if (!cachedButtonGroup) {
    cachedButtonGroup = document.querySelector('.button-group') as HTMLElement
  }
  if (!cachedSettingsBtn) {
    cachedSettingsBtn = document.querySelector('.settings-btn') as HTMLElement
  }

  if (cachedButtonGroup) {
    if (shouldBeCompact) {
      cachedButtonGroup.classList.add('compact')
    } else {
      cachedButtonGroup.classList.remove('compact')
    }
  }

  if (cachedSettingsBtn) {
    if (shouldBeCompact) {
      cachedSettingsBtn.classList.add('compact')
    } else {
      cachedSettingsBtn.classList.remove('compact')
    }
  }

  // 立即更新Vue响应式状态，无需额外延迟
  isButtonsCompact.value = shouldBeCompact
}

// 停止调整大小
const stopResize = () => {
  if (!isResizing) return

  isResizing = false

  // 恢复CSS过渡动画
  const previewPanel = document.querySelector('.preview-panel') as HTMLElement
  if (previewPanel) {
    previewPanel.style.transition = 'width 0.3s ease'
  }

  const editorPanel = document.querySelector('.editor-panel') as HTMLElement
  if (editorPanel) {
    editorPanel.style.transition = 'transform 0.3s ease, opacity 0.3s ease, width 0.3s ease'
  }

  // 延迟隐藏宽度信息（2秒后消失）
  hideTimeout = setTimeout(() => {
    showWidthInfo.value = false
  }, 2000)

  // 移除事件监听器
  window.removeEventListener('mousemove', handleResize)
  window.removeEventListener('mouseup', stopResize)
  window.removeEventListener('touchmove', handleResize)
  window.removeEventListener('touchend', stopResize)

  // 恢复文本选择和光标
  document.body.style.userSelect = ''
  document.body.style.cursor = ''

  // 移除蒙层
  const overlay = document.getElementById('resize-overlay')
  if (overlay) {
    overlay.remove()
  }

  // 清除缓存的DOM元素，以便下次重新获取
  cachedContainer = null
  cachedPreviewPanel = null
}

// 清理
onUnmounted(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }

  // 确保清理事件监听器
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', handleResize)
  document.removeEventListener('touchend', stopResize)
})
</script>

<style lang="less" scoped>
.code-sandbox-container {
  width: 100%;
  height: 100vh;
  font-family: 'Monaco', 'Courier New', monospace;
}

.code-editor-preview {
  width: 100%;
  height: 100%;
  background: #1e1e1e;
}

.editor-preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  position: relative;
}

// 编辑器区域
.editor-panel {
  background: #1e1e1e;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  position: relative;
  // 使用transform动画替代width动画，避免重排
  transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease; // 添加transform动画

  // 拖拽悬停样式
  &.drag-over {
    background: #2a2a2a;
    border: 2px dashed #007acc;

    // 添加拖拽提示文字
    &::after {
      content: "📁 拖入HTML文件 (.html, .htm)";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #007acc;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      pointer-events: none;
      z-index: 1000;
      background: rgba(42, 42, 42, 0.95);
      padding: 15px 25px;
      border-radius: 8px;
      border: 2px solid #007acc;
      box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
    }
  }

  &.preview-mode {
    opacity: 0; // 预览模式下完全透明
    pointer-events: none; // 禁止交互
    transform: translateX(-100%); // 平滑移出屏幕
  }

  .editor-toolbar {
    background: #252526;
    border-bottom: 1px solid #3e3e42;
    padding: 0 16px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .editor-tabs {
      display: flex;
      gap: 4px;

      .editor-tab {
        background: transparent;
        border: 1px solid transparent;
        border-bottom: none;
        color: #cccccc;
        padding: 8px 16px;
        border-radius: 4px 4px 0 0;
        cursor: pointer;
        font-size: 13px;
        font-family: inherit;

        &:hover {
          background: #2a2d2e;
        }

        &.active {
          background: #1e1e1e;
          border-color: #3e3e42;
          color: #ffffff;
        }
      }
    }

    .editor-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-left: 16px;

      .button-group {
        display: flex;
        gap: 0;
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid #5a5a5a;

        .action-btn {
          background: #424242;
          border: none;
          color: #ffffff;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 12px;
          font-family: inherit;
          border-radius: 0;
          height: 28px;
          display: flex;
          align-items: center;
          gap: 4px;
          line-height: 1;
          position: relative;
          min-width: auto;
          // 使用will-change优化动画性能
          will-change: background-color;
          transition: background-color 0.2s ease; // 只动画必要的属性

          &:hover {
            background: #4a4a4a;
          }

          &.primary {
            background: #007acc;

            &:hover {
              background: #118bee;
            }
          }

          &:not(:last-child) {
            border-right: 1px solid #5a5a5a;
          }

          .btn-icon {
            font-size: 14px;
            flex-shrink: 0;
          }

          .btn-text {
            white-space: nowrap;
            // 移除不必要的动画
            transition: none;
          }

          // 响应式：当容器宽度不足时隐藏文字
          @media (max-width: 1200px) {
            padding: 4px 6px;
          }
        }

        // 窄屏模式：只显示图标
        &.compact .action-btn {
          .btn-text {
            display: none;
          }

          .btn-icon {
            margin-right: 0;
          }
        }
      }

      .settings-btn {
        background: #2d2d2d;
        border: 1px solid #5a5a5a;
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-family: inherit;
        height: 28px;
        display: flex;
        align-items: center;
        gap: 4px;
        line-height: 1;
        position: relative;
        will-change: background-color;
        transition: background-color 0.2s ease; // 只动画必要的属性

        &:hover {
          background: #3d3d3d;
        }

        .btn-icon {
          font-size: 14px;
          flex-shrink: 0;
        }

        .btn-text {
          white-space: nowrap;
          // 移除不必要的动画
          transition: none;
        }

        // 窄屏模式：只显示图标
        &.compact {
          .btn-text {
            display: none;
          }

          .btn-icon {
            margin-right: 0;
          }
        }
      }

      button {
        span {
          margin-top: 2px;
        }
      }
    }
  }

  .code-editor {
    flex: 1;
    width: 100%;
    font-family: 'Monaco', 'Courier New', monospace;
    overflow-y: scroll;
    scrollbar-width: none;
  }
}

// 分割线
.resize-handle {
  width: 6px;
  background: #3e3e42;
  cursor: col-resize;
  position: relative;
  z-index: 20;
  // 减少动画属性，只动画必要的属性
  transition: background-color 0.2s ease; // 简化为只动画背景色

  &.preview-mode {
    width: 0px; // 预览模式下宽度设为0
    opacity: 0; // 完全透明
    pointer-events: none; // 禁止交互
    // 预览模式下添加transform过渡
    transition: transform 0.3s ease, opacity 0.3s ease, background-color 0.2s ease;
  }

  // 增加可点击区域
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -6px;
    width: 12px;
    height: 100%;
    background: transparent;
    cursor: col-resize;

    .preview-mode & {
      display: none; // 预览模式下隐藏可点击区域
    }
  }

  &:hover {
    background: #007acc;
    // 移除宽度变化动画，避免布局重排
  }

  &:active {
    background: #005a9e;
    // 移除宽度变化动画
  }

  // 拖拽时的视觉反馈
  &.resizing {
    background: #005a9e !important;
    // 移除宽度变化动画
  }
}

// 预览区域
.preview-panel {
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  position: relative;
  min-width: 50px; // 确保右侧最小宽度为50px
  // 使用width动画，确保布局稳定
  transition: width 0.3s ease;

  .preview-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.4); // 灰度半透明背景
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    color: white;
    text-align: center; // 文字居中显示
    z-index: 5; // 确保显示在预览区域上方
  }

  .preview-frame {
    width: 100%;
    height: 100%; // 占满父容器全部高度
    border: none;
    background: white;
  }

  // 编辑/预览模式切换按钮
  .preview-mode-toggle {
    position: absolute;
    left: 0px; // 紧贴左侧边框
    bottom: 16px; // 距底部16px
    background: rgba(0, 0, 0, 0.4); // 背景色rgba(0,0,0,0.4)
    border: none;
    color: white; // 字体颜色白色
    padding: 8px 12px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    border-radius: 0 15px 15px 0; // 左上左下直角，右上右下圆角
    z-index: 10;
    // 优化动画：只动画必要的属性，使用will-change
    will-change: transform, background-color;
    transition: transform 0.2s ease, background-color 0.2s ease; // 简化为只动画变换和背景色
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

    &:hover {
      background: rgba(0, 0, 0, 0.6);
      transform: translateX(-2px);
    }

    &:active {
      background: rgba(0, 0, 0, 0.7);
      transform: translateX(0);
    }

    .toggle-text {
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      margin-top: 2px;
    }
  }
}

// 响应式布局
@media (max-width: 768px) {
  .editor-preview-container {
    flex-direction: column;
  }

  .editor-panel {
    width: 100% !important;
    height: 50%;
  }

  .resize-handle {
    width: 100%;
    height: 3px;
    cursor: row-resize;

    &:hover {
      background: #007acc;
    }
  }

  .preview-panel {
    width: 100% !important;
    height: 50%;
  }
}

// 代码编辑器样式覆盖
:deep(.cm-editor) {
  height: 100%;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
}

:deep(.cm-scroller) {
  overflow: auto;
}

// 宽度信息显示
.width-info {
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
  pointer-events: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: opacity 0.3s ease;

  &.left-width-info {
    bottom: 10px;
    right: 10px;
  }

  &.right-width-info {
    bottom: 10px;
    left: 10px;
  }
}

// 模态对话框样式
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #252526;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  background: #2d2d2d;
  padding: 16px 20px;
  border-bottom: 1px solid #3e3e42;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
  }

  .modal-close {
    background: none;
    border: none;
    color: #cccccc;
    font-size: 20px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;

    &:hover {
      background: #3e3e42;
      color: #ffffff;
    }
  }
}

.modal-body {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.setting-item {
  margin-bottom: 20px;

  label {
    display: block;
    color: #cccccc;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
  }

  .setting-select {
    width: 100%;
    background: #1e1e1e;
    border: 1px solid #3e3e42;
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #007acc;
    }
  }

  .setting-input {
    width: 95%;
    background: #1e1e1e;
    border: 1px solid #3e3e42;
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #007acc;
    }
  }

  .setting-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: #007acc;
    }
  }
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #3e3e42;
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  .modal-btn {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid #3e3e42;

    &.cancel {
      background: #424242;
      color: #ffffff;

      &:hover {
        background: #4a4a4a;
      }
    }

    &.confirm {
      background: #007acc;
      color: #ffffff;
      border-color: #007acc;

      &:hover {
        background: #118bee;
      }
    }
  }
}

// 设置标签页样式
.setting-tabs {
  display: flex;
  border-bottom: 1px solid #3e3e42;
  margin-bottom: 20px;

  .setting-tab {
    background: transparent;
    border: none;
    color: #cccccc;
    padding: 12px 20px;
    cursor: pointer;
    font-size: 14px;
    font-family: inherit;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;

    &:hover {
      color: #ffffff;
      background: #2d2d2d;
    }

    &.active {
      color: #007acc;
      border-bottom-color: #007acc;
      background: #1e1e1e;
    }
  }
}

// 标签页内容
.tab-content {
  min-height: 200px;
}

// 设置文本区域
.setting-textarea {
  width: 95%;
  background: #1e1e1e;
  border: 1px solid #3e3e42;
  color: #ffffff;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Monaco', 'Courier New', monospace;
  resize: vertical;
  min-height: 120px;

  &:focus {
    outline: none;
    border-color: #007acc;
  }

  &::placeholder {
    color: #666666;
  }
}

// 链接输入组
.link-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;

  .link-input {
    flex: 1;
    background: #1e1e1e;
    border: 1px solid #3e3e42;
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #007acc;
    }

    &::placeholder {
      color: #666666;
    }
  }

  .link-btn {
    background: #424242;
    border: none;
    color: #ffffff;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;

    &:hover {
      background: #4a4a4a;
    }

    &.remove {
      background: #d32f2f;

      &:hover {
        background: #f44336;
      }
    }

    &.add {
      background: #388e3c;

      &:hover {
        background: #4caf50;
      }
    }
  }
}

// 响应式模态框
@media (max-width: 768px) {
  .modal-content {
    width: 95vw;
    margin: 20px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .setting-tabs {
    .setting-tab {
      padding: 8px 12px;
      font-size: 12px;
    }
  }

  .link-input-group {
    flex-direction: column;
    gap: 4px;

    .link-input {
      width: 100%;
    }

    .link-btn {
      width: 100%;
    }
  }
}

// 分享气泡浮窗样式
.share-popup-container {
  position: absolute;
  top: 60px;
  right: 16px;
  z-index: 2000;
}

.share-popup {
  background: #252526;
  border: 1px solid #3e3e42;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  width: 400px;
  max-width: 90vw;
  position: relative;
  z-index: 2001;
}

.share-header {
  background: #2d2d2d;
  padding: 12px 16px;
  border-bottom: 1px solid #3e3e42;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px 8px 0 0;

  span {
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
  }

  .share-close {
    background: none;
    border: none;
    color: #cccccc;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    line-height: 1;

    &:hover {
      background: #3e3e42;
      color: #ffffff;
    }
  }
}

.share-body {
  padding: 16px;

  .share-size-warning {
    margin: 12px 0;
    padding: 12px;
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 4px;
    font-size: 12px;
    color: #ffc107;

    .warning-text {
      color: #f44336;
      font-weight: 500;
    }

    .size-details {
      margin-top: 4px;
      opacity: 0.8;
      font-size: 11px;
    }
  }

  .download-suggestion {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #3e3e42;

    .download-btn {
      width: 100%;
      padding: 8px 12px;
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background-color 0.2s ease;

      &:hover {
        background: #1976d2;
      }

      &:active {
        background: #1565c0;
      }
    }
  }
}

.url-input-group {
  display: flex;
  gap: 8px;
  align-items: stretch;

  .url-input {
    flex: 1;
    background: #1e1e1e;
    border: 1px solid #3e3e42;
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-family: monospace;
    resize: none;
  }

  .button-group {
    display: flex;
    gap: 4px;
    align-items: stretch;

    .preview-btn,
    .copy-btn {
      padding: 8px 12px;
      background: #3a3a3a;
      color: #cccccc;
      border: 1px solid #3e3e42;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover {
        background: #4a4a4a;
        border-color: #5a5a5a;
      }

      &:active {
        background: #2a2a2a;
        transform: translateY(1px);
      }
    }

    .preview-btn {
      &:hover {
        background: #1976d2;
        border-color: #1565c0;
        color: white;
      }
    }

    .copy-btn {
      &:hover {
        background: #388e3c;
        border-color: #2e7d32;
        color: white;
      }
    }

    border-radius: 4px;
    font-size: 14px;
    font-family: 'Monaco',
    'Courier New',
    monospace;

    &:focus {
      outline: none;
      border-color: #007acc;
    }

    &::placeholder {
      color: #666666;
    }
  }


}

.share-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 2000;
}

// 响应式分享气泡浮窗
@media (max-width: 768px) {
  .share-popup-container {
    top: 50px;
    right: 8px;
    left: 8px;
    width: calc(100% - 16px);
  }

  .share-popup {
    width: 100%;
  }

  .url-input-group {
    flex-direction: column;

    .button-group {
      flex-direction: column;
      width: 100%;

      .preview-btn,
      .copy-btn {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>
