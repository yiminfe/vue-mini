import {
  EffectType,
  SetEffect,
  MapSetEffect,
  WeakMapTarget,
  EffectOptions
} from './type'

let activeEffect: EffectType

// 声明 effect
class ReactiveEffect<T = any> implements EffectType {
  private _fn: () => T
  public scheduler?: () => T
  constructor(fn: () => T, scheduler?: () => T) {
    this._fn = fn
    this.scheduler = scheduler
  }

  run() {
    activeEffect = this as EffectType
    return this._fn()
  }
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
    effect.scheduler ? effect.scheduler() : effect.run()
  }
}

// 初始化 effect
export function effect<T = any>(
  fn: () => T,
  options: EffectOptions = {}
): () => T {
  const _effect: EffectType = new ReactiveEffect(fn, options.scheduler)
  _effect.run()
  const runner: () => T = _effect.run.bind(_effect)
  return runner
}
