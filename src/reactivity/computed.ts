import { ReactiveEffect } from './effect'
import { EffectType, ComputedType } from './type'

class ComputedRefImpl<T> implements ComputedType<T> {
  // 私有属性
  // 缓存计算值
  private _dirty = true
  // TODO 遇到的问题 typescript 设置类型没有初始化，必须设置 | undefined 类型
  private _value: T | undefined
  private _effect: EffectType

  constructor(getter: () => T) {
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }

  get value() {
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }

    return this._value
  }
}

// 响应式计算属性
export function computed<T = any>(getter: () => T): ComputedType<T> {
  return new ComputedRefImpl<T>(getter)
}
