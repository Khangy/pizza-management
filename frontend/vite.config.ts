import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Change to 3000 if you prefer the traditional React port
    open: true, // Automatically open browser
  },
  resolve: {
    alias: {
      '@': '/src', // Enable @ imports
    },
  },
})