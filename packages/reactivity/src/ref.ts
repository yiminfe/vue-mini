import { SetEffect } from './type'

import { hasChanged, isObject } from '@vue-mini/shared'
import { isTracking, trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'

class RefImpl<T> {
  // 私有属性
  private _value: T
  private _rawValue: T

  // 公开属性
  public dep: SetEffect
  public __v_isRef = true

  constructor(value: T) {
    this._rawValue = value
    this._value = convert(value) as T
    this.dep = new Set()
  }

  get value(): T {
    trackRefValue<T>(this)
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
  // TODO 遇到的问题 多类型转换问题
  return isObject(value) ? reactive(value as T) : (value as K)
}

// 追踪 ref value
function trackRefValue<T = any>(ref: RefImpl<T>) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

// ref 响应式
export function ref<T = any>(value: T) {
  return new RefImpl<T>(value)
}

// 是否是 ref 响应式
export function isRef(ref: any) {
  return !!ref.__v_isRef
}

// 获取 ref 的value
export function unRef<T = any>(ref: RefImpl<T> | T): T {
  return isRef(ref) ? (ref as RefImpl<T>).value : (ref as T)
}

// 代理 ref 省略.value 进行读写
export function proxyRefs<T extends object>(objectWithRefs: T) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value)
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}
