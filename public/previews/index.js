

/**
 * 预览页面解密工具
 * 用于解密从CodeSandbox组件传递的加密内容
 */

/**
 * 解密函数
 * @param {string} encryptedData 加密的Base64字符串
 * @param {string} key 解密密钥，需要与加密时使用的一致
 * @return {string} 解密后的原始字符串
 */
const decryptContent = (encryptedData, key = 'CodeSandbox2025') => {
  try {
    // 处理URL编码问题 - URL传递会自动编码，需要先解码
    let processedData = encryptedData

    // 如果数据包含URL编码字符，先进行一次解码
    if (/%[0-9A-Fa-f]{2}/.test(encryptedData)) {
      processedData = decodeURIComponent(encryptedData)
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

    // 第一层：Base64解码（转换为UTF-8字节数组）
    const base64Decoded = atob(paddedBase64)
    const utf8Bytes = new Uint8Array(base64Decoded.split('').map(char => char.charCodeAt(0)))
    const decoded = new TextDecoder().decode(utf8Bytes)

    // 第二层：XOR解密
    const xorDecoded = decoded.split('').map((char, index) => {
      const keyChar = key[index % key.length]
      if (!keyChar) {
        throw new Error('解密密钥不能为空')
      }
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0))
    }).join('')

    return xorDecoded
  } catch (error) {
    console.error('内容解密失败:', error)
    console.error('错误详情:', {
      encryptedData: encryptedData,
      dataType: typeof encryptedData,
      dataLength: encryptedData?.length
    })

    // 尝试回退到简单的Base64解码
    try {
      const base64Decoded = atob(processedData)
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

/**
 * 获取URL参数并解密内容
 */
const getDecryptedContent = () => {
  try {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search)
    const encryptedContent = urlParams.get('content')

    if (!encryptedContent) {
      console.warn('未找到content参数')
      return null
    }

    // 解密内容
    const decryptedJson = decryptContent(encryptedContent)

    // 检查是否是有效的JSON格式
    if (!decryptedJson.trim().startsWith('{') && !decryptedJson.trim().startsWith('[')) {
      console.error('可能的原因: 加解密不匹配或数据损坏')
      return null
    }

    // 解析为JSON对象
    let data
    try {
      data = JSON.parse(decryptedJson)
    } catch (jsonError) {
      console.error('JSON解析失败:', jsonError.message)
      console.error('原始数据:', decryptedJson)

      // 尝试修复常见的JSON问题
      try {
        const fixedJson = decryptedJson
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 移除控制字符
          .replace(/\\n/g, '\\\\n') // 修复换行符
          .replace(/\\n/g, '\\\\n') // 修复回车符
          .replace(/\\t/g, '\\\\t') // 修复制表符

        data = JSON.parse(fixedJson)
        console.log('修复后成功解析JSON')
      } catch (fixError) {
        console.error('JSON修复也失败:', fixError.message)
        return null
      }
    }

    // console.log('解密后的JSON数据:', data)

    return data
  } catch (error) {
    console.error('解密过程失败:', error)
    return null
  }
}

/**
 * 页面加载完成后自动执行解密
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('开始解密URL参数中的content...')

  const decryptedData = getDecryptedContent()

  if (decryptedData) {
    // console.log('成功解密数据:', decryptedData)
    console.log('页面标题:', decryptedData.title)
    console.log('引擎类型:', decryptedData.engineType)
    console.log('HTML内容长度:', decryptedData.html?.length || 0)
    console.log('CSS内容长度:', decryptedData.css?.length || 0)
    console.log('JS内容长度:', decryptedData.js?.length || 0)
  } else {
    console.error('解密失败或无有效数据')
  }

  if (!decryptedData) {
    console.error('无有效解密数据，停止处理')
    return
  }

  const {
    engineType,
    html,
    css,
    js,
    title,
    description,
    headHtmlContent,
    cssLinks,
    jsLinks,
    jsType
  } = decryptedData;

  // 解密后的内容处理

  try {
    // 1. 更新页面 title 和 description
    if (title) {
      document.title = title
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.name = 'description'
        document.head.appendChild(metaDesc)
      }
      metaDesc.content = description
    }

    // 2. 将 headHtmlContent 插入到 head 中
    if (headHtmlContent) {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = headHtmlContent
      Array.from(tempDiv.children).forEach(child => {
        document.head.appendChild(child.cloneNode(true))
      })
    }

    // 3. 将 cssLinks 插入到 head 中
    if (cssLinks && cssLinks.length > 0) {
      cssLinks.forEach(link => {
        if (link.trim()) {
          const linkElement = document.createElement('link')
          linkElement.rel = 'stylesheet'
          linkElement.href = link.trim()
          document.head.appendChild(linkElement)
        }
      })
    }

    // 4. 创建样式元素并插入到 head 中
    if (css) {
      const styleElement = document.createElement('style')
      styleElement.textContent = css
      document.head.appendChild(styleElement)
    }

    // 5. 将 html 内容插入到 body 根节点下
    if (html) {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html

      // 将所有子节点移动到 body 的根节点下
      Array.from(tempDiv.children).forEach(child => {
        document.body.appendChild(child.cloneNode(true))
      })
    }

    // 6. 异步加载第三方库并等待完成后执行用户脚本
    const loadThirdPartyLibraries = () => {
      return new Promise((resolve, reject) => {
        if (!jsLinks || jsLinks.length === 0) {
          resolve([])
          return
        }

        const validLinks = jsLinks.filter(link => link.trim())
        if (validLinks.length === 0) {
          resolve([])
          return
        }

        let loadedCount = 0
        let errorCount = 0
        const totalLinks = validLinks.length
        const results = []

        console.log(`开始加载 ${totalLinks} 个第三方库...`)

        validLinks.forEach((link, index) => {
          const scriptElement = document.createElement('script')
          scriptElement.src = link.trim()
          scriptElement.async = false // 按顺序加载

          scriptElement.onload = () => {
            loadedCount++
            results[index] = { success: true, link }
            console.log(`第三方库加载成功 (${loadedCount}/${totalLinks}): ${link}`)

            if (loadedCount + errorCount === totalLinks) {
              console.log('所有第三方库加载完成')
              resolve(results)
            }
          }

          scriptElement.onerror = () => {
            errorCount++
            results[index] = { success: false, link, error: '加载失败' }
            console.error(`第三方库加载失败 (${errorCount}/${totalLinks}): ${link}`)

            // 即使有失败也继续，不阻止用户脚本执行
            if (loadedCount + errorCount === totalLinks) {
              console.log('第三方库加载完成（部分失败）')
              resolve(results)
            }
          }

          document.head.appendChild(scriptElement)
        })
      })
    }

    // 7. 执行用户脚本
    const executeUserScript = () => {
      if (js) {
        try {
          console.log('开始执行用户脚本...')
          const scriptElement = document.createElement('script')
          scriptElement.textContent = js
          if (jsType && jsType === 'module') {
            scriptElement.type = 'module'
          }
          document.body.appendChild(scriptElement)
          console.log('用户脚本执行完成')
        } catch (error) {
          console.error('用户脚本执行出错:', error)
        }
      } else {
        console.log('无用户脚本需要执行')
      }
    }

    // 加载第三方库并执行用户脚本
    loadThirdPartyLibraries()
      .then((results) => {
        const successCount = results.filter(r => r.success).length
        const failureCount = results.length - successCount

        if (failureCount > 0) {
          console.warn(`${failureCount} 个第三方库加载失败，但仍继续执行用户脚本`)
        }

        // 等待一小段时间确保所有库都初始化完成
        setTimeout(executeUserScript, 100)
      })
      .catch((error) => {
        console.error('加载第三方库时出现异常:', error)
        // 即使加载异常，也尝试执行用户脚本
        executeUserScript()
      })

    console.log('页面内容更新完成')
  } catch (error) {
    console.error('更新页面内容时出错:', error)
  }

})

// 也可以手动调用解密
window.decryptPreviewContent = getDecryptedContent
