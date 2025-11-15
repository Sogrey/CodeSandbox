// HTML模板生成工具

export interface FileContents {
  htmlContent: string
  cssContent: string
  jsContent: string
}

// 生成完整的HTML模板
export const buildFullHtml = (contents: FileContents, withNewLine = true): string => {
  const { htmlContent, cssContent, jsContent } = contents

  const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeSandbox Preview</title>
  <style>
    ${cssContent}
  </style>
</head>
<body>
  <div id="app">
    ${htmlContent}
  </div>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <script>
    ${jsContent}
  </script>
</body>
</html>`

  return withNewLine ? '\n' + htmlTemplate : htmlTemplate
}
