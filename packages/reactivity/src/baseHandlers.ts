// @ts-noCheck
import { ReactiveFlags } from './reactive'

export const mutableHandler = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    return Reflect.get(target, key, receiver) // 将 target 的 this 指向到 receiver(Proxy) 上，监听属性的所有访问方式
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver)
  },
}
