import { camelize, toHandlerKey } from '@vue-mini/shared'

export function emit(instance, event, ...args) {
  const { props } = instance
  // TDD 开发模式
  const handlerName = toHandlerKey(camelize(event))
  const handler = props[handlerName]
  handler && handler(...args)
}
