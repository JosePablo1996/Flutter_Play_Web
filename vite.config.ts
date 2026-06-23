import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno según el modo
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    
    // ✅ Configuración base para producción (SPA)
    base: '/',
    
    server: {
      port: 5173,
      proxy: {
        '/api/v1': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('Proxying:', req.method, req.url, '→', proxyReq.path);
            });
          }
        }
      }
    },
    
    build: {
      chunkSizeWarningLimit: 1000,
      sourcemap: mode === 'development',
      target: 'es2020',
      copyPublicDir: true,
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/css/[name]-[hash].[ext]',
          manualChunks: (id: string) => {
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') ||
                id.includes('node_modules/react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-animations';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('node_modules/recharts') ||
                id.includes('node_modules/d3-') ||
                id.includes('node_modules/victory-vendor')) {
              return 'vendor-charts';
            }
            if (id.includes('node_modules/react-calendar') ||
                id.includes('node_modules/@wojtekmaj')) {
              return 'vendor-calendar';
            }
            if (id.includes('node_modules/@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('node_modules/axios')) {
              return 'vendor-utils';
            }
            return undefined;
          }
        }
      }
    },
    
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'lucide-react',
        'recharts',
        'react-calendar',
        '@supabase/supabase-js',
        'axios'
      ],
      exclude: [],
    },
    
    define: {
      'import.meta.env.VITE_FORCE_PASSKEY': JSON.stringify(env.VITE_FORCE_PASSKEY),
      'import.meta.env.VITE_FORCE_DEBUG': JSON.stringify(env.VITE_FORCE_DEBUG),
    },
    
    preview: {
      port: 4173,
      strictPort: true,
    },
  }
});