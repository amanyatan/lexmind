import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '../assets/logo.png',
        replacement: 'C:/Users/AMAN YATAN/.gemini/antigravity/brain/118fd0c5-c657-4309-b437-04f76d7d21ed/media__1774739657314.png'
      }
    ]
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
