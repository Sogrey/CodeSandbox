<template>
  <div id="code-sandbox" class="code-sandbox-container">
    <div class="code-editor-preview">
      <!-- 编辑器和预览区 -->
      <div class="editor-preview-container">
        <!-- 编辑器区域 -->
        <div class="editor-panel" :style="{ width: isPreviewMode ? '0px' : editorWidth + 'px' }"
          :class="{ 'preview-mode': isPreviewMode }">
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
                <button @click="downloadFullHtml" class="action-btn" title="下载HTML文件">
                  <span class="btn-icon">📥</span>
                  <span class="btn-text">下载</span>
                </button>
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
                  <button @click="copyShareUrl" class="copy-btn" title="复制链接">
                    <span class="copy-icon">📋</span>
                    <span class="copy-text">复制</span>
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
          <iframe ref="previewFrame" class="preview-frame" sandbox="allow-scripts"></iframe>

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
          <div v-if="currentSettingTab === 'other'" class="tab-content">
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
import { ref, onMounted, onUnmounted } from 'vue'
import jsBeautify from 'js-beautify'
import { buildFullHtml, generateExtendedTemplate } from '@/utils/templateGenerator'
import type { TemplateVariables } from '@/utils/templateManager'
import {
  getCurrentFile,
  getFileContents,
  generateCssLinks,
  generateJsLinks,
  parseDemoHtml,
  parseUrlCode,
  parseUrlPage,
  checkUrlParams,
  saveSettings,
  getLanguageExtension,
  addCssLink,
  removeCssLink,
  addJsLink,
  removeJsLink,
  downloadHtml
} from '@/utils/componentHelpers'
import type { FileInfo } from '@/utils/componentHelpers'

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

// 初始化文件内容
const initFiles = async () => {
  // 检查URL参数类型
  const paramType = checkUrlParams()

  if (paramType === 'code') {
    // 处理code参数：从URL参数中加载代码内容
    const urlCodeData = parseUrlCode()

    if (urlCodeData) {
      // 使用URL参数中的代码内容 - 完全基于URL参数，不加载其他模板数据
      const { html, css, js, headHtmlContent: parsedHeadHtml, cssLinks: parsedCssLinks, jsLinks: parsedJsLinks, title: parsedTitle, description: parsedDescription } = urlCodeData

      files.value = [
        {
          name: 'index.html',
          language: 'html',
          content: html || '<div>请编写你的HTML代码</div>'
        },
        {
          name: 'style.css',
          language: 'css',
          content: css || '/* 请编写你的CSS样式 */'
        },
        {
          name: 'script.js',
          language: 'javascript',
          content: js || '// 请编写你的JavaScript代码'
        }
      ]

      // 更新设置状态 - 仅使用URL参数中的设置数据
      headHtmlContent.value = parsedHeadHtml || ''
      cssLinks.value = parsedCssLinks.length > 0 ? parsedCssLinks : ['']
      jsLinks.value = parsedJsLinks.length > 0 ? parsedJsLinks : ['']

      // 更新标题和描述
      pageTitle.value = parsedTitle || 'CodeSandbox Preview'
      pageDescription.value = parsedDescription || 'A code sandbox preview page'

      console.log('从URL参数加载代码内容成功，跳过默认模板加载')
      return
    }
  } else if (paramType === 'page') {
    // 处理page参数：从指定的模板数据页URL加载内容
    const pageData = await parseUrlPage()

    if (pageData) {
      const { html, css, js, headHtmlContent: parsedHeadHtml, cssLinks: parsedCssLinks, jsLinks: parsedJsLinks, title: parsedTitle, description: parsedDescription } = pageData

      files.value = [
        {
          name: 'index.html',
          language: 'html',
          content: html || '<div>请编写你的HTML代码</div>'
        },
        {
          name: 'style.css',
          language: 'css',
          content: css || '/* 请编写你的CSS样式 */'
        },
        {
          name: 'script.js',
          language: 'javascript',
          content: js || '// 请编写你的JavaScript代码'
        }
      ]

      // 更新设置状态
      headHtmlContent.value = parsedHeadHtml || ''
      cssLinks.value = parsedCssLinks.length > 0 ? parsedCssLinks : ['']
      jsLinks.value = parsedJsLinks.length > 0 ? parsedJsLinks : ['']

      // 更新标题和描述
      pageTitle.value = parsedTitle || 'CodeSandbox Preview'
      pageDescription.value = parsedDescription || 'A code sandbox preview page'

      console.log('从指定模板数据页加载代码内容成功')
      return
    }
  }

  // 如果没有URL参数或参数解析失败，则从demo.html文件加载默认内容
  console.log('未检测到有效URL参数，加载默认模板内容')
  const { html, css, js, headHtmlContent: parsedHeadHtml, cssLinks: parsedCssLinks, jsLinks: parsedJsLinks, title: parsedTitle, description: parsedDescription } = await parseDemoHtml()

  files.value = [
    {
      name: 'index.html',
      language: 'html',
      content: html
    },
    {
      name: 'style.css',
      language: 'css',
      content: css
    },
    {
      name: 'script.js',
      language: 'javascript',
      content: js
    }
  ]

  // 如果模板文件中包含设置数据，则更新组件的设置状态
  if (parsedHeadHtml) {
    headHtmlContent.value = parsedHeadHtml
  }

  if (parsedCssLinks.length > 0) {
    cssLinks.value = parsedCssLinks
  }

  if (parsedJsLinks.length > 0) {
    jsLinks.value = parsedJsLinks
  }

  // 更新标题和描述
  if (parsedTitle) {
    pageTitle.value = parsedTitle
  }

  if (parsedDescription) {
    pageDescription.value = parsedDescription
  }
}

const currentFile = ref('script.js')
const editorContainer = ref<HTMLElement>()
const previewFrame = ref<HTMLIFrameElement>()
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
      if (file.language === 'html') {
        formatted = jsBeautify.html(formatted, {
          indent_size: 2,
          indent_char: ' ',
          max_preserve_newlines: 1,
          preserve_newlines: true,
          indent_scripts: 'normal',
          end_with_newline: false,
          indent_inner_html: false
        })
      } else if (file.language === 'css') {
        formatted = jsBeautify.css(formatted, {
          indent_size: 2,
          indent_char: ' ',
          selector_separator_newline: true,
          newline_between_rules: true,
          preserve_newlines: true
        })
      } else if (file.language === 'javascript') {
        formatted = jsBeautify.js(formatted, {
          indent_size: 2,
          indent_char: ' ',
          preserve_newlines: true,
          brace_style: 'collapse'
        })
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

  const { htmlContent, cssContent, jsContent } = getFileContents(files.value)

  // 构建模板变量，包含设置内容
  const templateVariables: TemplateVariables = {
    htmlContent,
    cssContent,
    jsContent,
    headHtmlContent: headHtmlContent.value,
    cssLinks: generateCssLinks(cssLinks.value),
    jsLinks: generateJsLinks(jsLinks.value)
  }

  const fullHtml = await buildFullHtml(templateVariables, true, pageTitle.value, pageDescription.value)

  // 使用 srcdoc 属性安全地设置 iframe 内容
  previewFrame.value.srcdoc = fullHtml
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
  const { htmlContent, cssContent, jsContent } = getFileContents(files.value)

  // 构建模板变量，包含设置内容
  const templateVariables: TemplateVariables = {
    htmlContent,
    cssContent,
    jsContent,
    headHtmlContent: headHtmlContent.value ?? '',
    cssLinks: generateCssLinks(cssLinks.value),
    jsLinks: generateJsLinks(jsLinks.value)
  }

  const fullHtml = await buildFullHtml(templateVariables, false, pageTitle.value, pageDescription.value)

  // 下载完整HTML文件
  downloadHtml(fullHtml, 'code-sandbox-full.html')

  // 下载扩展的HTML模板文件（包含所有编辑和设置数据）
  const templateHtml = generateExtendedTemplate(
    htmlContent,
    cssContent,
    jsContent,
    headHtmlContent.value,
    cssLinks.value,
    jsLinks.value,
    pageTitle.value,
    pageDescription.value
  )

  downloadHtml(templateHtml, 'code-sandbox-template.html')
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

  // 生成扩展的HTML模板内容
  const templateContent = generateExtendedTemplate(
    htmlContent,
    cssContent,
    jsContent,
    headHtmlContent.value,
    cssLinks.value,
    jsLinks.value,
    pageTitle.value,
    pageDescription.value
  )

  // 对内容进行Base64编码（加密编码）
  const encodedContent = btoa(encodeURIComponent(templateContent))

  // 生成带参数的分享链接
  shareUrl.value = `${currentUrl.value}?code=${encodedContent}`
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

// 处理调整大小
const handleResize = (e: MouseEvent | TouchEvent) => {
  if (!isResizing) return
  e.preventDefault()

  const currentX = e instanceof MouseEvent ? e.clientX : e.touches[0]!.clientX
  const deltaX = currentX - startX

  // 计算新的编辑器宽度，限制在合理范围内
  const containerWidth = document.querySelector('.editor-preview-container')?.clientWidth || 1200
  const minWidth = 500 // 左侧最小宽度
  const maxWidth = containerWidth - 50 - 3 // 右侧保留50px宽度（减去分割线宽度）
  const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX))
  editorWidth.value = newWidth

  // 更新预览区域宽度
  previewWidth.value = containerWidth - newWidth - 3

  // 实时更新预览区域宽度
  if (previewFrame.value) {
    const previewPanel = previewFrame.value.closest('.preview-panel') as HTMLElement
    if (previewPanel) {
      previewPanel.style.width = `calc(100% - ${newWidth + 3}px)`
    }
  }

  // 根据编辑器宽度更新按钮显示模式
  updateButtonsMode(newWidth)
}

// 更新按钮显示模式
const updateButtonsMode = (width: number) => {
  // 当编辑器宽度小于600px时，切换到紧凑模式（只显示图标）
  const shouldBeCompact = width < 650

  if (isButtonsCompact.value !== shouldBeCompact) {
    isButtonsCompact.value = shouldBeCompact

    // 延迟一点时间更新DOM，避免频繁重绘
    setTimeout(() => {
      const buttonGroup = document.querySelector('.button-group') as HTMLElement
      const settingsBtn = document.querySelector('.settings-btn') as HTMLElement

      if (buttonGroup) {
        if (isButtonsCompact.value) {
          buttonGroup.classList.add('compact')
        } else {
          buttonGroup.classList.remove('compact')
        }
      }

      if (settingsBtn) {
        if (isButtonsCompact.value) {
          settingsBtn.classList.add('compact')
        } else {
          settingsBtn.classList.remove('compact')
        }
      }
    }, 10)
  }
}

// 停止调整大小
const stopResize = () => {
  if (!isResizing) return

  isResizing = false

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
  transition: width 0.3s ease, opacity 0.3s ease; // 添加平滑过渡动画

  &.preview-mode {
    opacity: 0; // 预览模式下完全透明
    pointer-events: none; // 禁止交互
  }

  .editor-toolbar {
    background: #252526;
    border-bottom: 1px solid #3e3e42;
    padding: 0 16px;
    height: 48px;
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
          transition: all 0.2s ease;

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
            transition: all 0.2s ease;
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
        transition: all 0.2s ease;

        &:hover {
          background: #3d3d3d;
        }

        .btn-icon {
          font-size: 14px;
          flex-shrink: 0;
        }

        .btn-text {
          white-space: nowrap;
          transition: all 0.2s ease;
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
  }
}

// 分割线
.resize-handle {
  width: 6px;
  background: #3e3e42;
  cursor: col-resize;
  position: relative;
  z-index: 20;
  transition: all 0.3s ease; // 添加平滑过渡动画

  &.preview-mode {
    width: 0px; // 预览模式下宽度设为0
    opacity: 0; // 完全透明
    pointer-events: none; // 禁止交互
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
    width: 8px;
    margin-left: -1px;
  }

  &:active {
    background: #005a9e;
    width: 8px;
    margin-left: -1px;
  }

  // 拖拽时的视觉反馈
  &.resizing {
    background: #005a9e !important;
    width: 8px;
    margin-left: -1px;
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
  transition: width 0.3s ease; // 添加平滑过渡动画

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
    transition: all 0.3s ease;
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
    font-size: 14px;
    font-family: 'Monaco', 'Courier New', monospace;

    &:focus {
      outline: none;
      border-color: #007acc;
    }

    &::placeholder {
      color: #666666;
    }
  }

  .copy-btn {
    background: #007acc;
    border: none;
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background-color 0.2s ease;

    &:hover {
      background: #118bee;
    }

    .copy-icon {
      font-size: 14px;
    }

    .copy-text {
      white-space: nowrap;
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

    .copy-btn {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
