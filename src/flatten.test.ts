import assert from 'node:assert/strict'
import { test } from 'node:test'
import { objectFlatten } from './flatten'

test('Test objectFlatten leaves a flat object of primitives untouched.', () => {
  const input = { name: 'Darth Vader', age: 45, sith: true, master: null }

  assert.deepStrictEqual(objectFlatten(input), input)
})

test('Test objectFlatten turns nested objects into dotted keys.', () => {
  const result = objectFlatten({
    name: 'Darth Vader',
    attributes: {
      lightsaber: 'red',
      cyberware: { arm: 'left' },
    },
  })

  assert.deepStrictEqual(result, {
    name: 'Darth Vader',
    'attributes.lightsaber': 'red',
    'attributes.cyberware.arm': 'left',
  })
})

test('Test objectFlatten indexes arrays of primitives.', () => {
  assert.deepStrictEqual(objectFlatten({ affiliations: ['Jedi', 'Sith'] }), {
    'affiliations.0': 'Jedi',
    'affiliations.1': 'Sith',
  })
})

test('Test objectFlatten indexes arrays of objects.', () => {
  const result = objectFlatten({
    identities: [
      { name: 'Anakin', good: true },
      { name: 'Vader', good: false },
    ],
  })

  assert.deepStrictEqual(result, {
    'identities.0.name': 'Anakin',
    'identities.0.good': true,
    'identities.1.name': 'Vader',
    'identities.1.good': false,
  })
})

test('Test objectFlatten indexes arrays nested inside arrays.', () => {
  const result = objectFlatten({
    grid: [
      [1, 2],
      [3, 4],
    ],
  })

  assert.deepStrictEqual(result, {
    'grid.0.0': 1,
    'grid.0.1': 2,
    'grid.1.0': 3,
    'grid.1.1': 4,
  })
})

test('Test objectFlatten keeps null values instead of dropping the key.', () => {
  assert.deepStrictEqual(objectFlatten({ a: null, b: { c: null } }), {
    a: null,
    'b.c': null,
  })
})

test('Test objectFlatten keeps empty objects and arrays as leaf markers.', () => {
  assert.deepStrictEqual(
    objectFlatten({ tags: [], meta: {}, nested: { empty: {} } }),
    {
      tags: [],
      meta: {},
      'nested.empty': {},
    },
  )
})

test('Test objectFlatten treats Date and RegExp as opaque leaves.', () => {
  const created = new Date('2020-01-01T00:00:00.000Z')
  const pattern = /sith/g
  const result = objectFlatten({ created, pattern })

  assert.deepStrictEqual(result, { created, pattern })
  assert.strictEqual(result.created, created)
  assert.strictEqual(result.pattern, pattern)
})

test('Test objectFlatten applies the prefix argument to every produced key.', () => {
  assert.deepStrictEqual(objectFlatten({ a: 1, b: { c: 2 } }, 'root'), {
    'root.a': 1,
    'root.b.c': 2,
  })
})

test('Test objectFlatten returns a new object, not a reference to the input.', () => {
  const input = { attributes: { blade: 'red' } }
  const result = objectFlatten(input)

  result['attributes.blade'] = 'blue'

  assert.strictEqual(input.attributes.blade, 'red')
})

test('Test objectFlatten produces an empty object for an input with no own keys.', () => {
  assert.deepStrictEqual(objectFlatten({}), {})
})
