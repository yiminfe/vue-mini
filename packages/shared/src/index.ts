export * from './toDisplayString'

export const extend = Object.assign

// export const isObject = (value) => {
//   return value !== null && typeof value === 'object'
// }

export const isObject = (value: unknown): value is object => {
  return value !== null && typeof value === 'object'
}

// export const isString = value => typeof value === 'string'

export const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}

export const EMPTY_OBJ = {}

export const hasChanged = (val, newValue) => {
  return !Object.is(val, newValue)
}

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key)

export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c.toUpperCase()
  })
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const toHandlerKey = (str: string) => {
  return str ? 'on' + capitalize(str) : ''
}

export { ShapeFlags } from './ShapeFlags'
