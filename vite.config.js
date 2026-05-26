import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: '学习小助手',
        short_name: '学习助手',
        description: 'AI赋能教育，覆盖小学至高中全学段。薄弱项分析、智能批改、试卷切题，陪伴孩子学业成长。',
        theme_color: '#4F46E5',
        background_color: '#F9FAFB',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        lang: 'zh-CN',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.deepseek\.com\/.*/i,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /^https:\/\/aip\.baidubce\.com\/.*/i,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /\.(?:js|css|woff2?|png|svg|jpg|jpeg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      // 代理百度OCR Token获取
      '/api/baidu-token': {
        target: 'https://aip.baidubce.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/baidu-token/, '/oauth/2.0/token')
      },
      // 代理百度OCR（统一入口，根据mode参数路由）
      '/api/baidu-ocr': {
        target: 'https://aip.baidubce.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const url = new URL(req.url, 'http://localhost')
            const mode = url.searchParams.get('mode')
            // 移除mode参数，不让它传给百度
            url.searchParams.delete('mode')
            // 根据mode选择百度OCR端点
            if (mode === 'accurate') {
              proxyReq.path = '/rest/2.0/ocr/v1/accurate_basic?' + url.searchParams.toString()
            } else {
              proxyReq.path = '/rest/2.0/ocr/v1/handwriting?' + url.searchParams.toString()
            }
          })
        }
      }
    }
  }
})
