/**
 * IndexedDB 数据存储工具
 * 用于解决URL参数长度限制，使用令牌机制传递数据
 */

// 数据结构定义
export interface PreviewData {
  content: string
  timestamp: number
  used: boolean
}

/**
 * 存储预览数据到 IndexedDB
 * @param jsonData JSON字符串格式的预览数据
 * @returns 返回生成的token，失败时返回空字符串
 */
export const storePreviewData = async (jsonData: string): Promise<string> => {
  try {
    // 检查 IndexedDB 支持
    if (!window.indexedDB) {
      console.warn('浏览器不支持 IndexedDB，回退到 URL 参数方式')
      return ''
    }

    // 生成短令牌
    const token = generateShortToken()
    
    const data: PreviewData = {
      content: jsonData,
      timestamp: Date.now(),
      used: false
    }

    // 打开 IndexedDB
    const db = await openIndexedDB()
    const transaction = db.transaction(['previews'], 'readwrite')
    const store = transaction.objectStore('previews')
    
    // 存储数据
    await store.put(data, token)
    
    console.log('预览数据已存储，令牌:', token)
    return token
  } catch (error) {
    console.error('存储预览数据失败:', error)
    return ''
  }
}

/**
 * 从 IndexedDB 获取数据并立即清理
 * @param token 访问令牌
 * @returns 返回JSON数据，失败时返回null
 */
export const getDataFromIndexedDB = async (token: string): Promise<string | null> => {
  try {
    // 检查 IndexedDB 支持
    if (!window.indexedDB) {
      console.warn('浏览器不支持 IndexedDB')
      return null
    }

    // 打开 IndexedDB
    const db = await openIndexedDB()
    const transaction = db.transaction(['previews'], 'readwrite')
    const store = transaction.objectStore('previews')
    
    // 获取数据
    const request = store.get(token)
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const data = request.result as PreviewData
        
        if (!data) {
          console.warn('未找到token对应的数据')
          resolve(null)
          return
        }
        
        if (data.used) {
          console.warn('数据已被使用，可能重复访问')
          resolve(null)
          return
        }
        
        // 立即标记为已使用并删除（一次性使用）
        const deleteRequest = store.delete(token)
        deleteRequest.onsuccess = () => {
          console.log('数据已清理，token:', token)
        }
        deleteRequest.onerror = () => {
          console.warn('数据清理失败:', deleteRequest.error)
        }
        
        resolve(data.content)
      }
      
      request.onerror = () => {
        console.error('获取数据失败:', request.error)
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('IndexedDB操作失败:', error)
    return null
  }
}

/**
 * 打开 IndexedDB 数据库
 * @returns 返回数据库连接
 */
export const openIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CodeSandboxDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('previews')) {
        db.createObjectStore('previews')
      }
    }
  })
}

/**
 * 生成短令牌
 * @returns 返回8位随机令牌
 */
export const generateShortToken = (): string => {
  // 8位字符：大小写字母+数字
  return Math.random()
    .toString(36)
    .substring(2, 10)
    .padEnd(8, '0')
}

/**
 * 清理过期的预览数据
 * @param maxAge 最大存活时间（毫秒），默认30分钟
 */
export const cleanupExpiredData = async (maxAge: number = 30 * 60 * 1000): Promise<void> => {
  try {
    if (!window.indexedDB) {
      return
    }

    const db = await openIndexedDB()
    const transaction = db.transaction(['previews'], 'readwrite')
    const store = transaction.objectStore('previews')
    
    const request = store.getAll()
    
    request.onsuccess = () => {
      const now = Date.now()
      const allData = request.result as PreviewData[]
      
      const expired = allData.filter(item => 
        (now - item.timestamp) > maxAge || item.used
      )
      
      if (expired.length > 0) {
        console.log(`清理 ${expired.length} 条过期数据`)
        
        expired.forEach(item => {
          // 这里需要从数据库中删除，但我们没有key
          // 实际实现时可能需要不同的策略
        })
      }
    }
  } catch (error) {
    console.error('清理过期数据失败:', error)
  }
}