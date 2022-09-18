// @ts-noCheck
export let activeEffect

export class ReactiveEffect {
  active = true
  constructor(public fn) {}

  run() {
    if (!this.active) {
      return this.fn()
    }

    try {
      activeEffect = this
      return this.fn()
    } finally {
      activeEffect = undefined
    }
  }
}

export function effect(fn) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

effect(() => {
  state.name = 1
})
