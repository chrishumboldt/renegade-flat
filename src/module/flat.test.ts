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

  expect(testObj.type()).toBe('object')
  expect(testObj.get('name')).toBe('Darth Vader')
  expect(testObj.get('attributes')).toStrictEqual(rootObjAttributes)
  expect(testObj.get('attributes.alive')).toBe(false)
  expect(testObj.get('cyberware')).toStrictEqual(rootObjCyberware)
  expect(testObj.get('allNames.1')).toBe('Darth Vader')
})

test('Test that we can get a simple array back.', () => {
  const testObj = flat(rootObj)

  expect(testObj.get('allNames')).toStrictEqual({
    '0': 'Anakin Skywalker',
    '1': 'Darth Vader',
  })
})

test('Test that we can get an object array back.', () => {
  const testObj = flat(rootObj)

  expect(testObj.get('identities')).toStrictEqual({
    '0': {
      name: 'Anakin Skywalker',
      identity: 'Jedi',
      good: true,
    },
    '1': {
      name: 'Darth Vader',
      identity: 'Sith',
      good: false,
    },
  })
})

test('Test that we can get back a nested object.', () => {
  const testObj = flat(rootObj)

  expect(testObj.get('attributes')).toStrictEqual({
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

  expect(booleanValue.type()).toBe('boolean')
  expect(booleanValue.get('')).toBe(true)
  expect(booleanValue.get('some.weird.key')).toBe(true)
  expect(stringValue.type()).toBe('string')
  expect(stringValue.get('')).toBe('Obi-Wan Kenobi')
  expect(stringValue.get('some.weird.key')).toBe('Obi-Wan Kenobi')
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

  expect(upsertExecution).toBe(true)
  expect(newFlat.get('name')).toBe('Darth Vader')
  expect(newFlat.get('attributes.lightsaber')).toBe('red')
  expect(newFlat.get('attributes.isSith')).toBe(true)
  expect(newFlat.get('attributes')).toStrictEqual({
    lightsaber: 'red',
    isSith: true,
  })
})
