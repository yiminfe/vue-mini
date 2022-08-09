export interface EffectType<T = any> {
  run(): T
  stop(): T
  scheduler?(): T
  deps: SetEffect[]
}

export interface EffectRunner<T = any> {
  (): T
  effect: EffectType
}

export type SetEffect = Set<EffectType>
export type MapSetEffect = Map<PropertyKey, SetEffect>
export type WeakMapTarget = WeakMap<object, MapSetEffect>
export type EffectOptions<T = any> = {
  scheduler?(): T
  onStop?(): T
}
