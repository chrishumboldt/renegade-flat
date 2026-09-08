import assert from 'node:assert/strict'
import { test } from 'node:test'
import { objectHydrate, objectHydrateArray } from './hydrate'

test('Test objectHydrate rebuilds a nested object from dotted keys.', () => {
  const result = objectHydrate({
    name: 'Darth Vader',
    'attributes.alive': false,
    'attributes.blade': 'red',
  })

  assert.deepStrictEqual(result, {
    name: 'Darth Vader',
    attributes: {
      alive: false,
      blade: 'red',
    },
  })
})

test('Test objectHydrateArray turns an indexed object into an array.', () => {
  assert.deepStrictEqual(
    objectHydrateArray({
      '0': 'Anakin Skywalker',
      '1': 'Darth Vader',
    }),
    ['Anakin Skywalker', 'Darth Vader'],
  )
})

test('Test objectHydrate does not turn string maps or gapped indices into arrays.', () => {
  assert.deepStrictEqual(objectHydrate({ 'scores.0': 10, 'scores.5': 20 }), {
    scores: { '0': 10, '5': 20 },
  })
  assert.deepStrictEqual(objectHydrate({ 'x.0': 'a', 'x.2': 'c' }), {
    x: { '0': 'a', '2': 'c' },
  })
})

test('Test objectHydrate ignores prototype polluting keys.', () => {
  objectHydrate({ '__proto__.polluted': 'yes' })
  objectHydrate({ 'constructor.prototype.polluted': 'yes' })

  assert.strictEqual(({} as Record<string, unknown>).polluted, undefined)
})

test('Test objectHydrate rebuilds a mixed object of arrays and objects.', () => {
  const result = objectHydrate({
    name: 'Darth Vader',
    'attributes.list.0.side': 'sith',
    'attributes.list.0.is': 'evil',
    'attributes.lightSabers.0': 'blue',
    'attributes.lightSabers.1': 'red',
  })

  assert.deepStrictEqual(result, {
    name: 'Darth Vader',
    attributes: {
      list: [{ side: 'sith', is: 'evil' }],
      lightSabers: ['blue', 'red'],
    },
  })
})

test('Test objectHydrate returns an empty object for an empty input.', () => {
  assert.deepStrictEqual(objectHydrate({}), {})
})

test('Test objectHydrate turns a fully indexed root into an array.', () => {
  assert.deepStrictEqual(
    objectHydrate({ '0': 'Jedi', '1': 'Sith', '2': 'Grey' }),
    ['Jedi', 'Sith', 'Grey'],
  )
})

test('Test objectHydrate keeps ten or more indices in numeric order.', () => {
  const input: Record<string, number> = {}
  for (let index = 0; index < 12; index++) {
    input[`ranks.${index}`] = index
  }

  assert.deepStrictEqual(objectHydrate(input), {
    ranks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  })
})

test('Test objectHydrate rebuilds arrays nested inside array elements.', () => {
  const result = objectHydrate({
    'squads.0.name': 'Alpha',
    'squads.0.members.0': 'Rex',
    'squads.0.members.1': 'Cody',
    'squads.1.name': 'Bravo',
    'squads.1.members.0': 'Fives',
  })

  assert.deepStrictEqual(result, {
    squads: [
      { name: 'Alpha', members: ['Rex', 'Cody'] },
      { name: 'Bravo', members: ['Fives'] },
    ],
  })
})

test('Test objectHydrate preserves null and empty container leaves.', () => {
  const result = objectHydrate({ 'a.b': null, 'a.c': {}, 'a.d': [], e: null })

  assert.deepStrictEqual(result, {
    a: { b: null, c: {}, d: [] },
    e: null,
  })
})

test('Test objectHydrate does not walk into opaque values.', () => {
  const created = new Date('2020-01-01T00:00:00.000Z')

  assert.deepStrictEqual(objectHydrate({ 'record.created': created }), {
    record: { created },
  })
})

test('Test objectHydrate does not mutate its input.', () => {
  const input = { 'a.b': 1, 'a.c': 2 }
  const snapshot = { ...input }

  objectHydrate(input)

  assert.deepStrictEqual(input, snapshot)
})

test('Test objectHydrateArray walks integer keys in numeric order.', () => {
  // Object key iteration puts integer-like keys in ascending numeric order,
  // regardless of the order they were inserted.
  assert.deepStrictEqual(objectHydrateArray({ '0': 'a', '2': 'c', '1': 'b' }), [
    'a',
    'b',
    'c',
  ])
})
