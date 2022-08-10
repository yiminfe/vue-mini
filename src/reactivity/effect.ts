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
let shouldTrack = false

// 声明 effect
class ReactiveEffect<T = any> implements EffectType {
  // 私有属性
  private _fn: () => T
  private active = true
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
    // 未激活状态 不追踪 activeEffect
    if (!this.active) {
      return this._fn()
    }

    // 追踪 activeEffect
    shouldTrack = true
    activeEffect = this as EffectType
    const res = this._fn()

    // 重置
    shouldTrack = false
    return res
  }

  // 暂停 effect
  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }

  // 启动 effect
  start() {
    if (!this.active) {
      this.active = true
    }
  }
}

// 清除 effect
function cleanupEffect(effect: EffectType) {
  for (const dep of effect.deps) {
    dep.delete(effect)
  }

  // 清空 deps
  effect.deps.length = 0
}

const targetMap: WeakMapTarget = new WeakMap()

// 追踪 effect
export function track<T extends object>(target: T, key: PropertyKey) {
  if (!isTracking()) return

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

  trackEffects(dep)
}

// 追踪 effect set容器 公共逻辑
export function trackEffects(dep: SetEffect) {
  // 判断是否已经追踪过 activeEffect
  if (dep.has(activeEffect)) return

  // add activeEffect
  dep.add(activeEffect)

  // add dep
  activeEffect.deps.push(dep)
}

// 是否可以追踪 activeEffect
export function isTracking(): boolean {
  return shouldTrack && !!activeEffect
}

// 触发 effect
export function trigger<T extends object>(target: T, key: PropertyKey) {
  const depsMap: MapSetEffect = targetMap.get(target) as MapSetEffect
  const dep: SetEffect = depsMap.get(key) as SetEffect
  triggerEffects(dep)
}

// 触发 effect set容器 公共逻辑
export function triggerEffects(dep: SetEffect) {
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

// 启动 effect
export function start(runner: EffectRunner) {
  runner.effect.start()
}
