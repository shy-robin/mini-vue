import { isObject } from '@mini-vue/shared'
import { mutableHandler } from './baseHandlers'

const reactiveMap = new WeakMap() // WeakMap 中 key 只能为对象类型，且当 key 指向的对象置空时，映射的元素会被清空

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

export interface Target {
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
}

interface CreateReactiveObjectOptions {
  isReadonly: boolean
  /**
   * 常用类型拦截器，如 Object，Array
   */
  baseHandlers: ProxyHandler<any>
  /**
   * 集合类型拦截器，如 Map，WeakMap，Set，WeakSet
   */
  // collectionHandlers: ProxyHandler<any>
  /**
   * 对象和代理对象的映射
   */
  proxyMap: WeakMap<Target, any>
}

const createReactiveObject = (
  target: Target,
  {
    isReadonly,
    baseHandlers,
    // collectionHandlers,
    proxyMap,
  }: CreateReactiveObjectOptions
) => {
  if (!isObject(target)) {
    console.warn(`value cannot be made reactive: ${String(target)}`)
    return target
  }

  /**
   * target is already a Proxy, return it.
   * 实现当传入的 target 为普通对象时，返回生成的代理对象，如果为代理对象时，返回本身。
   * 当 target 为普通对象时，由于没有创建 proxy，所以无法访问 getter，判断结果为 false；
   * 当 target 为代理对象时，可以访问到 proxy 中的 getter，判断结果为 true。
   */
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  // target already has corresponding Proxy
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  const proxy = new Proxy(target, baseHandlers)

  reactiveMap.set(target, proxy)

  return proxy
}

export const isReactive = (value: unknown) => {
  return !!(value && (value as Target)[ReactiveFlags.IS_REACTIVE])
}

export const isReadonly = (value: unknown) => {
  return !!(value && (value as Target)[ReactiveFlags.IS_READONLY])
}

/**
 * Creates a reactive copy of the original object.
 */
export const reactive = (target: object) => {
  if (isReadonly(target)) return target

  return createReactiveObject(target, {
    isReadonly: false,
    baseHandlers: mutableHandler,
    // collectionHandlers: null,
    proxyMap: reactiveMap,
  })
}

export const shallowReactive = () => {}

export const readonly = () => {}

export const shallowReadonly = () => {}
