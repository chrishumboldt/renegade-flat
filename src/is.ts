export const isArray = (check: unknown): check is unknown[] => {
  return Array.isArray(check)
}

export const isObject = (check: unknown): check is Record<string, unknown> => {
  return typeof check === 'object' && check !== null
}

/**
 * A "plain" object is one produced by an object literal or `new Object()`.
 * Class instances and built ins (`Date`, `Map`, `RegExp`, ...) are excluded so
 * that flatten/hydrate treat them as opaque leaf values instead of walking
 * their internals.
 */
export const isPlainObject = (
  check: unknown,
): check is Record<string, unknown> => {
  if (!isObject(check) || isArray(check)) {
    return false
  }

  const proto = Object.getPrototypeOf(check)
  return proto === null || proto === Object.prototype
}

export const isString = (check: unknown): check is string => {
  return typeof check === 'string'
}

/**
 * Keys that, if written into a nested path, would let a caller reach and
 * mutate the prototype chain. They are rejected wherever untrusted keys are
 * expanded back into an object structure.
 */
export const isUnsafeKey = (key: string): boolean => {
  return key === '__proto__' || key === 'constructor' || key === 'prototype'
}
