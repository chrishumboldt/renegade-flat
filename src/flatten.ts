import { isArray, isPlainObject } from './is'

export const objectFlatten = (
  record: Record<string, any>,
  prefix = '',
): Record<string, any> => {
  const result: Record<string, any> = {}

  const assign = (path: string, value: any): void => {
    if (isArray(value)) {
      if (value.length === 0) {
        // Preserve empty arrays so they survive a round trip.
        result[path] = []
        return
      }

      value.forEach((item, index) => assign(`${path}.${index}`, item))
      return
    }

    if (isPlainObject(value)) {
      const nested = objectFlatten(value, path)

      if (Object.keys(nested).length === 0) {
        // Preserve empty objects so they survive a round trip.
        result[path] = {}
      } else {
        Object.assign(result, nested)
      }

      return
    }

    // Primitives, and opaque values such as Date/Map/RegExp, are kept as is.
    result[path] = value
  }

  const truePrefix = prefix.length > 0 ? prefix + '.' : ''

  for (let key in record) {
    assign(`${truePrefix}${key}`, record[key])
  }

  return result
}
