/**
 * IndexedDB 客户端助手
 * 用于预览页面从IndexedDB获取数据
 */

/**
 * 打开 IndexedDB 数据库
 */
const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CodeSandboxDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('previews')) {
        db.createObjectStore('previews')
      }
    }
  })
}

/**
 * 从 IndexedDB 获取数据并立即清理
 */
const getDataFromIndexedDB = async (token) => {
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
        const data = request.result
        
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

// 导出给外部使用
window.getDataFromIndexedDB = getDataFromIndexedDB