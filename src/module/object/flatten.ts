import { isArray, isObject } from '../is'

export const objectFlatten = (
  record: Record<string, any>,
  prefix = '',
): Record<string, any> => {
  const result: Record<string, any> = {}
  const truePrefix = prefix?.length > 0 ? prefix + '.' : ''

  for (let key in record) {
    if (isArray(record[key])) {
      record[key].forEach((item: any, index: number) => {
        if (isObject(item)) {
          Object.assign(
            result,
            objectFlatten(item, `${truePrefix}${key}.${index}`),
          )
        } else {
          result[`${truePrefix}${key}.${index}`] = item
        }
      })
    } else if (isObject(record[key])) {
      Object.assign(result, objectFlatten(record[key], `${truePrefix}${key}`))
    } else {
      result[`${truePrefix}${key}`] = record[key]
    }
  }

  return result
}
