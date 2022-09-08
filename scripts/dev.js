const args = require('minimist')(process.argv.slice(2))
const { resolve } = require('path')
const { build } = require('esbuild')

const target = args['_'][0] || 'reactivity' // 打包目录名
const format = args['f'] || 'global' // 打包格式

const targetPath = resolve(__dirname, `../packages/${target}`) // 打包目录路径

// 引入 target 目录下的 package.json
const pkg = require(`${targetPath}/package.json`)
/**
 * 设置打包产物的模块格式。
 * 1. iife
 *    - 立即执行函数。如 (function() {})()；
 *    - 通常会生成一个全局变量，浏览器可以访问该全局变量；
 * 2. cjs
 *    - CommonJS，Nodejs 中的模块规范，module.exports 导出，require 导入；
 * 3. esm
 *    - ES Module 规范，export 导出，import 导入；
 *    - 适用于浏览器，<script src="xxx" type="module">。
 */
const outputFormat =
  format === 'global' ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'

// 打包产物的文件名
const outputFile = `${targetPath}/dist/${target}.${format}.js`

build({
  entryPoints: [`${targetPath}/src/index.ts`],
  outfile: outputFile,
  bundle: true, // 把所有包打包到一起
  sourcemap: true,
  format: outputFormat,
  globalName: pkg.buildOptions.name,
  platform: format === 'cjs' ? 'node' : 'browser',
  watch: {
    // 监控文件变化
    onRebuild(error) {
      if (!error) {
        console.log('正在重新打包。。。')
      }
    },
  },
}).then(() => {
  console.log('正在监测代码变化。。。')
})
