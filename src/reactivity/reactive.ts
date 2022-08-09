import { mutableHandlers, readonlyHandlers } from './baseHandler'

export function reactive<T extends object>(raw: T): T {
  return createReactiveObject<T>(raw, mutableHandlers<T>())
}

export function readonly<T extends object>(raw: T): T {
  return createReactiveObject<T>(raw, readonlyHandlers<T>())
}

function createReactiveObject<T extends object>(
  target: T,
  baseHandles: ProxyHandler<T>
) {
  return new Proxy<T>(target, baseHandles)
}
