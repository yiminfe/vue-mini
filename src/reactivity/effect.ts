import { extend } from '../shared'
import {
  EffectType,
  SetEffect,
  MapSetEffect,
  WeakMapTarget,
  EffectOptions,
  EffectRunner
} from './type'

let activeEffect: EffectType

// 声明 effect
class ReactiveEffect<T = any> implements EffectType {
  // 私有属性
  private _fn: () => T
  private active = false
  onStop?: () => T

  // 公开属性
  public scheduler?: () => T
  public deps: SetEffect[] = []

  constructor(fn: () => T, scheduler?: () => T) {
    this._fn = fn
    this.scheduler = scheduler
  }

  // 执行 effect
  run() {
    // stop 之后 重新激活
    this.active = true
    activeEffect = this as EffectType
    return this._fn()
  }

  // 暂停 effect
  stop() {
    if (!this.active) return

    cleanupEffect(this)
    if (this.onStop) {
      this.onStop()
    }
    this.active = false
  }
}

// 清除 effect
function cleanupEffect(effect: EffectType) {
  for (const dep of effect.deps) {
    dep.delete(effect)
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

  if (!activeEffect) return

  // add activeEffect
  dep.add(activeEffect)

  // add dep
  activeEffect.deps.push(dep)
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
): EffectRunner {
  const _effect: EffectType = new ReactiveEffect(fn, options.scheduler)
  // 跪在options上的属性给effect
  extend(_effect, options)

  _effect.run()
  const runner = _effect.run.bind(_effect) as EffectRunner
  runner.effect = _effect
  return runner
}

// 暂停 effect
export function stop(runner: EffectRunner) {
  runner.effect.stop()
}
