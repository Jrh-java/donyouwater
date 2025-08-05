import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium'; 
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), cesium()],
  
  server: {
    port: 3333,
    host: "0.0.0.0",
    proxy: {
      '/api': {
        target: 'http://map.geoq.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/remoteserver': {
        target: 'http://124.221.163.157:8083',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/remoteserver/, ''),
      },
      '/localhost8080': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/localhost8080/, ''),
      },
      '/authApi': {
        // target: 'http://192.168.31.149:9050 ',
        target: 'http://220.250.41.136:9050',
        
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/authApi/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), 
    }
  }
})
