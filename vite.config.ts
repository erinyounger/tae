import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 复制manifest和静态资源
function copyManifest() {
  return {
    name: 'copy-manifest',
    writeBundle() {
      // 确保目标目录存在
      fs.ensureDirSync('dist');
      
      // 复制manifest
      const manifestContent = fs.readFileSync(
        path.resolve(__dirname, 'src/manifest.json'),
        'utf-8'
      );
      fs.writeFileSync(
        path.resolve(__dirname, 'dist/manifest.json'),
        manifestContent
      );
      
      // 创建icons目录
      const iconsDir = path.resolve(__dirname, 'dist/icons');
      fs.ensureDirSync(iconsDir);
      
      // 创建临时图标文件
      const sizes = [16, 48, 128];
      sizes.forEach(size => {
        const iconPath = path.resolve(iconsDir, `icon${size}.png`);
        if (!fs.existsSync(iconPath)) {
          // 如果图标不存在，创建一个1x1像素的PNG文件
          const buffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
            0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0x60, 0x00, 0x00, 0x00,
            0x02, 0x00, 0x01, 0xE5, 0x27, 0xDE, 0xFC, 0x00,
            0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
            0x42, 0x60, 0x82
          ]);
          fs.writeFileSync(iconPath, buffer);
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), copyManifest()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.deepseek.com/v1',
        changeOrigin: true,
        rewrite: (path) => {
          // 移除 /api 前缀，保持其他路径不变
          return path.replace(/^\/api/, '');
        },
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/background.ts')
      },
      output: {
        entryFileNames: '[name].js'
      }
    },
    // 复制静态资源
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  // 配置静态资源目录
  publicDir: 'public',
}); 