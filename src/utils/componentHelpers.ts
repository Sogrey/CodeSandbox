/**
 * componentHelpers.ts
 * 组件辅助工具函数集合
 * 提供文件管理、URL解析、链接生成、设置保存等功能
 * @author Sogrey
 * @date 2025-06-01 00:00:00
 * @lastModify 2025-11-17 00:00:00
 * @version 1.0.0
 */



/**
 * 内容压缩和优化函数
 * 移除不必要的空格、注释和空白，以减少内容大小
 * @param {string} content 要压缩的内容
 * @return {string} 压缩后的内容
 */
export const compressContent = (content: string): string => {
  try {
    // 移除HTML注释
    let compressed = content.replace(/<!--[\s\S]*?-->/g, '')

    // 移除CSS注释
    compressed = compressed.replace(/\/\*[\s\S]*?\*\//g, '')

    // 移除JS注释（单行和多行）
    compressed = compressed.replace(/\/\/.*$/gm, '') // 单行注释
    compressed = compressed.replace(/\/\*[\s\S]*?\*\//g, '') // 多行注释

    // 移除多余的空白字符（保留必要的空格）
    compressed = compressed.replace(/\s+/g, ' ')

    // 移除行首行尾空格
    compressed = compressed.replace(/^\s+|\s+$/gm, '')

    // 移除空行
    compressed = compressed.replace(/\n\s*\n/g, '\n')

    return compressed.trim()
  } catch (error) {
    console.error('内容压缩失败:', error)
    return content // 压缩失败时返回原内容
  }
}

/**
 * 智能内容压缩
 * 根据内容类型选择最佳压缩策略
 * @param {string} content 要压缩的内容
 * @param {string} contentType 内容类型（html, css, js）
 * @return {string} 压缩后的内容
 */
export const smartCompressContent = (content: string, contentType: string): string => {
  if (!content || content.length === 0) return content

  try {
    let compressed = content

    switch (contentType.toLowerCase()) {
      case 'html':
        // HTML特定压缩：保留必要空格，移除其他
        compressed = content
          .replace(/<!--[\s\S]*?-->/g, '') // 移除HTML注释
          .replace(/\s+</g, '<') // 标签前的空格
          .replace(/>\s+/g, '>') // 标签后的空格
          .replace(/\s+/g, ' ') // 多个空格合并为一个
          .trim()
        break

      case 'css':
        // CSS特定压缩
        compressed = content
          .replace(/\/\*[\s\S]*?\*\//g, '') // 移除CSS注释
          .replace(/\s*{\s*/g, '{') // 大括号前后空格
          .replace(/\s*}\s*/g, '}')
          .replace(/;\s*/g, ';') // 分号后空格
          .replace(/:\s*/g, ':') // 冒号后空格
          .replace(/,\s*/g, ',') // 逗号后空格
          .replace(/\s+/g, ' ') // 多个空格合并
          .trim()
        break

      case 'js':
        // JavaScript基础压缩（避免影响语法）
        compressed = content
          .replace(/\/\/.*$/gm, '') // 移除单行注释
          .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
          .replace(/\s*([{}();,=])\s*/g, '$1') // 操作符前后空格
          .replace(/\s+/g, ' ') // 多个空格合并为一个
          .trim()
        break

      default:
        // 通用压缩
        compressed = compressContent(content)
    }

    return compressed
  } catch (error) {
    console.error('智能压缩失败:', error)
    return content
  }
}

/**
 * 检测分享内容大小和是否过长
 * @param {string} content 要检测的内容
 * @return {{isTooLong: boolean, originalSize: number, compressedSize: number, recommendedAction: string}} 检测结果
 */
export const checkShareContentSize = (content: string): {
  isTooLong: boolean
  originalSize: number
  compressedSize: number
  recommendedAction: string
} => {
  // URL长度限制考虑（保守估计2KB为安全范围）
  const URL_SAFE_LIMIT = 2048
  const URL_WARNING_THRESHOLD = 1500

  try {
    const originalSize = content.length

    // 尝试压缩内容
    const compressedContent = compressContent(content)
    const compressedSize = compressedContent.length

    // 估算加密后的大小（Base64大约增加33%）
    const estimatedEncryptedSize = Math.ceil(compressedSize * 1.33)

    const isTooLong = estimatedEncryptedSize > URL_SAFE_LIMIT
    const isWarning = estimatedEncryptedSize > URL_WARNING_THRESHOLD

    let recommendedAction = ''
    if (isTooLong) {
      recommendedAction = '文件内容过长，强烈建议下载分享'
    } else if (isWarning) {
      recommendedAction = '文件内容较长，建议下载分享'
    } else {
      recommendedAction = '内容大小正常'
    }

    return {
      isTooLong,
      originalSize,
      compressedSize,
      recommendedAction
    }
  } catch (error) {
    console.error('内容大小检测失败:', error)
    return {
      isTooLong: true,
      originalSize: content.length,
      compressedSize: content.length,
      recommendedAction: '无法检测内容大小，建议下载分享'
    }
  }
}

/**
 * 优化的加密函数
 * 包含内容压缩优化
 * @param {string} data 要加密的字符串数据
 * @param {string} key 加密密钥
 * @param {Object} options 加密选项
 * @return {string} 加密后的Base64字符串
 */
export const optimizedEncryptContent = (
  data: string,
  key: string = 'CodeSandbox2025',
  options: { debug?: boolean; enableCompression?: boolean } = {
    debug: false,
    enableCompression: true
  }
): { encryptedContent: string; originalSize: number; compressedSize: number } => {
  const { debug = false, enableCompression = true } = options

  try {
    const originalSize = data.length
    let processedData = data
    let compressedSize = originalSize

    if (enableCompression && originalSize > 100) {
      processedData = compressContent(data)
      compressedSize = processedData.length

      if (debug) {
        console.log(`压缩效果: ${originalSize} -> ${compressedSize} (${((1 - compressedSize / originalSize) * 100).toFixed(1)}% 减少)`)
      }
    }

    // 使用原有的加密逻辑
    const encryptedContent = encryptContent(processedData, key, { debug })

    if (debug) {
      console.log('优化加密完成，原始长度:', originalSize, '处理后长度:', compressedSize, '加密后长度:', encryptedContent.length)
    }

    return {
      encryptedContent,
      originalSize,
      compressedSize
    }
  } catch (error) {
    console.error('优化加密失败:', error)
    // 回退到原加密方法
    const encryptedContent = encryptContent(data, key, { debug })
    return {
      encryptedContent,
      originalSize: data.length,
      compressedSize: data.length
    }
  }
}

/**
 * 简单的加密函数
 * 使用XOR加密和Base64编码的组合来保护数据
 * @param {string} data 要加密的字符串数据
 * @param {string} key 加密密钥，默认为固定值
 * @param {Object} options 加密选项
 * @param {boolean} options.debug 是否启用调试模式（可选）
 * @return {string} 加密后的Base64字符串
 */
export const encryptContent = (
  data: string,
  key: string = 'CodeSandbox2025',
  options: { debug?: boolean } = { debug: false }
): string => {
  try {
    const { debug = false } = options

    if (debug) {
      console.log('开始加密，原始数据长度:', data.length)
    }

    // 第一层：XOR加密（正确处理Unicode字符）
    const encrypted = data.split('').map((char, index) => {
      const keyChar = key[index % key.length]
      if (!keyChar) {
        throw new Error('加密密钥不能为空')
      }
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0))
    }).join('')

    // 第二层：UTF-8字节数组编码
    const utf8Bytes = new TextEncoder().encode(encrypted)

    // 第三层：Base64编码（URL安全的版本）
    const base64String = btoa(String.fromCharCode(...utf8Bytes))

    // 转换为URL安全的Base64（替换可能影响URL的字符）
    const result = base64String
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    if (debug) {
      console.log('加密完成，结果长度:', result.length)
    }

    return result
  } catch (error) {
    console.error('内容加密失败:', error)
    // 如果加密失败，回退到URL编码
    try {
      return encodeURIComponent(data)
    } catch (fallbackError) {
      console.error('回退加密也失败:', fallbackError)
      return data // 最后的回退
    }
  }
}

/**
 * 简单的解密函数
 * 用于解密CodeSandbox组件中加密的内容
 * @param {string} encryptedData 加密的Base64字符串
 * @param {string} key 解密密钥，需要与加密时使用的一致
 * @param {Object} options 解密选项
 * @param {boolean} options.debug 是否启用调试模式（可选）
 * @return {string} 解密后的原始字符串
 */
export const decryptContent = (
  encryptedData: string,
  key: string = 'CodeSandbox2025',
  options: { debug?: boolean } = {}
): string => {
  try {
    const { debug = false } = options

    if (debug) {
      console.log('开始解密，加密数据长度:', encryptedData.length)
    }

    // 处理URL编码问题
    let processedData = encryptedData
    if (/%[0-9A-Fa-f]{2}/.test(encryptedData)) {
      processedData = decodeURIComponent(encryptedData)
      if (debug) {
        console.log('URL解码后数据:', processedData)
      }
    }

    // 转换URL安全的Base64回标准Base64
    const base64String = processedData
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    // 添加填充字符（如果需要）
    let paddedBase64 = base64String
    while (paddedBase64.length % 4) {
      paddedBase64 += '='
    }

    if (debug) {
      console.log('标准Base64字符串:', paddedBase64)
    }

    // 第一层：Base64解码（转换为UTF-8字节数组）
    const base64Decoded = atob(paddedBase64)
    const utf8Bytes = new Uint8Array(base64Decoded.split('').map(char => char.charCodeAt(0)))
    const decoded = new TextDecoder().decode(utf8Bytes)

    // 第二层：XOR解密
    const result = decoded.split('').map((char, index) => {
      const keyChar = key[index % key.length]
      if (!keyChar) {
        throw new Error('解密密钥不能为空')
      }
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0))
    }).join('')

    if (debug) {
      console.log('解密完成，结果长度:', result.length)
    }

    return result
  } catch (error) {
    console.error('内容解密失败:', error)
    // 尝试回退到简单的Base64解码
    try {
      const base64Decoded = atob(encryptedData)
      return base64Decoded.split('').map((char, index) => {
        const keyChar = key[index % key.length]
        if (!keyChar) {
          throw new Error('解密密钥不能为空')
        }
        return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0))
      }).join('')
    } catch (fallbackError) {
      console.error('回退解密也失败:', fallbackError)
      // 最后的回退：使用decodeURIComponent
      return decodeURIComponent(encryptedData)
    }
  }
}

// 组件辅助工具函数

// 文件相关工具函数
export interface FileInfo {
  name: string
  language: string
  content: string
}

// 数据页面解析结果
export interface ParsedExampleData {
  engineType: string;
  html: string;
  css: string;
  js: string;
  headHtmlContent: string;
  cssLinks: string[];
  jsLinks: string[];
  title: string;
  description: string;
  jsType: string;
}

/**
 * 根据文件名获取当前文件信息
 * @param {FileInfo[]} files 文件列表数组
 * @param {string} currentFileName 要查找的文件名
 * @return {FileInfo | undefined} 找到的文件信息，未找到时返回undefined
 * @example
 * const files = [{name: 'index.html', language: 'html', content: '<div>Hello</div>'}]
 * const currentFile = getCurrentFile(files, 'index.html')
 * console.log(currentFile) // {name: 'index.html', language: 'html', content: '<div>Hello</div>'}
 */
export const getCurrentFile = (files: FileInfo[], currentFileName: string): FileInfo | undefined => {
  return files.find(file => file.name === currentFileName)
}

/**
 * 从文件列表中提取HTML、CSS、JS内容
 * @param {FileInfo[]} files 文件列表数组
 * @return {{htmlContent: string; cssContent: string; jsContent: string}} 包含HTML、CSS、JS内容的对象
 * @example
 * const files = [
 *   {name: 'index.html', content: '<div>Hello</div>'},
 *   {name: 'style.css', content: 'body{margin:0}'},
 *   {name: 'script.js', content: 'console.log("hello")'}
 * ]
 * const {htmlContent, cssContent, jsContent} = getFileContents(files)
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
 * 向链接数组中添加新的URL链接
 * @param {string[]} links 链接数组
 * @param {string} linkUrl 要添加的链接URL，默认为空字符串
 * @return {void} 无返回值
 * @example
 * const cssLinks = ['style1.css']
 * addLink(cssLinks, 'style2.css')
 * console.log(cssLinks) // ['style1.css', 'style2.css']
 */
export const addLink = (links: string[], linkUrl: string = ''): void => {
  links.push(linkUrl)
}

/**
 * 从链接数组中删除指定索引的链接
 * 注意：此函数只是逻辑实现，实际删除操作应该在组件中执行以确保Vue的响应式系统正确更新
 * @param {string[]} links 链接数组
 * @param {number} index 要删除的链接索引
 * @return {void} 无返回值
 * @example
 * const cssLinks = ['style1.css', 'style2.css', 'style3.css']
 * removeLink(cssLinks, 1) // 删除 'style2.css'
 * console.log(cssLinks) // ['style1.css', 'style3.css']
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
 * 根据CSS链接数组生成HTML link标签字符串
 * @param {string[]} cssLinks CSS链接数组
 * @return {string} 生成的HTML link标签字符串，多个链接用换行符分隔
 * @example
 * const cssLinks = ['https://cdn.example.com/style1.css', 'style2.css']
 * const html = generateCssLinks(cssLinks)
 * console.log(html)
 * // '<link rel="stylesheet" href="https://cdn.example.com/style1.css">
<link rel="stylesheet" href="style2.css">'
 */
export const generateCssLinks = (cssLinks: string[]): string => {
  return cssLinks
    .filter(link => link.trim() !== '')
    .map(link => `<link rel="stylesheet" href="${link}">`)
    .join('\n')
}

/**
 * 根据JS链接数组生成HTML script标签字符串
 * @param {string[]} jsLinks JS链接数组
 * @return {string} 生成的HTML script标签字符串，多个链接用换行符分隔
 * @example
 * const jsLinks = ['https://cdn.example.com/script1.js', 'script2.js']
 * const html = generateJsLinks(jsLinks)
 * console.log(html)
 * // '<script src="https://cdn.example.com/script1.js"></script>
<script src="script2.js"></script>'
 */
export const generateJsLinks = (jsLinks: string[]): string => {
  return jsLinks
    .filter(link => link.trim() !== '')
    .map(link => `<script src="${link}"></` + `script>`)
    .join('\n')
}

// 解析相关工具函数

/**
 * 检查当前URL参数类型，判断是代码模式还是页面模式
 * 优先级：code参数 > page参数
 * @return {'code' | 'page' | null} 返回参数类型，'code'表示代码模式，'page'表示页面模式，null表示无相关参数
 * @example
 * // URL: https://example.com?code=xxx
 * const type = checkUrlParams() // 返回 'code'
 * // URL: https://example.com?page=./demo.html
 * const type = checkUrlParams() // 返回 'page'
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
 * 从URL的code参数中解析出代码内容
 * 解析Base64编码的模板数据，提取HTML、CSS、JS等内容
 * @return {ParsedExampleData | null} 解析成功返回示例数据对象，失败返回null
 * @throws {Error} Base64解码失败时抛出异常
 * @example
 * // URL包含code参数: eyJuYW1lIjoidGVzdCJ9...
 * const data = parseUrlCode()
 * if (data) {
 *   console.log(data.html) // 提取的HTML内容
 *   console.log(data.css)  // 提取的CSS内容
 * }
 */
export const parseUrlCode = (): ParsedExampleData | null => {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const codeParam = urlParams.get('code')

    if (!codeParam) return null

    let decodedContent: string

    try {
      // 尝试使用XOR+Base64解密（新格式）
      decodedContent = decryptContent(codeParam)
    } catch (decryptError) {
      try {
        // 如果解密失败，尝试简单的Base64解码（旧格式兼容）
        decodedContent = decodeURIComponent(atob(codeParam))
      } catch (base64Error) {
        console.error('两种解码方式都失败:', { decryptError, base64Error })
        return null
      }
    }

    // 解析模板内容
    const engineTypeMatch = decodedContent.match(/<engine-type>([\s\S]*?)<\/engine-type>/)
    const engineType = engineTypeMatch ? engineTypeMatch[1]?.trim() : ''

    // 解析模板内容
    const templateMatch = decodedContent.match(/<template>([\s\S]*?)<\/template>/)
    const htmlContent = templateMatch ? templateMatch[1]?.trim() : ''

    // 提取 script 部分
    let jsType = '';
    const scriptMatch = decodedContent.match(/<script>([\s\S]*?)<\/script>/)
    let jsContent = scriptMatch ? scriptMatch[1]?.trim() : ''

    const scriptModuleMatch = decodedContent.match(/<script type="module">([\s\S]*?)<\/script>/)
    if (scriptModuleMatch) {
      jsType = 'module';
      jsContent = scriptModuleMatch[1]?.trim()
    }

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
      engineType: engineType ?? "default",
      html: htmlContent ?? "",
      css: cssContent ?? "",
      js: jsContent ?? "",
      headHtmlContent,
      cssLinks,
      jsLinks,
      title,
      description,
      jsType
    }
  } catch (error) {
    console.error('解析URL参数失败:', error)
    return {
      engineType: "default",
      html: "",
      css: "",
      js: "",
      headHtmlContent: "",
      cssLinks: [],
      jsLinks: [],
      title: '',
      description: '',
      jsType: ''
    }
  }
}

/**
 * 从URL的page参数中解析页面模板内容
 * @return {Promise<ParsedExampleData | null>} 返回解析成功的示例数据对象，失败返回null
 * @throws {Error} 文件加载或解析失败时抛出异常
 * @example
 * // URL: https://example.com?page=./examples/demo.html
 * const data = await parseUrlPage()
 * if (data) {
 *   console.log(data.title) // 页面标题
 *   console.log(data.engineType) // 模板引擎类型
 * }
 */
export const parseUrlPage = async (): Promise<ParsedExampleData | null> => {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const pageParam = urlParams.get('page')

    if (!pageParam) return null

    // 解码URL参数，处理浏览器自动编码的情况
    let decodedPageParam
    try {
      decodedPageParam = decodeURIComponent(pageParam)
    } catch (decodeError) {
      console.warn('URL page参数解码失败，使用原始值:', decodeError)
      decodedPageParam = pageParam
    }

    // 使用解码后的模板数据页URL
    return await parseDemoHtml(decodedPageParam)
  } catch (error) {
    console.error('解析URL page参数失败:', error)
    return null
  }
}

/**
 * 解析上传的HTML文件内容，提取模板数据和设置信息
 * 支持解析包含<engine-type>、<template>、<script>、<style>、<settings>等标签的HTML文件
 * @param {string} fileContent HTML文件内容
 * @return {Promise<ParsedExampleData>} 返回解析后的示例数据对象
 * @throws {Error} 文件解析失败时抛出异常
 * @example
 * // 解析上传的文件内容
 * const data = await parseShareFileContent(fileContent)
 * console.log(data.html) // HTML内容
 * console.log(data.engineType) // 模板引擎类型
 */
export const parseShareFileContent = async (fileContent: string): Promise<ParsedExampleData> => {
  try {
    console.log('开始解析分享文件内容，原始内容长度:', fileContent.length)

    // 移除可能的分享信息注释
    let cleanedContent = fileContent
    const shareInfoRegex = /<!--[\s\S]*?CodeSandbox 分享文件[\s\S]*?-->/g
    cleanedContent = cleanedContent.replace(shareInfoRegex, '')
    console.log('清理注释后内容长度:', cleanedContent.length)

    // 提取模板类型
    const typeMatch = cleanedContent.match(/<engine-type>([\s\S]*?)<\/engine-type>/)
    const engineType = typeMatch ? typeMatch[1]?.trim() : 'default'
    console.log('解析的engineType:', engineType)

    // 提取 template 部分
    const templateMatch = cleanedContent.match(/<template>([\s\S]*?)<\/template>/)
    const htmlContent = templateMatch ? templateMatch[1]?.trim() : ''
    console.log('templateMatch是否找到:', !!templateMatch)
    console.log('解析的HTML内容长度:', htmlContent!.length)

    // 提取 script 部分 - 支持普通script和module类型
    let jsType = ''
    let jsContent = ''

    // 先尝试匹配module类型的script
    let scriptMatch = cleanedContent.match(/<script\s+type="module">([\s\S]*?)<\/script>/)
    if (scriptMatch) {
      jsContent = scriptMatch[1]?.trim() || ''
      jsType = 'module'
    } else {
      // 如果没找到module类型，再匹配普通script
      scriptMatch = cleanedContent.match(/<script>([\s\S]*?)<\/script>/)
      if (scriptMatch) {
        jsContent = scriptMatch[1]?.trim() || ''
        jsType = 'classic'
      }
    }
    console.log('scriptMatch是否找到:', !!scriptMatch)
    console.log('解析的JS内容长度:', jsContent.length)

    // 检测script类型
    if (jsContent) {
      // 检查是否包含import语句或ES6语法
      if (jsContent.includes('import ') || jsContent.includes('export ') || jsContent.includes('=>') || jsContent.includes('const ')) {
        jsType = 'module'
      } else {
        jsType = 'classic'
      }
    }

    // 提取 style 部分
    const styleMatch = cleanedContent.match(/<style>([\s\S]*?)<\/style>/)
    const cssContent = styleMatch ? styleMatch[1]?.trim() : ''

    // 提取标题（在settings外部）
    const titleMatch = cleanedContent.match(/<title>([\s\S]*?)<\/title>/)
    const title = titleMatch ? titleMatch[1]?.trim() : ''
    console.log('解析的title:', title)

    // 提取描述（在meta标签中）
    const descMatch = cleanedContent.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/)
    const description = descMatch ? descMatch[1]?.trim() : ''
    console.log('解析的description:', description)

    // 提取 settings 部分
    let headHtmlContent = ''
    let cssLinks: string[] = []
    let jsLinks: string[] = []

    const settingsMatch = cleanedContent.match(/<settings>([\s\S]*?)<\/settings>/)
    if (settingsMatch) {
      const settingsContent = settingsMatch[1]
      console.log('找到settings部分，内容长度:', settingsContent!.length)

      // 提取 headHtmlContent (匹配 head-metadata 标签)
      const headHtmlMatch = settingsContent!.match(/<head-metadata>([\s\S]*?)<\/head-metadata>/)
      if (headHtmlMatch) {
        headHtmlContent = headHtmlMatch[1]?.trim() || ''
        console.log('解析的headHtmlContent长度:', headHtmlContent.length)
      }

      // 提取 CSS 链接 (匹配 css-links 标签)
      const cssLinksMatch = settingsContent!.match(/<css-links>([\s\S]*?)<\/css-links>/)
      if (cssLinksMatch) {
        const cssLinksContent = cssLinksMatch[1]
        // 新格式：每行一个链接内容，去除前后空格后非空
        const linkLines = cssLinksContent!.split('\n').map(line => line.trim()).filter(Boolean)
        cssLinks = linkLines
        console.log('解析的cssLinks数量:', cssLinks.length)
      }

      // 提取 JS 链接 (匹配 js-links 标签)
      const jsLinksMatch = settingsContent!.match(/<js-links>([\s\S]*?)<\/js-links>/)
      if (jsLinksMatch) {
        const jsLinksContent = jsLinksMatch[1]
        // 新格式：每行一个链接内容，去除前后空格后非空
        const scriptLines = jsLinksContent!.split('\n').map(line => line.trim()).filter(Boolean)
        jsLinks = scriptLines
        console.log('解析的jsLinks数量:', jsLinks.length)
      }
    } else {
      console.log('未找到settings部分')
    }

    return {
      engineType: engineType ?? 'default',
      html: htmlContent ?? '',
      css: cssContent ?? '',
      js: jsContent,
      headHtmlContent,
      cssLinks,
      jsLinks,
      title: title ?? '',
      description: description ?? '',
      jsType
    }
  } catch (error) {
    console.error('解析分享文件内容失败:', error)
    throw new Error(`分享文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 解析URL中的模板类型参数
 * @return {Promise<string>} 返回模板类型字符串，默认返回'default'
 * @example
 * // URL: https://example.com?type=mars3d
 * const type = await parseEngineType() // 返回 'mars3d'
 * // URL: https://example.com (无type参数)
 * const type = await parseEngineType() // 返回 'default'
 */
export const parseEngineType = async (): Promise<string> => {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const typeParam = urlParams.get('type')

    if (!typeParam) return 'default'

    // 解码URL参数，处理浏览器自动编码的情况
    try {
      const decodedTypeParam = decodeURIComponent(typeParam)
      return decodedTypeParam
    } catch (decodeError) {
      console.warn('URL type参数解码失败，使用原始值:', decodeError)
      return typeParam
    }
  } catch (error) {
    console.error('解析URL type参数失败:', error)
    return 'default'
  }
}

/**
 * 解析HTML文件内容，提取模板数据和设置信息
 * 支持解析包含<engine-type>、<template>、<script>、<style>、<settings>等标签的HTML文件
 * @param {string} fileUrl HTML文件URL，默认为'./demo.html'
 * @return {Promise<ParsedExampleData>} 返回解析后的示例数据对象
 * @throws {Error} 文件加载失败时抛出异常
 * @example
 * // 解析默认demo文件
 * const data = await parseDemoHtml()
 * console.log(data.html) // HTML内容
 *
 * // 解析指定文件
 * const data = await parseDemoHtml('./examples/mars3d/demo.html')
 * console.log(data.engineType) // 'mars3d'
 */
export const parseDemoHtml = async (fileUrl: string = './demo.html'): Promise<ParsedExampleData> => {
  try {
    const response = await fetch(fileUrl)
    const content = await response.text()

    // 提取模板类型
    const typeMatch = content.match(/<engine-type>([\s\S]*?)<\/engine-type>/)
    const engineType = typeMatch ? typeMatch[1]?.trim() : undefined

    // 提取 template 部分
    const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/)
    const htmlContent = templateMatch ? templateMatch[1]?.trim() : ''

    // 提取 script 部分
    let jsType = '';
    const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/)
    let jsContent = scriptMatch ? scriptMatch[1]?.trim() : ''

    const scriptModuleMatch = content.match(/<script type="module">([\s\S]*?)<\/script>/)
    if (scriptModuleMatch) {
      jsType = 'module';
      jsContent = scriptModuleMatch[1]?.trim()
    }

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
      engineType: engineType ?? "default",
      html: htmlContent ?? "",
      css: cssContent ?? "",
      js: jsContent ?? "",
      headHtmlContent,
      cssLinks,
      jsLinks,
      title,
      description,
      jsType,
    }
  } catch (error) {
    console.error('读取 demo.html 失败:', error)
    return {
      engineType: "default",
      html: "",
      css: "",
      js: "",
      headHtmlContent: "",
      cssLinks: [],
      jsLinks: [],
      title: '',
      description: '',
      jsType: '',
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
 * 获取当前全局设置的副本
 * @return {Settings} 当前设置对象的浅拷贝
 * @example
 * const settings = getCurrentSettings()
 * console.log(settings.cssLinks) // 当前CSS链接列表
 */
export const getCurrentSettings = (): Settings => {
  return { ...currentSettings }
}

/**
 * 保存新的设置到全局存储
 * 自动过滤空链接并更新时间戳
 * @param {string} headHtmlContent Head HTML内容
 * @param {string[]} cssLinks CSS链接数组
 * @param {string[]} jsLinks JS链接数组
 * @return {void} 无返回值
 * @example
 * saveSettings(
 *   '<meta name="author" content="John">',
 *   ['style1.css', 'style2.css'],
 *   ['script1.js']
 * )
 * console.log(getCurrentSettings().timestamp) // 更新的时间戳
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
}

// 其他工具函数

/**
 * 根据编程语言名称获取对应的代码编辑器语言扩展
 * @param {string} language 编程语言名称
 * @return {string} 对应的语言扩展标识符
 * @example
 * getLanguageExtension('html') // 'html'
 * getLanguageExtension('javascript') // 'javascript'
 * getLanguageExtension('unknown') // 'plaintext'
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
 * 向CSS链接数组添加新链接（addLink的CSS专用版本）
 * @param {string[]} cssLinks CSS链接数组
 * @return {void} 无返回值
 * @example
 * const cssLinks = []
 * addCssLink(cssLinks) // 添加空字符串
 */
export const addCssLink = (cssLinks: string[]): void => {
  addLink(cssLinks)
}

/**
 * 从CSS链接数组删除指定索引的链接（removeLink的CSS专用版本）
 * @param {string[]} cssLinks CSS链接数组
 * @param {number} index 要删除的链接索引
 * @return {void} 无返回值
 * @example
 * const cssLinks = ['style1.css', 'style2.css']
 * removeCssLink(cssLinks, 0) // 删除第一个链接
 */
export const removeCssLink = (cssLinks: string[], index: number): void => {
  removeLink(cssLinks, index)
}

/**
 * 向JS链接数组添加新链接（addLink的JS专用版本）
 * @param {string[]} jsLinks JS链接数组
 * @return {void} 无返回值
 * @example
 * const jsLinks = []
 * addJsLink(jsLinks) // 添加空字符串
 */
export const addJsLink = (jsLinks: string[]): void => {
  addLink(jsLinks)
}

/**
 * 从JS链接数组删除指定索引的链接（removeLink的JS专用版本）
 * @param {string[]} jsLinks JS链接数组
 * @param {number} index 要删除的链接索引
 * @return {void} 无返回值
 * @example
 * const jsLinks = ['script1.js', 'script2.js']
 * removeJsLink(jsLinks, 1) // 删除第二个链接
 */
export const removeJsLink = (jsLinks: string[], index: number): void => {
  removeLink(jsLinks, index)
}

/**
 * 将HTML内容下载为文件到本地
 * 创建临时下载链接并自动触发下载
 * @param {string} fullHtml 要下载的完整HTML内容
 * @param {string} fileName 下载文件名，默认为'code-sandbox.html'
 * @return {void} 无返回值
 * @example
 * downloadHtml('<html><body>Hello World</body></html>', 'my-page.html')
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
