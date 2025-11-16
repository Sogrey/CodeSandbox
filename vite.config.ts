import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 暂时禁用vue-devtools插件以避免解析错误
    vueDevTools(),
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
          // 简化分包策略，避免循环依赖问题

          // 将codemirror基础包合并为一个包，确保依赖关系正确
          if (id.includes('node_modules/@codemirror/state') ||
            id.includes('node_modules/@codemirror/view') ||
            id.includes('node_modules/@codemirror/language') ||
            id.includes('node_modules/@codemirror/commands')) {
            return 'codemirror-base'
          }

          // 将codemirror语言包合并为一个包
          if (id.includes('node_modules/@codemirror/lang-javascript') ||
            id.includes('node_modules/@codemirror/lang-html') ||
            id.includes('node_modules/@codemirror/lang-css')) {
            return 'codemirror-langs'
          }

          // 将codemirror核心包单独分包
          if (id.includes('node_modules/codemirror')) {
            return 'codemirror-core'
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
