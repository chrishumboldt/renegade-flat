import { isArray, isString } from './is'
import { objectFlatten } from './object/flatten'
import { objectHydrate } from './object/hydrate'

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
  get: <T>(key?: string) => T
  result: () => Record<string, any>
  set: <T>(key: string, value: T) => void
  type: () => FlatUnitType
}

export function flat(input: any): FlatUnit {
  const inputType = typeof input
  const isValid = inputType === 'object' && !isArray(input)
  let flatObject: Record<string, any>

  function get<T = unknown>(key = ''): T {
    if (!isValid) {
      return input
    }

    if (key === '') {
      return objectHydrate(flatObject) as T
    }

    const keys = Object.keys(flatObject).filter(item => item.startsWith(key))
    if (keys.length > 1) {
      const newObject = keys.reduce(
        (crt: Record<string, any>, accKey: string) => {
          const cleanKey = accKey.replace(`${key}.`, '')
          crt[cleanKey] = flatObject[accKey]
          return crt
        },
        {},
      )

      return objectHydrate(newObject) as T
    }

    return flatObject[key]
  }

  function set(key: string, value: any) {
    if (!isString(key) || key.length < 1) {
      return
    }

    flatObject[key] = value
  }

  function type(): FlatUnitType {
    return inputType
  }

  if (isValid) {
    flatObject = objectFlatten(input)
  }

  return {
    get,
    result: () => flatObject,
    set,
    type,
  }
}
