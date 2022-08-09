export interface EffectType<T = any> {
  run(): T
  scheduler?(): T
}

export type SetEffect = Set<EffectType>
export type MapSetEffect = Map<PropertyKey, SetEffect>
export type WeakMapTarget = WeakMap<object, MapSetEffect>
export type EffectOptions<T = any> = {
  scheduler?(): T
}
