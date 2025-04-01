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
      external: [
        '@fortawesome/fontawesome-svg-core',
        '@fortawesome/free-solid-svg-icons',
        '@fortawesome/free-regular-svg-icons',
        '@fortawesome/free-brands-svg-icons'
      ],
      output: {
        globals: {
          '@fortawesome/fontawesome-svg-core': 'FontAwesomeCore',
          '@fortawesome/free-solid-svg-icons': 'FontAwesomeSolid',
          '@fortawesome/free-regular-svg-icons': 'FontAwesomeRegular',
          '@fortawesome/free-brands-svg-icons': 'FontAwesomeBrands'
        },
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom'
          ],
          lottie: ['lottie-web', 'lottie-react']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      parse: {
        // Workaround for lottie-web eval usage
        bare_returns: false
      },
      compress: {
        // Disable eval warnings in console but allow them to work
        passes: 2,
        drop_console: false,
        ecma: 2020
      }
    },
    // Allow eval usage in lottie-web
    sourcemap: false
  },
  resolve: {
    alias: {
      'pdfjs-dist/build/pdf.worker.mjs': 'pdfjs-dist/build/pdf.worker.mjs'
    }
  }
});