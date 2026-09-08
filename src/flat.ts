import { isArray, isPlainObject, isString, isUnsafeKey } from './is'
import { objectFlatten } from './flatten'
import { objectHydrate } from './hydrate'

type FlatUnitType =
  | 'bigint'
  | 'boolean'
  | 'function'
  | 'number'
  | 'object'
  | 'string'
  | 'symbol'
  | 'undefined'

export type FlatUnit = {
  get: <T = unknown>(key?: string) => T
  result: () => Record<string, any>
  set: <T>(key: string, value: T) => boolean
  type: () => FlatUnitType
  upsert: (input: Record<string, any>) => boolean
}

export function flat(input: unknown): FlatUnit {
  const inputType = typeof input
  const isValid = input !== null && inputType === 'object' && !isArray(input)
  let flatObject: Record<string, any> = {}

  function get<T = unknown>(key = ''): T {
    if (!isValid) {
      return input as T
    }

    if (key === '') {
      return objectHydrate(flatObject) as T
    }

    if (Object.prototype.hasOwnProperty.call(flatObject, key)) {
      return flatObject[key]
    }

    // Only treat keys as children of `key` when they sit below it in the path,
    // so `get('name')` is not satisfied by a sibling like `names.0`.
    const prefix = `${key}.`
    const keys = Object.keys(flatObject).filter(item => item.startsWith(prefix))

    if (keys.length === 0) {
      return undefined as T
    }

    const newObject = keys.reduce(
      (crt: Record<string, any>, accKey: string) => {
        crt[accKey.slice(prefix.length)] = flatObject[accKey]
        return crt
      },
      {},
    )

    return objectHydrate(newObject) as T
  }

  function set(key: string, value: any): boolean {
    if (!isValid) return false
    if (!isString(key) || key.length < 1) return false
    if (key.split('.').some(isUnsafeKey)) return false

    flatObject[key] = value
    return true
  }

  function type(): FlatUnitType {
    return inputType
  }

  function upsert(input: Record<string, any>): boolean {
    if (!isValid) return false
    if (!isPlainObject(input)) return false

    Object.assign(flatObject, objectFlatten(input))
    return true
  }

  if (isValid) {
    flatObject = objectFlatten(input as Record<string, any>)
  }

  return {
    get,
    result: () => ({ ...flatObject }),
    set,
    type,
    upsert,
  }
}
