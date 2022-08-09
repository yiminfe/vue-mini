import { EffectType, SetEffect, MapSetEffect, WeakMapTarget } from './type'

let activeEffect: EffectType

// 声明 effect
class ReactiveEffect implements EffectType {
  private _fn: () => void

  constructor(fn: () => void) {
    this._fn = fn
  }

  run() {
    activeEffect = this as EffectType
    this._fn()
  }
}

// 初始化 effect
export function effect(fn: () => void) {
  const _effect: EffectType = new ReactiveEffect(fn)
  _effect.run()
}

const targetMap: WeakMapTarget = new WeakMap()

// 追踪 effect
export function track(target: object, key: PropertyKey) {
  // target -> key -> dep
  let depsMap: MapSetEffect = targetMap.get(target) as MapSetEffect
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  // 获取 set<fn>
  let dep: SetEffect = depsMap.get(key) as SetEffect
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  // add activeEffect
  dep.add(activeEffect)
}

// 触发 effect
export function trigger(target: object, key: PropertyKey) {
  const depsMap: MapSetEffect = targetMap.get(target) as MapSetEffect
  const dep: SetEffect = depsMap.get(key) as SetEffect
  for (const effect of dep) {
    effect.run()
  }
}
