import assert from 'node:assert/strict'
import { test } from 'node:test'
import { flat } from './flat'

const rootObjAttributes = {
  alive: false,
  blade: 'red',
  cyberware: {
    arm: {
      left: true,
      right: true,
    },
  },
}
const rootObjCyberware = {
  breath: 'loud',
}
const rootObj = {
  name: 'Darth Vader',
  allNames: ['Anakin Skywalker', 'Darth Vader'],
  attributes: rootObjAttributes,
  cyberware: rootObjCyberware,
  identities: [
    {
      name: 'Anakin Skywalker',
      identity: 'Jedi',
      good: true,
    },
    {
      name: 'Darth Vader',
      identity: 'Sith',
      good: false,
    },
  ],
}

test('Test that we can get values.', () => {
  const testObj = flat(rootObj)

  assert.strictEqual(testObj.type(), 'object')
  assert.strictEqual(testObj.get('name'), 'Darth Vader')
  assert.deepStrictEqual(testObj.get('attributes'), rootObjAttributes)
  assert.strictEqual(testObj.get('attributes.alive'), false)
  assert.deepStrictEqual(testObj.get('cyberware'), rootObjCyberware)
  assert.strictEqual(testObj.get('allNames.1'), 'Darth Vader')
})

test('Test that we can get a simple array back.', () => {
  const testObj = flat(rootObj)

  assert.deepStrictEqual(testObj.get('allNames'), [
    'Anakin Skywalker',
    'Darth Vader',
  ])
})

test('Test that we can get an object array back.', () => {
  const testObj = flat(rootObj)

  assert.deepStrictEqual(testObj.get('identities'), [
    {
      name: 'Anakin Skywalker',
      identity: 'Jedi',
      good: true,
    },
    {
      name: 'Darth Vader',
      identity: 'Sith',
      good: false,
    },
  ])
})

test('Test that we can get back a nested object.', () => {
  const testObj = flat(rootObj)

  assert.deepStrictEqual(testObj.get('attributes'), {
    alive: false,
    blade: 'red',
    cyberware: {
      arm: {
        left: true,
        right: true,
      },
    },
  })
})

test('Test that a non object will still create and return.', () => {
  const booleanValue = flat(true)
  const stringValue = flat('Obi-Wan Kenobi')

  assert.strictEqual(booleanValue.type(), 'boolean')
  assert.strictEqual(booleanValue.get(''), true)
  assert.strictEqual(booleanValue.get('some.weird.key'), true)
  assert.strictEqual(stringValue.type(), 'string')
  assert.strictEqual(stringValue.get(''), 'Obi-Wan Kenobi')
  assert.strictEqual(stringValue.get('some.weird.key'), 'Obi-Wan Kenobi')
})

test('Test that null values survive a round trip.', () => {
  const testObj = flat({ name: 'Darth Vader', master: null })

  assert.deepStrictEqual(testObj.result(), {
    name: 'Darth Vader',
    master: null,
  })
  assert.strictEqual(testObj.get('master'), null)
})

test('Test that get is not satisfied by a sibling sharing the prefix.', () => {
  const testObj = flat({ name: 'Vader', names: ['Ani', 'Vader'] })

  assert.strictEqual(testObj.get('name'), 'Vader')
})

test('Test that hydration cannot pollute the object prototype.', () => {
  flat({}).set('__proto__.polluted', true)

  assert.strictEqual(({} as Record<string, unknown>).polluted, undefined)
})

test('Test that set and upsert fail gracefully on a non object.', () => {
  const stringValue = flat('Obi-Wan Kenobi')

  assert.strictEqual(stringValue.set('name', 'Ben'), false)
  assert.strictEqual(stringValue.upsert({ name: 'Ben' }), false)
  assert.strictEqual(stringValue.get(), 'Obi-Wan Kenobi')
})

test('Test that empty objects and arrays survive a round trip.', () => {
  const testObj = flat({ name: 'Darth Vader', tags: [], meta: {} })

  assert.deepStrictEqual(testObj.get(), {
    name: 'Darth Vader',
    tags: [],
    meta: {},
  })
})

test('Test that opaque values such as Date are left intact.', () => {
  const created = new Date('2020-01-01T00:00:00.000Z')
  const testObj = flat({ name: 'Darth Vader', created })

  assert.strictEqual(testObj.get('created'), created)
  assert.deepStrictEqual(testObj.get(), { name: 'Darth Vader', created })
})

test('Test that we can upsert a flat object.', () => {
  const newFlat = flat({
    name: 'Darth Vader',
  })
  const upsertExecution = newFlat.upsert({
    attributes: {
      lightsaber: 'red',
      isSith: true,
    },
  })

  assert.strictEqual(upsertExecution, true)
  assert.strictEqual(newFlat.get('name'), 'Darth Vader')
  assert.strictEqual(newFlat.get('attributes.lightsaber'), 'red')
  assert.strictEqual(newFlat.get('attributes.isSith'), true)
  assert.deepStrictEqual(newFlat.get('attributes'), {
    lightsaber: 'red',
    isSith: true,
  })
})

test('Test that result returns the flattened form of the input.', () => {
  const testObj = flat({ name: 'Vader', attributes: { blade: 'red' } })

  assert.deepStrictEqual(testObj.result(), {
    name: 'Vader',
    'attributes.blade': 'red',
  })
})

test('Test that result returns a copy callers cannot use to mutate state.', () => {
  const testObj = flat({ name: 'Vader' })
  const snapshot = testObj.result()

  snapshot.name = 'Anakin'
  snapshot.extra = true

  assert.deepStrictEqual(testObj.result(), { name: 'Vader' })
  assert.strictEqual(testObj.get('name'), 'Vader')
})

test('Test that result is an empty object when the input was not an object.', () => {
  assert.deepStrictEqual(flat('Yoda').result(), {})
  assert.deepStrictEqual(flat(7).result(), {})
})

test('Test that type reports the typeof of the original input.', () => {
  assert.strictEqual(flat({}).type(), 'object')
  assert.strictEqual(flat([]).type(), 'object')
  assert.strictEqual(flat(null).type(), 'object')
  assert.strictEqual(flat('Sith').type(), 'string')
  assert.strictEqual(flat(42).type(), 'number')
  assert.strictEqual(flat(true).type(), 'boolean')
  assert.strictEqual(flat(undefined).type(), 'undefined')
  assert.strictEqual(flat(() => undefined).type(), 'function')
})

test('Test that get returns the whole object when the key is omitted or empty.', () => {
  const testObj = flat(rootObj)

  assert.deepStrictEqual(testObj.get(), rootObj)
  assert.deepStrictEqual(testObj.get(''), rootObj)
})

test('Test that get returns undefined for a key that does not exist.', () => {
  const testObj = flat(rootObj)

  assert.strictEqual(testObj.get('missing'), undefined)
  assert.strictEqual(testObj.get('attributes.missing'), undefined)
  assert.strictEqual(testObj.get('deeply.missing.key'), undefined)
})

test('Test that get returns a hydrated slice from anywhere in the tree.', () => {
  const testObj = flat(rootObj)

  assert.deepStrictEqual(testObj.get('attributes.cyberware.arm'), {
    left: true,
    right: true,
  })
  assert.deepStrictEqual(testObj.get('identities.0'), {
    name: 'Anakin Skywalker',
    identity: 'Jedi',
    good: true,
  })
  assert.strictEqual(testObj.get('identities.1.identity'), 'Sith')
})

test('Test that get reflects values written with set.', () => {
  const testObj = flat({ name: 'Anakin', attributes: { blade: 'blue' } })

  testObj.set('attributes.blade', 'red')
  testObj.set('attributes.isSith', true)

  assert.strictEqual(testObj.get('attributes.blade'), 'red')
  assert.deepStrictEqual(testObj.get('attributes'), {
    blade: 'red',
    isSith: true,
  })
})

test('Test that get returns the original value verbatim for a non object.', () => {
  assert.strictEqual(flat(42).get('any.key'), 42)
  assert.strictEqual(flat(null).get(), null)
  assert.strictEqual(flat(undefined).get('x'), undefined)
})

test('Test that set adds and overwrites keys on a valid flat, returning true.', () => {
  const testObj = flat({ name: 'Anakin' })

  assert.strictEqual(testObj.set('name', 'Vader'), true)
  assert.strictEqual(testObj.set('rank', 'Sith Lord'), true)
  assert.deepStrictEqual(testObj.result(), {
    name: 'Vader',
    rank: 'Sith Lord',
  })
})

test('Test that set rejects an empty or non string key.', () => {
  const testObj = flat({ name: 'Vader' })

  assert.strictEqual(testObj.set('', 'x'), false)
  assert.strictEqual(testObj.set(undefined as unknown as string, 'x'), false)
  assert.strictEqual(testObj.set(3 as unknown as string, 'x'), false)
  assert.deepStrictEqual(testObj.result(), { name: 'Vader' })
})

test('Test that set rejects keys that reach into the prototype chain.', () => {
  const testObj = flat({ name: 'Vader' })

  assert.strictEqual(testObj.set('__proto__', {}), false)
  assert.strictEqual(testObj.set('constructor', {}), false)
  assert.strictEqual(testObj.set('prototype', {}), false)
  assert.strictEqual(testObj.set('a.__proto__.b', 1), false)
  assert.strictEqual(testObj.set('a.constructor.b', 1), false)
  assert.deepStrictEqual(testObj.result(), { name: 'Vader' })
})

test('Test that upsert merges new keys and overwrites existing ones.', () => {
  const testObj = flat({ name: 'Anakin', attributes: { blade: 'blue' } })

  assert.strictEqual(
    testObj.upsert({
      name: 'Vader',
      attributes: { blade: 'red', isSith: true },
    }),
    true,
  )
  assert.deepStrictEqual(testObj.get(), {
    name: 'Vader',
    attributes: { blade: 'red', isSith: true },
  })
})

test('Test that upsert rejects non plain object input.', () => {
  const testObj = flat({ name: 'Vader' })

  assert.strictEqual(
    testObj.upsert(null as unknown as Record<string, unknown>),
    false,
  )
  assert.strictEqual(
    testObj.upsert(['a'] as unknown as Record<string, unknown>),
    false,
  )
  assert.strictEqual(
    testObj.upsert(new Date() as unknown as Record<string, unknown>),
    false,
  )
  assert.strictEqual(
    testObj.upsert('nope' as unknown as Record<string, unknown>),
    false,
  )
  assert.deepStrictEqual(testObj.result(), { name: 'Vader' })
})

test('Test that flat(x).get() deep equals a complex nested source.', () => {
  const source = {
    name: 'Darth Vader',
    age: 45,
    alive: false,
    master: null,
    titles: ['Sith Lord', 'Chosen One'],
    grid: [
      [1, 2],
      [3, 4],
    ],
    apprentices: [
      { name: 'Ahsoka', turned: false, missions: ['Mandalore'] },
      { name: 'Starkiller', turned: true, missions: [] },
    ],
    meta: {},
    tags: [],
    attributes: {
      cyberware: { arm: { left: true, right: true } },
      scores: { '0': 10, '3': 30 },
    },
  }

  assert.deepStrictEqual(flat(source).get(), source)
})
