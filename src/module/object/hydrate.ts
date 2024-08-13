import { isObject } from '../is'

type HydrateInput = Record<string, any>

export function objectHydrate<T = unknown>(input: HydrateInput): T {
  let newObject = {}

  for (let key in input) {
    const keySplit = key.split('.')
    let ref: Record<string, any> = newObject

    keySplit.forEach((property, index) => {
      if (index === keySplit.length - 1) {
        // Since we are at the end of the path, we can safely apply the
        // actual value.
        ref[property] = input[key]
      } else {
        if (!ref[property]) {
          ref[property] = {}
        }
        ref = ref[property]
      }
    })
  }

  return objectHydrateAllArrays<T>(newObject)
}

export function objectHydrateArray<T = unknown>(input: HydrateInput): T[] {
  const newArray: T[] = []

  for (let key in input) {
    newArray.push(input[key])
  }

  return newArray
}

function objectHydrateAllArrays<T = unknown>(input: HydrateInput): T {
  for (let key in input) {
    if (isObject(input[key])) {
      if (Object.keys(input[key])[0] === '0') {
        input[key] = objectHydrateArray(input[key])
      } else {
        input[key] = objectHydrateAllArrays(input[key])
      }
    }
  }

  return input as T
}
