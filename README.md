# Vue3 源码学习

---

## Vue3 设计思想

- **拆分模块**

  Vue3.0 更注重模块上的拆分，在 2.0 中无法单独使用部分模块，需要引入完整的 Vuejs（例如只想使用响应式部分，但是需要引入完整的 Vuejs），Vue3 中的模块之间耦合度低，模块可以单独使用。

- **重写 API**

  Vue2 中很多方法挂载到了实例中，导致这些方法即使没有被使用也会被打包（还有很多组件也是一样）。通过构建工具 Tree Shaking 机制实现按需导入，减少用户打包后的体积。

- **扩展更方便**

  Vue3 允许自定义渲染器，扩展能力强，不会像 Vue2 一样改写 Vue 源码而导致改造渲染方式。

*但 Vue3 依然保留 Vue2 特色。*



### 声明式框架

> Vue3 依旧是声明式的框架，用起来简单。

**命令式与声明式的区别**

- 早期 JQuery 编写的代码都是命令式的，命令式框架的重要特点就是关注过程；
- 声明式框架更加关注结构，命令式的代码封装到了 Vuejs 中，过程靠 Vuejs 来实现。

> 声明式的代码更加简单，不需要关注实现，按照要求填写代码即可（提供原材料即可实现结果）

```js
// 命令式编程
const numbers = [1, 2, 3, 4, 5]
let total = 0
for (let i = 0; i < numbers.length; i++) {
	total += numbers[i] // 关注过程
}
console.log(total)

// 声明式编程
const total2 = numbers.reduce((memo, current) => {
  return memo + current
})
console.log(total2)
```

### 采用虚拟 DOM

传统更新页面，拼凑成一个完整的字符串 innerHTML 全部更新渲染，添加虚拟 DOM 后，可以比较新旧虚拟节点，找到变化后再进行更新。虚拟 DOM 就是一个 Javascript 对象，用来描述真实 DOM。

```javascript
const vnode = {
  __v_isVNode: true,
  __v_skip: true,
  type,
  props,
  key: props && normalizeKey(props),
  ref: props && normalizeRef(props),
  children,
  component: null,
  el: null,
  patchFlag,
  dynamicProps,
  dynamicChildren: null,
  appContext: null
}
```

### 区分编译时和运行时

- 我们需要有一个虚拟 DOM，调用渲染方法将虚拟 DOM 渲染成真实 DOM（缺点就是虚拟 DOM 编写麻烦）；
- 专门写个编译时可以将模板编译成虚拟 DOM（在构建的时候进行编译性能更高，不需要在运行的时候编译）。



## Vue3 整体架构

### Vue3 架构介绍

#### Monorepo 管理项目

Monorepo 是管理项目代码的一个方式，指在一个项目仓库（repo）中管理多个模块/包（package）。Vue3 源码采用 monorepo 方式进行管理，将模块拆分到 package 目录中。

- 一个仓库可维护多个模块，不用到处找仓库；
- 方便版本管理和依赖管理，模块之间的引用和调用都非常方便。

#### Vue3 项目结构

- compiler-core：与平台无关的编译器核心；
- compiler-dom：针对浏览器的编译模块；
- compiler-sfc：针对单文件解析；
- compiler-ssr：针对服务端渲染的编译模块；
- reactivity：响应式系统；
- template-explorer：用于调试编译器输出的开发工具；
- vue-compat：迁移构建，用于兼容 Vue2；
- runtime-core：与平台无关的运行时核心；
- runtime-dom：针对浏览器的运行时，包括 DOM API，属性，事件处理等；
- runtime-test：用于测试的运行时；
- server-renderer：用于服务端渲染；
- shared：多个包之间共享的内容；
- vue：完整版本，包括运行时和编译时；
- ref-transform：实验性语法，ref 转化器；
- size-check：用来测试代码体积；

#### Vue3 采用 Typescript

Vue2 采用 Flow 进行类型检测（Vue2 中对 Typescript 的支持并不友好），Vue3 源码采用 Typescript 来进行重写，对 Typescript 的支持更加友好。

### Vue3 开发环境搭建

#### 搭建 Monorepo 环境

Vue3 使用 `pnpm` 和 `workspace` 来实现 `monorepo` （pnpm 是快速、节省磁盘空间的包管理器，主要采用符号链接的方式管理模块）。

**1. 全局安装 pnpm**

```sh
npm install pnpm -g # 全局安装 pnpm

pnpm init -y # 初始化配置文件
```

**2. 创建 packages 目录**

在根目录下创建 `/packages` 目录，后续编写的所有包都会放在此目录下。比如，可以在此目录下创建 `reactivity` 、 `shared` 等模块。

**3. 配置 pnpm-workspace.yaml 文件**

```yaml
packages:
  - 'packages/*'
```

注意，此时如果直接使用 `pnpm install` 去安装包，会引发报错，因为 pnpm 不知道你要将包安装到根目录下还是 workspace 中。为了消除报错，可以使用 `pnpm install <package> -w / pnpm install <package> --workspace-root ` 指示 pnpm 将包安装到根目录下。

**4. 配置 .npmrc 文件**

使用传统的 npm 安装包时，会产生 **幽灵依赖** 的问题。

比如，我们在项目中安装了 Vue，Vue 里面假如依赖了包 A，我们的项目也会安装包 A。假如我们的项目也要用到包 A，那我们不用额外安装它了，直接引用即可。这就形成了 **幽灵依赖**。假设之后 Vue 进行了更新迭代，将包 A 替换成了包 B，那么我们的项目在安装 Vue 的时候就不会自动安装包 A，之前依赖包 A 的代码就会产生报错。

而 pnpm 就可以避免这个问题。pnpm 默认将安装的包放在 node_modules 目录下，而该包所依赖的其他包放在了 `node_modules/.pnpm` 下，这样项目就只能引用安装的包，而无法引用包依赖的其他包。

如果要取消 pnpm 这一默认安装方式，可以在根目录下创建 `.npmrc` 配置文件：

```
shamefully-hoist = true # 将包的依赖提升到 node_modules 下
```

**5. 安装其他包**

```shell
pnpm install typescript minimist esbuild -D -w # minimist 用于读取命令行中用户的输入参数，esbuild 用于打包（速度快）
```



