import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:7777",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "")
        },
        "/auth": { // 👈 добавляем прокси для авторизации
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/auth/, "/auth")
        }
      }
    },    
    build: {
      outDir: 'dist',
    },
    define: {
      'process.env': env, 
    }
  };
});
