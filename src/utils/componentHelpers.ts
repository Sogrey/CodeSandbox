// 组件辅助工具函数

// 文件相关工具函数
export interface FileInfo {
  name: string
  language: string
  content: string
}

/**
 * 获取当前文件
 */
export const getCurrentFile = (files: FileInfo[], currentFileName: string): FileInfo | undefined => {
  return files.find(file => file.name === currentFileName)
}

/**
 * 获取文件内容
 */
export const getFileContents = (files: FileInfo[]): { htmlContent: string; cssContent: string; jsContent: string } => {
  const htmlFile = files.find(f => f.name === 'index.html')
  const cssFile = files.find(f => f.name === 'style.css')
  const jsFile = files.find(f => f.name === 'script.js')

  return {
    htmlContent: htmlFile?.content ?? '',
    cssContent: cssFile?.content ?? '',
    jsContent: jsFile?.content ?? ''
  }
}

// 链接管理工具函数

/**
 * 添加链接
 */
export const addLink = (links: string[], linkUrl: string = ''): void => {
  links.push(linkUrl)
}

/**
 * 删除链接
 */
export const removeLink = (links: string[], index: number): void => {
  // 这个函数只是逻辑实现，实际删除操作应该在组件中执行
  // 以确保 Vue 的响应式系统能正确更新
  if (links.length > 0) {
    links.splice(index, 1)
  }
  // 如果删除后数组为空，添加一个空输入框
  if (links.length === 0) {
    links.push('')
  }
}

/**
 * 生成CSS链接HTML
 */
export const generateCssLinks = (cssLinks: string[]): string => {
  return cssLinks
    .filter(link => link.trim() !== '')
    .map(link => `<link rel="stylesheet" href="${link}">`)
    .join('\n')
}

/**
 * 生成JS链接HTML
 */
export const generateJsLinks = (jsLinks: string[]): string => {
  return jsLinks
    .filter(link => link.trim() !== '')
    .map(link => `<script src="${link}"></` + `script>`)
    .join('\n')
}

// 解析相关工具函数

/**
 * 检查URL参数类型
 * 返回参数类型：'code' | 'page' | null
 */
export const checkUrlParams = (): 'code' | 'page' | null => {
  const urlParams = new URLSearchParams(window.location.search)
  const codeParam = urlParams.get('code')
  const pageParam = urlParams.get('page')
  
  // 优先检查code参数
  if (codeParam) return 'code'
  // 其次检查page参数
  if (pageParam) return 'page'
  
  return null
}

/**
 * 从URL参数解析代码内容
 */
export const parseUrlCode = (): { 
  html: string; 
  css: string; 
  js: string; 
  headHtmlContent: string; 
  cssLinks: string[]; 
  jsLinks: string[];
  title: string;
  description: string 
} | null => {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const codeParam = urlParams.get('code')
    
    if (!codeParam) return null
    
    // 解码Base64并转换为原始内容
    const decodedContent = decodeURIComponent(atob(codeParam))
    
    // 解析模板内容
    const templateMatch = decodedContent.match(/<template>([\s\S]*?)<\/template>/)
    const htmlContent = templateMatch ? templateMatch[1]?.trim() : ''

    // 提取 script 部分
    const scriptMatch = decodedContent.match(/<script>([\s\S]*?)<\/script>/)
    const jsContent = scriptMatch ? scriptMatch[1]?.trim() : ''

    // 提取 style 部分
    const styleMatch = decodedContent.match(/<style>([\s\S]*?)<\/style>/)
    const cssContent = styleMatch ? styleMatch[1]?.trim() : ''

    // 提取标题和描述
    const titleMatch = decodedContent.match(/<title>([\s\S]*?)<\/title>/)
    const title = titleMatch ? (titleMatch[1]?.trim() || 'CodeSandbox Preview') : 'CodeSandbox Preview'
    
    const descriptionMatch = decodedContent.match(/<meta name="description" content="([^"]*)"\s*\/?>/)
    const description = descriptionMatch ? (descriptionMatch[1]?.trim() || 'A code sandbox preview page') : 'A code sandbox preview page'

    // 提取设置数据
    let headHtmlContent = ''
    let cssLinks: string[] = []
    let jsLinks: string[] = []

    // 检查是否是扩展的模板文件（包含设置部分）
    if (decodedContent.includes('<settings>')) {
      // 提取 head-metadata
      const headMetadataMatch = decodedContent.match(/<head-metadata>([\s\S]*?)<\/head-metadata>/)
      headHtmlContent = headMetadataMatch ? (headMetadataMatch[1]?.trim() || '') : ''

      // 提取 css-links
      const cssLinksMatch = decodedContent.match(/<css-links>([\s\S]*?)<\/css-links>/)
      if (cssLinksMatch) {
        cssLinks = cssLinksMatch[1]?.trim()?.split('\n').filter(link => link.trim() !== '') || []
      }

      // 提取 js-links
      const jsLinksMatch = decodedContent.match(/<js-links>([\s\S]*?)<\/js-links>/)
      if (jsLinksMatch) {
        jsLinks = jsLinksMatch[1]?.trim()?.split('\n').filter(link => link.trim() !== '') || []
      }
    }

    return {
      html: htmlContent ?? "",
      css: cssContent ?? "",
      js: jsContent ?? "",
      headHtmlContent,
      cssLinks,
      jsLinks,
      title,
      description
    }
  } catch (error) {
    console.error('解析URL参数失败:', error)
    return null
  }
}

/**
 * 从URL参数解析页面模板
 */
export const parseUrlPage = async (): Promise<{ 
  html: string; 
  css: string; 
  js: string; 
  headHtmlContent: string; 
  cssLinks: string[]; 
  jsLinks: string[];
  title: string;
  description: string 
} | null> => {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const pageParam = urlParams.get('page')
    
    if (!pageParam) return null
    
    // 使用指定的模板数据页URL
    return await parseDemoHtml(pageParam)
  } catch (error) {
    console.error('解析URL page参数失败:', error)
    return null
  }
}

/**
 * 解析HTML文件内容
 */
export const parseDemoHtml = async (fileUrl: string = './demo.html'): Promise<{ 
  html: string; 
  css: string; 
  js: string; 
  headHtmlContent: string; 
  cssLinks: string[]; 
  jsLinks: string[];
  title: string;
  description: string 
}> => {
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

    // 提取标题和描述
    const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/)
    const title = titleMatch ? (titleMatch[1]?.trim() || 'CodeSandbox Preview') : 'CodeSandbox Preview'
    
    const descriptionMatch = content.match(/<meta name="description" content="([^"]*)"\s*\/?>/)
    const description = descriptionMatch ? (descriptionMatch[1]?.trim() || 'A code sandbox preview page') : 'A code sandbox preview page'

    // 提取设置数据（如果存在）
    let headHtmlContent = ''
    let cssLinks: string[] = []
    let jsLinks: string[] = []

    // 检查是否是扩展的模板文件（包含设置部分）
    if (content.includes('<settings>')) {
      // 提取 head-metadata
      const headMetadataMatch = content.match(/<head-metadata>([\s\S]*?)<\/head-metadata>/)
      headHtmlContent = headMetadataMatch ? (headMetadataMatch[1]?.trim() || '') : ''

      // 提取 css-links
      const cssLinksMatch = content.match(/<css-links>([\s\S]*?)<\/css-links>/)
      if (cssLinksMatch) {
        cssLinks = cssLinksMatch[1]?.trim()?.split('\n').filter(link => link.trim() !== '') || []
      }

      // 提取 js-links
      const jsLinksMatch = content.match(/<js-links>([\s\S]*?)<\/js-links>/)
      if (jsLinksMatch) {
        jsLinks = jsLinksMatch[1]?.trim()?.split('\n').filter(link => link.trim() !== '') || []
      }
    }

    return {
      html: htmlContent ?? "",
      css: cssContent ?? "",
      js: jsContent ?? "",
      headHtmlContent,
      cssLinks,
      jsLinks,
      title,
      description
    }
  } catch (error) {
    console.error('读取 demo.html 失败:', error)
    return {
      html: "",
      css: "",
      js: "",
      headHtmlContent: "",
      cssLinks: [],
      jsLinks: [],
      title: 'CodeSandbox Preview',
      description: 'A code sandbox preview page'
    }
  }
}

// 设置相关工具函数

// 全局设置存储
export interface Settings {
  headHtmlContent: string
  cssLinks: string[]
  jsLinks: string[]
  timestamp: string
}

let currentSettings: Settings = {
  headHtmlContent: '',
  cssLinks: [],
  jsLinks: [],
  timestamp: ''
}

/**
 * 获取当前设置
 */
export const getCurrentSettings = (): Settings => {
  return { ...currentSettings }
}

/**
 * 保存设置
 */
export const saveSettings = (
  headHtmlContent: string,
  cssLinks: string[],
  jsLinks: string[]
): void => {
  // 过滤掉空的链接
  const filteredCssLinks = cssLinks.filter(link => link.trim() !== '')
  const filteredJsLinks = jsLinks.filter(link => link.trim() !== '')
  
  // 更新全局设置
  currentSettings = {
    headHtmlContent: headHtmlContent.trim(),
    cssLinks: filteredCssLinks,
    jsLinks: filteredJsLinks,
    timestamp: new Date().toISOString()
  }
  
  console.log('保存设置:', currentSettings)
}

// 其他工具函数

/**
 * 获取语言扩展配置
 */
export const getLanguageExtension = (language: string): string => {
  switch (language) {
    case 'html':
      return 'html'
    case 'css':
      return 'css'
    case 'javascript':
      return 'javascript'
    default:
      return 'plaintext'
  }
}

// 组件特定工具函数

/**
 * 添加CSS链接
 */
export const addCssLink = (cssLinks: string[]): void => {
  addLink(cssLinks)
}

/**
 * 删除CSS链接
 */
export const removeCssLink = (cssLinks: string[], index: number): void => {
  removeLink(cssLinks, index)
}

/**
 * 添加JS链接
 */
export const addJsLink = (jsLinks: string[]): void => {
  addLink(jsLinks)
}

/**
 * 删除JS链接
 */
export const removeJsLink = (jsLinks: string[], index: number): void => {
  removeLink(jsLinks, index)
}

/**
 * 下载完整HTML代码
 */
export const downloadHtml = (
  fullHtml: string, fileName: string = 'code-sandbox.html'
) => {
  // 创建下载链接
  const blob = new Blob([fullHtml], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
