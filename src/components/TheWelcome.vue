<template>
  <div id="code-sandbox" class="code-sandbox-container">
    <div class="code-editor-preview">
      <!-- 编辑器和预览区 -->
      <div class="editor-preview-container">
        <!-- 编辑器区域 -->
        <div class="editor-panel" :style="{ width: editorWidth + 'px' }">
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
              </div>
              <button @click="showSettings = true" class="action-btn settings-btn"
                :class="{ compact: isButtonsCompact }" title="设置选项">
                <span class="btn-icon">⚙️</span>
                <span class="btn-text">设置</span>
              </button>
            </div>
          </div>

          <!-- 代码编辑器 -->
          <div ref="editorContainer" class="code-editor"></div>

          <!-- 左侧宽度显示 -->
          <div v-if="showWidthInfo" class="width-info left-width-info">
            {{ editorWidth }}px
          </div>
        </div>

        <!-- 分割线 -->
        <div class="resize-handle" @mousedown="startResize" @touchstart="startResize"></div>

        <!-- 预览区域 -->
        <div class="preview-panel" :style="{ width: 'calc(100% - ' + (editorWidth + 3) + 'px)' }">
          <div class="preview-header">
            <span>预览</span>
          </div>
          <iframe ref="previewFrame" class="preview-frame" sandbox="allow-scripts"></iframe>

          <!-- 右侧宽度显示 -->
          <div v-if="showWidthInfo" class="width-info right-width-info">
            {{ previewWidth }}px
          </div>
        </div>
      </div>
    </div>

    <!-- 设置模态对话框 -->
    <div v-if="showSettings" class="modal-overlay" @click="showSettings = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>设置</h3>
          <button class="modal-close" @click="showSettings = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="setting-item">
            <label>编辑器主题</label>
            <select class="setting-select">
              <option>One Dark</option>
              <option>Light</option>
            </select>
          </div>
          <div class="setting-item">
            <label>字体大小</label>
            <input type="number" class="setting-input" value="14" min="10" max="20">
          </div>
          <div class="setting-item">
            <label class="setting-checkbox">
              <input type="checkbox" checked> 自动保存
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="showSettings = false">取消</button>
          <button class="modal-btn confirm">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import jsBeautify from 'js-beautify'
import { buildFullHtml } from '@/utils/templateGenerator'

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

// 文件配置
interface FileConfig {
  name: string
  language: string
  content: string
}

// 解析 demo.html 文件内容
const parseDemoHtml = async (fileUrl: string = './demo.html'): Promise<{ html: string; css: string; js: string }> => {
  try {
    const response = await fetch(fileUrl)
    const content = await response.text()

    // 提取 template 部分
    const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/)
    const htmlContent = templateMatch ? templateMatch[1]?.trim() : ''

    // 提取 script 部分
    const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/)
    const jsContent = scriptMatch ? scriptMatch[1]?.trim() : ''

    // 提取 style 部分
    const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/)
    const cssContent = styleMatch ? styleMatch[1]?.trim() : ''

    return {
      html: htmlContent ?? "",
      css: cssContent ?? "",
      js: jsContent ?? ""
    }
  } catch (error) {
    console.error('读取 demo.html 失败:', error)
    return {
      html: "",
      css: "",
      js: ""
    }
  }
}

// 文件列表
const files = ref<FileConfig[]>([])

// 初始化文件内容
const initFiles = async () => {
  const { html, css, js } = await parseDemoHtml()

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
}

const currentFile = ref('script.js')
const editorContainer = ref<HTMLElement>()
const previewFrame = ref<HTMLIFrameElement>()
const editorWidth = ref(600) // 默认编辑器宽度
const previewWidth = ref(0) // 预览区域宽度
const showWidthInfo = ref(false) // 是否显示宽度信息
const showSettings = ref(false) // 是否显示设置模态框
const isButtonsCompact = ref(false) // 按钮是否处于紧凑模式
let editor: any = null
let isResizing = false
let startX = 0
let startWidth = 0
let hideTimeout: any = null // 隐藏延迟定时器

// 获取当前文件配置
const getCurrentFile = () => {
  return files.value.find(file => file.name === currentFile.value)
}

// 切换文件
const switchFile = (fileName: string) => {
  currentFile.value = fileName
  updateEditor()
}

// 更新编辑器内容
const updateEditor = () => {
  const file = getCurrentFile()
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
      getLanguageExtension(file.language),
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

// 获取语言扩展
const getLanguageExtension = (language: string) => {
  switch (language) {
    case 'html':
      return html()
    case 'css':
      return css()
    case 'javascript':
      return javascript()
    default:
      return javascript()
  }
}



// 格式化代码
const formatCode = () => {
  const file = getCurrentFile()
  if (!file) return

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
    updateEditor()
  } catch (error) {
    console.error('格式化失败:', error)
  }
}

// 获取文件内容
const getFileContents = () => {
  const htmlFile = files.value.find(f => f.name === 'index.html')
  const cssFile = files.value.find(f => f.name === 'style.css')
  const jsFile = files.value.find(f => f.name === 'script.js')

  return {
    htmlContent: htmlFile?.content || '',
    cssContent: cssFile?.content || '',
    jsContent: jsFile?.content || ''
  }
}

// 运行代码
const runCode = () => {
  if (!previewFrame.value) return

  const { htmlContent, cssContent, jsContent } = getFileContents()
  const fullHtml = buildFullHtml({ htmlContent, cssContent, jsContent }, true)

  // 使用 srcdoc 属性安全地设置 iframe 内容
  previewFrame.value.srcdoc = fullHtml
}

// 下载完整HTML代码
const downloadFullHtml = () => {
  const { htmlContent, cssContent, jsContent } = getFileContents()
  const fullHtml = buildFullHtml({ htmlContent, cssContent, jsContent }, false)

  // 创建下载链接
  const blob = new Blob([fullHtml], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'code-sandbox.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 初始化编辑器
onMounted(async () => {
  // 首先初始化文件内容
  await initFiles()

  // 然后加载 CodeMirror 模块
  await loadCodeMirror()

  if (!editorContainer.value) return

  const file = getCurrentFile()
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
        getLanguageExtension(file.language),
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
  const minWidth = 450 // 左侧最小宽度
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
  const shouldBeCompact = width < 550

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
  transition: background-color 0.2s ease;

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

  .preview-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(128, 128, 128, 0.7); // 灰度半透明背景
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

// 响应式模态框
@media (max-width: 768px) {
  .modal-content {
    width: 95vw;
    margin: 20px;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
