import { track, trigger } from './effect'

export function reactive(raw: object): any {
  return new Proxy(raw, {
    get(target: object, key: PropertyKey) {
      const res = Reflect.get(target, key)
      // TODO 依赖收集
      track(target, key)
      return res
    },

    set(target: object, key: PropertyKey, value: any) {
      const res = Reflect.set(target, key, value)
      // TODO 触发依赖
      trigger(target, key)
      return res
    }
  })
}
