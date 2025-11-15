// 模板管理器

export interface TemplateVariables {
  title?: string
  htmlContent: string
  cssContent: string
  jsContent: string
  headHtmlContent?: string
  cssLinks?: string
  jsLinks?: string
  [key: string]: string | string[] | undefined
}

export interface TemplateConfig {
  name: string
  description: string
  file: string
}

// 模板配置
const templateConfigs: TemplateConfig[] = [
  {
    name: 'default',
    description: '默认Vue 3模板',
    file: 'default.html'
  }
  // 未来可以添加更多模板
]

// 模板变量默认值
const defaultVariables: Partial<TemplateVariables> = {
  title: 'CodeSandbox Preview'
}

// 读取模板文件
const readTemplateFile = async (templateName: string): Promise<string> => {
  const config = templateConfigs.find(t => t.name === templateName)
  if (!config) {
    throw new Error(`Template "${templateName}" not found`)
  }

  try {
    // 从public目录加载模板文件，使用相对路径
    const response = await fetch(`./templates/${config.file}`)
    if (!response.ok) {
      throw new Error(`Failed to load template file: ${config.file}`)
    }
    return await response.text()
  } catch (error) {
    // 如果动态加载失败，返回默认模板
    console.warn(`Failed to load template "${templateName}", using default template instead`)
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  {{headHtmlContent}}
  {{cssLinks}}
  {{jsLinks}}
  <style>
    {{cssContent}}
  </style>
</head>
<body>
  <div id="app">
    {{htmlContent}}
  </div>
  <script>
    {{jsContent}}
  </script>
</body>
</html>`
  }
}

// 替换模板变量
const replaceTemplateVariables = (template: string, variables: TemplateVariables): string => {
  let result = template

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`

    // 处理数组类型的变量（如 cssLinks, jsLinks）
    if (Array.isArray(value)) {
      // 将数组转换为字符串，每个元素用换行符分隔
      const arrayValue = value.filter(item => item.trim() !== '').join('\n')
      result = result.replace(new RegExp(placeholder, 'g'), arrayValue)
    } else {
      // 处理字符串类型的变量
      result = result.replace(new RegExp(placeholder, 'g'), value || '')
    }
  }

  return result
}

// 主模板生成函数
export const generateHtml = async (
  variables: TemplateVariables,
  templateName: string = 'default'
): Promise<string> => {
  // 合并默认变量
  const mergedVariables: TemplateVariables = {
    ...defaultVariables,
    ...variables
  }

  // 读取模板
  const template = await readTemplateFile(templateName)

  // 替换变量
  return replaceTemplateVariables(template, mergedVariables)
}

// 获取可用模板列表
export const getAvailableTemplates = (): TemplateConfig[] => {
  return [...templateConfigs]
}

// 验证模板变量
export const validateTemplateVariables = (variables: TemplateVariables): string[] => {
  const errors: string[] = []

  if (!variables.htmlContent) {
    errors.push('htmlContent is required')
  }

  if (!variables.cssContent) {
    errors.push('cssContent is required')
  }

  if (!variables.jsContent) {
    errors.push('jsContent is required')
  }

  return errors
}
