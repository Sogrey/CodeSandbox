// 模板生成器
import ejs from 'ejs'

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
    const templatePath = `/templates/${templateType}.html`
    
    // 获取模板文件内容
    const response = await fetch(templatePath)
    if (!response.ok) {
      throw new Error(`无法加载模板文件: ${templatePath}`)
    }
    
    let templateContent = await response.text()
    
    // 使用EJS渲染模板
    const renderedHtml = await ejs.render(templateContent, {
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
