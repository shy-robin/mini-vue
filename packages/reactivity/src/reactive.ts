// @ts-noCheck
import { mutableHandler } from './baseHandlers'

const reactiveMap = new WeakMap() // WeakMap 中 key 只能为对象类型，且当 key 指向的对象置空时，映射的元素会被清空

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}

export function reactive(target) {
  if (Object.prototype.toString.call(target) !== '[object Object]') return

  /**
   * 实现当传入的 target 为普通对象时，返回生成的代理对象，如果为代理对象时，返回本身。
   * 当 target 为普通对象时，由于没有创建 proxy，所以无法访问 getter，判断结果为 false；
   * 当 target 为代理对象时，可以访问到 proxy 中的 getter，判断结果为 true。
   */
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  if (reactiveMap.has(target)) {
    return reactiveMap.get(target)
  }

  const proxy = new Proxy(target, mutableHandler)

  reactiveMap.set(target, proxy)

  return proxy
}
