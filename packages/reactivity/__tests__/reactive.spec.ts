import { describe, test, expect, vi } from 'vitest'
import { reactive, isReactive } from '../src/reactive'

describe('reactivity/reactive', () => {
  test('Object', () => {
    const original = { foo: 1 }
    const observed = reactive(original)

    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)
    expect(observed).not.toBe(original)
    // get
    expect(observed.foo).toBe(1)
    // has
    expect('foo' in observed).toBe(true)
    // ownKeys
    expect(Object.keys(observed)).toEqual(['foo'])
  })

  test('proto', () => {
    const obj = {}
    const reactiveObj = reactive(obj)
    expect(isReactive(reactiveObj)).toBe(true)

    const prototype = reactiveObj['__proto__']
    expect(prototype).not.toBe(undefined)
    const otherObj = { data: ['ttt'] }
    expect(isReactive(otherObj)).toBe(false)
    const reactiveOther = reactive(otherObj)
    expect(isReactive(reactiveOther)).toBe(true)
    expect(reactiveOther.data[0]).toBe('ttt')
  })

  test('nested reactives', () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    }
    const observed = reactive(original)
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })

  test('observing subtypes of IterableCollections(Map, Set)', () => {
    // subtypes of Map
    class CustomMap extends Map {}
    const cmap = reactive(new CustomMap())

    expect(cmap instanceof Map).toBe(true)
    expect(isReactive(cmap)).toBe(true)

    cmap.set('key', {})
    expect(isReactive(cmap.get('key'))).toBe(true)
  })

  test('non-observable values', () => {
    // 监听 console.warn() 的调用
    vi.spyOn(global.console, 'warn')

    const assertValue = (val: any) => {
      reactive(val)
      expect(console.warn).toBeCalledWith(
        `value cannot be made reactive: ${String(val)}`
      )
    }

    assertValue(1)
    assertValue('foo')
    assertValue(false)
    assertValue(null)
    assertValue(undefined)
    assertValue(Symbol())
    assertValue(BigInt(11))
    assertValue(function () {})

    // const p = Promise.resolve()
    // expect(reactive(p)).toBe(p)
    // const r = new RegExp('')
    // expect(reactive(r)).toBe(r)
    // const d = new Date()
    // expect(reactive(d)).toBe(d)
  })
})
