import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          fontawesome: [
            '@fortawesome/fontawesome-svg-core',
            '@fortawesome/free-solid-svg-icons',
            '@fortawesome/free-regular-svg-icons',
            '@fortawesome/free-brands-svg-icons'
          ],
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom'
          ]
        }
      }
    }
  },
  resolve: {
    alias: {
      'pdfjs-dist/build/pdf.worker.mjs': 'pdfjs-dist/build/pdf.worker.mjs'
    }
  }
});