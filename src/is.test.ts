import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isArray, isObject, isPlainObject, isString, isUnsafeKey } from './is'

class Sith {
  power = 9000
}

test('Test isArray recognises arrays and rejects everything else.', () => {
  assert.strictEqual(isArray([]), true)
  assert.strictEqual(isArray([1, 2, 3]), true)
  assert.strictEqual(isArray(new Array(3)), true)
  assert.strictEqual(isArray({}), false)
  assert.strictEqual(isArray('Jedi'), false)
  assert.strictEqual(isArray(null), false)
  assert.strictEqual(isArray(undefined), false)
  assert.strictEqual(isArray({ length: 0 }), false)
  assert.strictEqual(isArray(new Sith()), false)
})

test('Test isObject accepts any non null object but rejects primitives.', () => {
  assert.strictEqual(isObject({}), true)
  assert.strictEqual(isObject([]), true)
  assert.strictEqual(isObject(new Date()), true)
  assert.strictEqual(isObject(new Sith()), true)
  assert.strictEqual(isObject(/regex/), true)
  assert.strictEqual(isObject(null), false)
  assert.strictEqual(isObject(undefined), false)
  assert.strictEqual(isObject('Sith'), false)
  assert.strictEqual(isObject(42), false)
  assert.strictEqual(isObject(true), false)
  assert.strictEqual(
    isObject(() => undefined),
    false,
  )
})

test('Test isPlainObject accepts literals but rejects arrays, built ins and class instances.', () => {
  assert.strictEqual(isPlainObject({}), true)
  assert.strictEqual(isPlainObject({ a: 1 }), true)
  assert.strictEqual(isPlainObject(Object.create(null)), true)
  assert.strictEqual(isPlainObject(new Object()), true)
  assert.strictEqual(isPlainObject([]), false)
  assert.strictEqual(isPlainObject(new Date()), false)
  assert.strictEqual(isPlainObject(new Map()), false)
  assert.strictEqual(isPlainObject(/regex/), false)
  assert.strictEqual(isPlainObject(new Sith()), false)
  assert.strictEqual(isPlainObject(null), false)
  assert.strictEqual(isPlainObject('Sith'), false)
})

test('Test isString recognises strings including the empty string.', () => {
  assert.strictEqual(isString(''), true)
  assert.strictEqual(isString('Obi-Wan'), true)
  assert.strictEqual(isString(String('cast')), true)
  assert.strictEqual(isString(0), false)
  assert.strictEqual(isString(null), false)
  assert.strictEqual(isString(undefined), false)
  assert.strictEqual(isString(['a']), false)
  assert.strictEqual(isString({ toString: () => 'x' }), false)
})

test('Test isUnsafeKey flags prototype chain keys and allows ordinary keys.', () => {
  assert.strictEqual(isUnsafeKey('__proto__'), true)
  assert.strictEqual(isUnsafeKey('constructor'), true)
  assert.strictEqual(isUnsafeKey('prototype'), true)
  assert.strictEqual(isUnsafeKey('name'), false)
  assert.strictEqual(isUnsafeKey('proto'), false)
  assert.strictEqual(isUnsafeKey('__proto__ '), false)
  assert.strictEqual(isUnsafeKey(''), false)
})
