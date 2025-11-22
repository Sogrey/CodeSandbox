/**
 * templateGenerator.ts
 * 模板生成器和渲染工具
 * 提供HTML模板生成、Mustache渲染、完整HTML文件构建等功能
 * @author Sogrey
 * @date 2025-06-01 00:00:00
 * @lastModify 2025-11-17 00:00:00
 * @version 1.0.0
 */

// 模板生成器
import Mustache from 'mustache'

import type { ParsedExampleData } from './componentHelpers'
import { generateCssLinks, generateJsLinks } from './componentHelpers'

/**
 * 生成扩展的HTML模板文件字符串
 * 创建包含模板数据和设置信息的完整模板，可以被重新导入和解析
 * @param {ParsedExampleData} data 包含所有模板数据的对象
 * @return {string} 生成的扩展模板字符串
 * @example
 * const data = {
 *   engineType: 'default',
 *   html: '<div>Hello</div>',
 *   css: 'body{margin:0}',
 *   js: 'console.log("hello")',
 *   title: 'My Demo',
 *   description: 'Demo description',
 *   headHtmlContent: '<meta name="author" content="John">',
 *   cssLinks: ['style.css'],
 *   jsLinks: ['script.js']
 * }
 * const template = generateExtendedTemplate(data)
 * console.log(template) // 包含<engine-type>、<template>等标签的字符串
 */
export const generateExtendedTemplate = (data: ParsedExampleData): string => {
  const pageTitle = data.title || 'CodeSandbox Preview'
  const pageDescription = data.description || 'A code sandbox preview page'

  return `
<!-- CodeSandbox Template File -->
<!-- 该文件包含完整的模板数据和设置信息，可以被重新导入 -->
<engine-type>${data.engineType}</engine-type>
<title>${pageTitle}</title>
<meta name="description" content="${pageDescription}" />
<template>
${data.html}
</template>
<script${data.jsType === 'module' ? ' type="module"' : ''}>
${data.js}
</script>
<style>
${data.css}
</style>

<!-- Settings Section - 设置数据，将被自动解析 -->
<settings>
<head-metadata>
${data.headHtmlContent}
</head-metadata>
<css-links>
${data.cssLinks.join('\n')}
</css-links>
<js-links>
${data.jsLinks.join('\n')}
</js-links>
</settings>
`
}

/**
 * 使用Mustache引擎渲染模板内容
 * 将模板变量替换到模板字符串中，生成最终的HTML内容
 * @param {string} template 包含Mustache语法的模板字符串
 * @param {Record<string, string | boolean>} variables 模板变量对象
 * @return {string} 渲染后的HTML字符串
 * @throws {Error} 模板渲染失败时抛出异常
 * @example
 * const template = '<title>{{title}}</title><div>{{content}}</div>'
 * const variables = { title: 'My Page', content: 'Hello World' }
 * const result = renderTemplate(template, variables)
 * console.log(result) // '<title>My Page</title><div>Hello World</div>'
 */
const renderTemplate = (
  template: string,
  variables: Record<string, string | boolean>
): string => {
  // 直接使用 Mustache 渲染模板（模板文件已经使用标准 Mustache 语法）
  try {
    return Mustache.render(template, variables)
  } catch (error) {
    console.error('模板渲染失败:', error)
    throw error
  }
}

/**
 * 生成完整的HTML文件内容
 * 根据模板类型加载对应的模板文件，使用Mustache渲染生成最终的HTML页面
 * 如果模板加载失败，会回退到默认模板
 * @param {ParsedExampleData} data 包含页面所有数据的对象
 * @return {Promise<string>} 生成的完整HTML字符串
 * @throws {Error} 模板加载失败时使用回退模板，不会抛出异常
 * @example
 * const data = {
 *   engineType: 'mars3d',
 *   html: '<div id="map"></div>',
 *   css: '#map{height:100vh}',
 *   js: 'const map = new mars3d.Map("mapContainer")',
 *   // ... 其他属性
 * }
 * const html = await buildFullHtml(data)
 * console.log(html) // 包含mars3d依赖的完整HTML页面
 */
export const buildFullHtml = async (data: ParsedExampleData): Promise<string> => {
  const { engineType, html, css, js, headHtmlContent, cssLinks, jsLinks, title, description, jsType } = data

  const pageTitle = title || 'CodeSandbox Preview'
  const pageDescription = description || 'A code sandbox preview page'

  try {
    // 构建模板文件路径
    const templatePath = `./templates/${engineType}.html`

    // 获取模板文件内容
    const response = await fetch(templatePath)
    if (!response.ok) {
      throw new Error(`无法加载模板文件: ${templatePath}`)
    }

    const templateContent = await response.text()

    // 使用自定义模板渲染器
    const renderedHtml = renderTemplate(templateContent, {
      title: pageTitle,
      description: pageDescription,
      htmlContent: html,
      cssContent: css,
      jsContent: js,
      headHtmlContent,
      cssLinks: generateCssLinks(cssLinks),
      jsLinks: generateJsLinks(jsLinks),
      jsType
    })

    return renderedHtml
  } catch (error) {
    console.error(`加载模板文件失败 (${engineType}):`, error)

    // 如果模板加载失败，回退到默认模板
    const fallbackTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDescription}" />
    ${headHtmlContent}
    ${generateCssLinks(cssLinks)}
    <style>
    ${css}
    </style>
</head>
<body>
    ${html}
    ${generateJsLinks(jsLinks)}

    <script type="${jsType}">
    <script${jsType === 'module' ? ' type="module"' : ''}>
    ${js}
    </script>
</body>
</html>`
    return fallbackTemplate
  }
}
