import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for core React libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // Motion library chunk
          motion: ['motion'],
          
          // Admin-specific heavy libraries
          admin: ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-text-align', '@tiptap/extension-underline'],
          
          // PDF and utilities chunk (lazy loaded)
          utils: ['jspdf', 'dompurify'],
          
          // UI and icons
          ui: ['lucide-react', 'axios'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'es2015',
    minify: 'terser',
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'motion'],
    exclude: ['jspdf', 'dompurify'], // Exclude from pre-bundling for lazy loading
  },
  server: {
    hmr: {
      overlay: false
    }
  }
})






