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
    // Simplify for Netlify compatibility
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Create a vendor chunk for React
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
          // Create a chunk for lottie-related code
          if (id.includes('node_modules/lottie')) {
            return 'lottie';
          }
        }
      }
    },
    // Increase warning limit to avoid non-zero exit codes for large chunks
    chunkSizeWarningLimit: 2000,
    // Less aggressive minification
    minify: 'esbuild'
  },
  resolve: {
    alias: {
      'pdfjs-dist/build/pdf.worker.mjs': 'pdfjs-dist/build/pdf.worker.mjs'
    }
  }
});