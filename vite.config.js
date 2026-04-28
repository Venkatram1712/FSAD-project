import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://venkatram1712.github.io/FSAD-backend-p",
        changeOrigin: true,
        secure: true
      }
    }
  }
})
