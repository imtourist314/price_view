import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',

      // Backend API (FastAPI on :8000)
      '/database': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/tables': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/data': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/accounts': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/openapi.json': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
})
