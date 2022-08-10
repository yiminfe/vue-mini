import { isObject } from '../shared/index'
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers
} from './baseHandler'

// 判断 只读 和 reactive对象
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

// 创建 读写 reactive 对象
export function reactive<T extends object>(raw: T): T {
  return createReactiveObject<T>(raw, mutableHandlers<T>())
}

// 创建 只读 reactive 对象
export function readonly<T extends object>(raw: T): T {
  return createReactiveObject<T>(raw, readonlyHandlers<T>())
}

// 创建 浅层 reactive 对象
export function shallowReadonly<T extends object>(raw: T): T {
  return createReactiveObject<T>(raw, shallowReadonlyHandlers<T>())
}

// 是否是 reactive 对象
export function isReactive<T extends object>(value: T): boolean {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

// 是否是 只读 reactive 对象
export function isReadonly<T extends object>(value: T): boolean {
  return !!value[ReactiveFlags.IS_READONLY]
}

// 是否是 proxy
export function isProxy<T extends object>(value: T): boolean {
  return isReactive(value)
}

// 创建 reactive 代理对象
function createReactiveObject<T extends object>(
  target: T,
  baseHandles: ProxyHandler<T>
) {
  if (!isObject(target)) {
    console.warn(`target ${target} 必须是一个对象`)
    return target
  }
  return new Proxy<T>(target, baseHandles)
}
