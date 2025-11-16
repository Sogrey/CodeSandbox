import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 暂时禁用vue-devtools插件以避免解析错误
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // GitHub Pages 部署配置
  base: '/CodeSandbox/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000, // 提高警告限制
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 将codemirror核心包单独分包
          if (id.includes('node_modules/codemirror/dist')) {
            return 'codemirror-core'
          }
          
          // 将codemirror语言包分包
          if (id.includes('node_modules/@codemirror/lang-javascript')) {
            return 'codemirror-js'
          }
          
          if (id.includes('node_modules/@codemirror/lang-html')) {
            return 'codemirror-html'
          }
          
          if (id.includes('node_modules/@codemirror/lang-css')) {
            return 'codemirror-css'
          }
          
          // 将codemirror基础包进一步细分
          if (id.includes('node_modules/@codemirror/state')) {
            return 'codemirror-state'
          }
          
          if (id.includes('node_modules/@codemirror/view')) {
            return 'codemirror-view'
          }
          
          if (id.includes('node_modules/@codemirror/language')) {
            return 'codemirror-language'
          }
          
          if (id.includes('node_modules/@codemirror/commands')) {
            return 'codemirror-commands'
          }
          
          // 将其他codemirror包分包
          if (id.includes('node_modules/@codemirror') && 
              !id.includes('node_modules/@codemirror/lang')) {
            return 'codemirror-utils'
          }
          
          // 将其他大型库单独分包
          if (id.includes('node_modules/vue')) {
            return 'vendor'
          }
          
          return null
        }
      }
    }
  }
})
