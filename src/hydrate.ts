import { isPlainObject, isUnsafeKey } from './is'

type HydrateInput = Record<string, any>

export function objectHydrate<T = unknown>(input: HydrateInput): T {
  let newObject: Record<string, any> = {}

  for (let key in input) {
    const keySplit = key.split('.')

    // Never let a flattened key walk into the prototype chain
    // (e.g. "__proto__.polluted", "constructor.prototype.x").
    if (keySplit.some(isUnsafeKey)) {
      continue
    }

    let ref: Record<string, any> = newObject

    keySplit.forEach((property, index) => {
      if (index === keySplit.length - 1) {
        // Since we are at the end of the path, we can safely apply the
        // actual value.
        ref[property] = input[key]
      } else {
        if (!isPlainObject(ref[property])) {
          ref[property] = {}
        }
        ref = ref[property]
      }
    })
  }

  return collapseArrays<T>(newObject)
}

export function objectHydrateArray<T = unknown>(input: HydrateInput): T[] {
  const newArray: T[] = []

  for (let key in input) {
    newArray.push(input[key])
  }

  return newArray
}

/**
 * An object is only reconstructed into an array when its keys are exactly the
 * contiguous indices 0..n-1. Anything else (a string map that happens to
 * contain "0", a gapped/sparse set of indices) is left as an object so no
 * values are dropped or reordered.
 */
function isArrayShaped(input: Record<string, any>): boolean {
  const keys = Object.keys(input)

  if (keys.length === 0) {
    return false
  }

  return keys.every((key, index) => key === String(index))
}

/**
 * Walk the hydrated structure depth first, turning every array shaped object
 * (including the root) into a real array.
 */
function collapseArrays<T = unknown>(input: HydrateInput): T {
  for (let key in input) {
    if (isPlainObject(input[key])) {
      input[key] = collapseArrays(input[key])
    }
  }

  return (isArrayShaped(input) ? Object.values(input) : input) as T
}
