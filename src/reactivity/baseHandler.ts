import { track, trigger } from './effect'
import { ReactiveFlags } from './reactive'

// getter
function createGetter<T extends object>(isReadonly = false) {
  return function get(target: T, key: PropertyKey) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }

    const res = Reflect.get(target, key)

    if (!isReadonly) {
      track<T>(target, key)
    }
    return res
  }
}

// setter
function createSetter<T extends object>() {
  return function set(target: T, key: PropertyKey, value: any) {
    const res = Reflect.set(target, key, value)

    trigger<T>(target, key)
    return res
  }
}

// 读写 reactive
export function mutableHandlers<T extends object>(): ProxyHandler<T> {
  return {
    get: createGetter<T>(),
    set: createSetter<T>()
  }
}

// 只读 reactive
export function readonlyHandlers<T extends object>(): ProxyHandler<T> {
  return {
    get: createGetter<T>(true),
    set(target: T, key: PropertyKey) {
      console.warn(
        `key :"${String(key)}" set 失败，因为 target 是 readonly 类型`,
        target
      )
      return true
    }
  }
}
