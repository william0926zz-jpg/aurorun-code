import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  // 小程序构建优化
  build: {
    // 启用压缩（uni-app 会自动处理，这里确保启用）
    minify: true,
    // 代码分割优化
    rollupOptions: {
      output: {
        // 手动分包，减少主包大小
        manualChunks: (id) => {
          // 将 node_modules 中的依赖单独打包
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})
