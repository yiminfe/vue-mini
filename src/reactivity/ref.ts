import { SetEffect } from './type'

import { hasChanged, isObject } from '../shared'
import { isTracking, trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'

class RefImpl<T> {
  // 私有属性
  private _value: T
  private _rawValue: T

  // 公开属性
  public dep: SetEffect
  constructor(value: T) {
    this._rawValue = value
    this._value = convert(value) as T
    this.dep = new Set()
  }

  get value(): T {
    trackRefValue(this)
    return this._value
  }

  set value(newValue: T) {
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue
      this._value = convert(newValue) as T
      triggerEffects(this.dep)
    }
  }
}

// 转换成 reactive || value
function convert<T extends object, K = any>(value: T | K) {
  return isObject(value) ? reactive(value as T) : (value as K)
}

// 追踪 ref value
function trackRefValue<T extends object, K = any>(ref: RefImpl<T | K>) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

// ref 响应式
export function ref<T extends object, K = any>(value: T | K) {
  return new RefImpl<T | K>(value)
}
