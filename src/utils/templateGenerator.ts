// 模板生成器

/**
 * 生成扩展的HTML模板文件
 * @param htmlContent HTML内容
 * @param cssContent CSS内容
 * @param jsContent JS内容
 * @param headHtmlContent Head HTML内容
 * @param cssLinks CSS链接数组
 * @param jsLinks JS链接数组
 * @returns 生成的模板字符串
 */
export const generateExtendedTemplate = (
  htmlContent: string,
  cssContent: string,
  jsContent: string,
  headHtmlContent: string,
  cssLinks: string[],
  jsLinks: string[]
): string => {
  return `
<!-- CodeSandbox Template File -->
<!-- 该文件包含完整的模板数据和设置信息，可以被重新导入 -->
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
 * @param templateVariables 模板变量
 * @param isPreview 是否为预览模式
 * @returns 生成的完整HTML字符串
 */
export const buildFullHtml = async (
  templateVariables: {
    htmlContent: string
    cssContent: string
    jsContent: string
    headHtmlContent?: string
    cssLinks?: string
    jsLinks?: string
  },
  isPreview: boolean = false
): Promise<string> => {
  const { htmlContent, cssContent, jsContent, headHtmlContent = '', cssLinks = '', jsLinks = '' } = templateVariables

  // 构建完整的HTML
  const fullHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeSandbox Preview</title>
    ${headHtmlContent}
    ${cssLinks}
    <style>
    ${cssContent}
    </style>
</head>
<body>
    ${htmlContent}
    ${jsLinks}

    ${isPreview ?
      '<script>\n' +
      '// 设置预览模式相关的逻辑\n' +
      'console.log("Preview mode active");\n' +
      jsContent +
      '\n</script>' :
      '<script>\n' + jsContent + '\n</script>'
    }
</body>
</html>
`
  return fullHtml
}
