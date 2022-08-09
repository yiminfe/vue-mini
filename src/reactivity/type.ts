export interface EffectType {
  run: () => void
}

export type SetEffect = Set<EffectType>
export type MapSetEffect = Map<PropertyKey, SetEffect>
export type WeakMapTarget = WeakMap<object, MapSetEffect>
