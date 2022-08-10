import { isObject } from './../shared/index'
import { track, trigger } from './effect'
import { reactive, ReactiveFlags, readonly } from './reactive'

// getter
function createGetter<T extends object>(isReadonly: boolean, shallow: boolean) {
  return function get(target: T, key: PropertyKey) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }

    const res = Reflect.get(target, key)

    // 浅层 reactive
    if (shallow) {
      return res
    }

    // 对象 reactive 嵌套
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    // 只读 reactive
    if (!isReadonly) {
      track<T>(target, key)
    }
    return res
  }
}

// setter
function createSetter<T extends object>(isReadonly: boolean) {
  return function set(target: T, key: PropertyKey, value: any) {
    if (isReadonly) {
      console.warn(
        `key :"${String(key)}" set 失败，因为 target 是 readonly 类型`,
        target
      )
      return true
    }

    const res = Reflect.set(target, key, value)

    trigger<T>(target, key)
    return res
  }
}

// 默认 reactive 非export
function baseHandlers<T extends object>(
  isReadonly = false,
  shallow = false
): ProxyHandler<T> {
  return {
    get: createGetter<T>(isReadonly, shallow),
    set: createSetter<T>(isReadonly)
  }
}

// 读写 reactive
export function mutableHandlers<T extends object>(): ProxyHandler<T> {
  return baseHandlers<T>()
}

// 只读 reactive
export function readonlyHandlers<T extends object>(): ProxyHandler<T> {
  return baseHandlers<T>(true)
}

// 浅层 reactive
export function shallowReadonlyHandlers<T extends object>(): ProxyHandler<T> {
  return baseHandlers<T>(true, true)
}
