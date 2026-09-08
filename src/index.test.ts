import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as api from './index'
import { flat, objectFlatten, objectHydrate, objectHydrateArray } from './index'

test('Test that the package entry point re-exports the public API.', () => {
  assert.strictEqual(typeof api.flat, 'function')
  assert.strictEqual(typeof api.objectFlatten, 'function')
  assert.strictEqual(typeof api.objectHydrate, 'function')
  assert.strictEqual(typeof api.objectHydrateArray, 'function')
})

test('Test that the re-exported functions are the real implementations.', () => {
  const source = {
    name: 'Darth Vader',
    identities: [{ order: 'Sith' }],
  }
  const flattened = objectFlatten(source)

  assert.deepStrictEqual(flattened, {
    name: 'Darth Vader',
    'identities.0.order': 'Sith',
  })
  assert.deepStrictEqual(objectHydrate(flattened), source)
  assert.deepStrictEqual(objectHydrateArray({ '0': 'a', '1': 'b' }), ['a', 'b'])
  assert.strictEqual(flat(source).get('name'), 'Darth Vader')
})
