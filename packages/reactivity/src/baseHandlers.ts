import { reactive, ReactiveFlags, Target } from './reactive'
import { isArray, isObject } from '@mini-vue/shared'

const createGetter = (isReadonly = false, shallow = false) => {
  return (target: Target, key: PropertyKey, receiver: object) => {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    const targetIsArray = isArray(target)

    // 将 target 的 this 指向到 receiver(Proxy) 上，监听属性的所有访问方式
    const rst = Reflect.get(target, key, receiver)

    if (isObject(rst)) {
      // 如果 get 的结果为对象，则将其转换为代理对象【test: nested reactives】
      return reactive(rst)
    }

    return rst
  }
}

const get = createGetter()

const createSetter = (shallow = false) => {
  return (
    target: Target,
    key: PropertyKey,
    value: unknown,
    receiver: object
  ) => {
    const rst = Reflect.set(target, key, value, receiver)

    return rst
  }
}

const set = createSetter()

export const mutableHandler = {
  get,
  set,
}
