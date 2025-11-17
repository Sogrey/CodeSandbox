// 模板生成器
import Mustache from 'mustache'

/**
 * 生成扩展的HTML模板文件
 * @param htmlContent HTML内容
 * @param cssContent CSS内容
 * @param jsContent JS内容
 * @param headHtmlContent Head HTML内容
 * @param cssLinks CSS链接数组
 * @param jsLinks JS链接数组
 * @param title 页面标题
 * @param description 页面描述
 * @returns 生成的模板字符串
 */
export const generateExtendedTemplate = (
  templateType: string | 'default',
  htmlContent: string,
  cssContent: string,
  jsContent: string,
  headHtmlContent: string,
  cssLinks: string[],
  jsLinks: string[],
  title?: string,
  description?: string
): string => {
  const pageTitle = title || 'CodeSandbox Preview'
  const pageDescription = description || 'A code sandbox preview page'

  return `
<!-- CodeSandbox Template File -->
<!-- 该文件包含完整的模板数据和设置信息，可以被重新导入 -->
<type>${templateType}</type>
<title>${pageTitle}</title>
<meta name="description" content="${pageDescription}" />
<template>
${htmlContent}
</template>
<script>
${jsContent}
</script>
<style>
${cssContent}
</style>

<!-- Settings Section - 设置数据，将被自动解析 -->
<settings>
<head-metadata>
${headHtmlContent}
</head-metadata>
<css-links>
${cssLinks.filter(link => link.trim() !== '').map(link => link.trim()).join('\n')}
</css-links>
<js-links>
${jsLinks.filter(link => link.trim() !== '').map(link => link.trim()).join('\n')}
</js-links>
</settings>
`
}

/**
 * 生成完整的HTML文件
 * @param templateType 模板类型，对应 public/templates/ 目录下的文件名
 * @param templateVariables 模板变量
 * @param isPreview 是否为预览模式
 * @param title 页面标题
 * @param description 页面描述
 * @returns 生成的完整HTML字符串
 * @example
 * // 使用默认模板
 * const html = await buildFullHtml('default', templateData)
 * @example
 * // 使用自定义模板
 * const html = await buildFullHtml('vue3', templateData)
 */
/**
 * 渲染模板内容（使用 Mustache 引擎）
 * @param template 模板字符串
 * @param variables 模板变量对象
 * @returns 渲染后的HTML字符串
 */
const renderTemplate = (
  template: string,
  variables: Record<string, any>
): string => {
  // 预处理模板：将 <%= %> 和 <%- %> 转换为 Mustache 语法
  let processedTemplate = template
  
  // 转换 <%= variable %> 为 {{variable}}（转义输出）
  processedTemplate = processedTemplate.replace(/<%=\s*(\w+)\s*%>/g, '{{$1}}')
  
  // 转换 <%- variable %> 为 {{{variable}}}（不转义输出）
  processedTemplate = processedTemplate.replace(/<%-\s*(\w+)\s*%>/g, '{{$1}}')
  
  // 处理条件语句：<% if (condition) { %> ... <% } %>
  processedTemplate = processedTemplate.replace(
    /<%\s*if\s*\(([^)]+)\)\s*%>([\s\S]*?)<%\s*}\s*%>/g,
    (match, condition, content) => {
      // Mustache 条件语法：{{#condition}} ... {{/condition}}
      return `{{#${condition}}}${content}{{/${condition}}`
    }
  )

  // 使用 Mustache 渲染模板
  try {
    return Mustache.render(processedTemplate, variables)
  } catch (error) {
    console.error('模板渲染失败:', error)
    throw error
  }
}

/**
 * 生成完整的HTML文件
 * @param templateType 模板类型，对应 public/templates/ 目录下的文件名
 * @param templateVariables 模板变量
 * @param isPreview 是否为预览模式
 * @param title 页面标题
 * @param description 页面描述
 * @returns 生成的完整HTML字符串
 * @example
 * // 使用默认模板
 * const html = await buildFullHtml('default', templateData)
 * @example
 * // 使用自定义模板
 * const html = await buildFullHtml('vue3', templateData)
 */
export const buildFullHtml = async (
  templateType: string | 'default',
  templateVariables: {
    htmlContent: string
    cssContent: string
    jsContent: string
    headHtmlContent?: string
    cssLinks?: string
    jsLinks?: string
  },
  isPreview: boolean = false,
  title?: string,
  description?: string
): Promise<string> => {
  const { htmlContent, cssContent, jsContent, headHtmlContent = '', cssLinks = '', jsLinks = '' } = templateVariables

  const pageTitle = title || 'CodeSandbox Preview'
  const pageDescription = description || 'A code sandbox preview page'

  try {
    // 构建模板文件路径
    const templatePath = `./templates/${templateType}.html`

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
      htmlContent,
      cssContent,
      jsContent,
      headHtmlContent,
      cssLinks,
      jsLinks,
      isPreview
    })

    return renderedHtml
  } catch (error) {
    console.error(`加载模板文件失败 (${templateType}):`, error)

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
    ${cssLinks}
    <style>
    ${cssContent}
    </style>
</head>
<body>
    ${htmlContent}
    ${jsLinks}
    <script>
    ${isPreview ? '// 设置预览模式相关的逻辑\nconsole.log("Preview mode active");\n' : ''}
    ${jsContent}
    </script>
</body>
</html>`
    return fallbackTemplate
  }
}
