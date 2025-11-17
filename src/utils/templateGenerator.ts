// 模板生成器

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
 * 渲染模板内容
 * @param template 模板字符串
 * @param variables 模板变量对象
 * @returns 渲染后的HTML字符串
 */
const renderTemplate = (
  template: string,
  variables: Record<string, any>
): string => {
  let result = template

  // 替换所有变量占位符 {{variable}} 和 <%= variable %>
  for (const [key, value] of Object.entries(variables)) {
    // 替换 <%= variable %> 格式
    result = result.replace(new RegExp(`<%=\\s*${key}\\s*>`, 'g'), value || '')
    // 替换 {{ variable }} 格式（兼容旧的模板格式）
    result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value || '')
  }

  // 处理 <%- %> 格式（不转义HTML，适用于HTML内容）
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`<%-\\s*${key}\\s*>`, 'g'), value || '')
  }

  // 处理条件语句 <% if (condition) { %> ... <% } %>
  result = result.replace(
    /<%\s*if\s*\(([^)]+)\)\s*%>([\s\S]*?)<%\s*}\s*%>/g,
    (match, condition, content) => {
      try {
        // 简单的条件评估（注意：生产环境中应该使用更安全的方法）
        const evaluated = new Function('variables', `with(variables) { return ${condition} }`)(variables)
        return evaluated ? content : ''
      } catch (error) {
        console.warn('Failed to evaluate template condition:', condition, error)
        return content // 如果条件评估失败，返回原内容
      }
    }
  )

  return result
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
