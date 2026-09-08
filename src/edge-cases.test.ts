import assert from 'node:assert/strict'
import { test } from 'node:test'
import { flat } from './flat'
import { objectFlatten } from './flatten'
import { objectHydrate } from './hydrate'

// These pin the CURRENT behaviour for inputs outside the "plain nested
// data" domain the library targets. They are limitations, not promises,
// and the notable ones are called out in the README.

test('Test that a circular reference throws a RangeError.', () => {
  const cyclic: Record<string, unknown> = { name: 'Vader' }
  cyclic.self = cyclic

  assert.throws(() => objectFlatten(cyclic), RangeError)
  assert.throws(() => flat(cyclic), RangeError)
})

test('Test that an input key containing a dot is restructured on hydrate.', () => {
  // The dot is the path separator, so a literal "a.b" key becomes nested
  // and does not round trip to its original shape.
  assert.deepStrictEqual(objectHydrate({ 'a.b': 1 }), { a: { b: 1 } })
  assert.deepStrictEqual(flat({ 'a.b': 1 }).get(), { a: { b: 1 } })
})

test('Test that a non plain object passed as the root flattens to empty.', () => {
  const unit = flat(new Date('2020-01-01T00:00:00.000Z'))

  assert.strictEqual(unit.type(), 'object')
  assert.deepStrictEqual(unit.result(), {})
  assert.deepStrictEqual(unit.get(), {})
})

test('Test that a root object keyed by 0..n-1 comes back as an array.', () => {
  assert.deepStrictEqual(flat({ '0': 'x', '1': 'y' }).get(), ['x', 'y'])
})

test('Test that symbol keys are dropped by flatten.', () => {
  const hidden = Symbol('hidden')

  assert.deepStrictEqual(objectFlatten({ [hidden]: 1, visible: 2 }), {
    visible: 2,
  })
})

test('Test that undefined values are preserved through a round trip.', () => {
  const unit = flat({ a: undefined, b: 1 })

  assert.deepStrictEqual(unit.result(), { a: undefined, b: 1 })
  assert.strictEqual(unit.get('a'), undefined)
  assert.strictEqual('a' in (unit.get() as object), true)
})

test('Test that an empty string key round trips.', () => {
  assert.deepStrictEqual(flat({ '': 'value' }).get(), { '': 'value' })
})

test('Test that a deeply nested single chain round trips.', () => {
  const deep = { a: { b: { c: { d: { e: { f: 'bottom' } } } } } }

  assert.deepStrictEqual(objectFlatten(deep), { 'a.b.c.d.e.f': 'bottom' })
  assert.deepStrictEqual(flat(deep).get(), deep)
})
