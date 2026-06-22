import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno según el modo
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
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
      // Aumentar límite de advertencia a 1MB
      chunkSizeWarningLimit: 1000,
      
      // Source maps solo en desarrollo
      sourcemap: mode === 'development',
      
      // Target de navegadores
      target: 'es2020',
      
      // Configuración de chunks para code splitting
      rollupOptions: {
        output: {
          // Nombres de archivos para mejor cacheo
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/css/[name]-[hash].[ext]',
          
          // Code splitting manual usando FUNCIÓN (no objeto)
          manualChunks(id: string) {
            // React core y routing
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') ||
                id.includes('node_modules/react-router-dom')) {
              return 'vendor-react';
            }
            
            // Framer Motion (animaciones)
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-animations';
            }
            
            // Lucide React (iconos)
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            
            // Recharts (gráficos)
            if (id.includes('node_modules/recharts') ||
                id.includes('node_modules/d3-') ||
                id.includes('node_modules/victory-vendor')) {
              return 'vendor-charts';
            }
            
            // React Calendar
            if (id.includes('node_modules/react-calendar') ||
                id.includes('node_modules/@wojtekmaj')) {
              return 'vendor-calendar';
            }
            
            // Supabase
            if (id.includes('node_modules/@supabase')) {
              return 'vendor-supabase';
            }
            
            // Axios y utilidades HTTP
            if (id.includes('node_modules/axios')) {
              return 'vendor-utils';
            }
            
            // Si no aplica a ninguna categoría, undefined = chunk por defecto
            return undefined;
          }
        }
      }
    },
    
    // Optimizaciones de dependencias
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
    
    // Definir variables globales
    define: {
      'import.meta.env.VITE_FORCE_PASSKEY': JSON.stringify(env.VITE_FORCE_PASSKEY),
      'import.meta.env.VITE_FORCE_DEBUG': JSON.stringify(env.VITE_FORCE_DEBUG),
    },
    
    // Configuración de preview (para pruebas locales del build)
    preview: {
      port: 4173,
      strictPort: true,
    },
  }
});