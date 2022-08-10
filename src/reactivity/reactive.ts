import { mutableHandlers, readonlyHandlers } from './baseHandler'

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

// 是否是 reactive 对象
export function isReactive<T extends object>(value: T): boolean {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

// 是否是 只读 reactive 对象
export function isReadonly<T extends object>(value: T): boolean {
  return !!value[ReactiveFlags.IS_READONLY]
}

// 创建 reactive 代理对象
function createReactiveObject<T extends object>(
  target: T,
  baseHandles: ProxyHandler<T>
) {
  return new Proxy<T>(target, baseHandles)
}