import { resolve } from 'path'

export default {
  resolve: {
    // 配置路径别名，否则 vitest 识别不出
    alias: {
      '@mini-vue/shared': resolve(__dirname, 'packages/shared/src'),
    },
  },
}
