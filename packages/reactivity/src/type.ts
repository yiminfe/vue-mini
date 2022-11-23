export interface EffectType<T = any> {
  run(): T
  stop(): void
  start(): void
  scheduler?(): void
  deps: SetEffect[]
}

export interface EffectRunner<T = any> {
  (): T
  effect: EffectType
}

export type SetEffect = Set<EffectType>
export type MapSetEffect = Map<PropertyKey, SetEffect>
export type WeakMapTarget = WeakMap<object, MapSetEffect>
export type EffectOptions = {
  scheduler?(): void
  onStop?(): void
}

// Computed Type
export interface ComputedType<T> {
  value: T | undefined
}
