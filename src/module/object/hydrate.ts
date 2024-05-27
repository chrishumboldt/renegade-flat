import { isObject } from '@module/is'

export function objectHydrate(input: Record<string, any>): Record<string, any> {
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

  return newObject
}

export function objectHydrateAllArrays(input: Record<string, any>): any {
  for (let key in input) {
    if (isObject(input[key])) {
      input[key] =
        Object.keys(input[key]).shift() === '0'
          ? hydrateArray(input[key])
          : objectHydrateAllArrays(input[key])
    }
  }

  return input
}

function hydrateArray(input: Record<string, any>): any[] {
  const newArray: any[] = []

  for (let key in input) {
    newArray[parseInt(key)] = isObject(input[key])
      ? objectHydrateAllArrays(input[key])
      : input[key]
  }

  return newArray
}
