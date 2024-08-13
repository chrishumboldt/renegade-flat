import { objectHydrate, objectHydrateArray } from './hydrate'

test('Test that we can objectHydrate an object.', () => {
  const testObject = {
    name: 'Darth Vader',
    'attributes.alive': false,
    'attributes.blade': 'red',
  }
  const expectation = {
    name: 'Darth Vader',
    attributes: {
      alive: false,
      blade: 'red',
    },
  }
  const test = objectHydrate(testObject)

  expect(test).toStrictEqual(expectation)
})

test('Test that we can objectHydrate an array.', () => {
  const testArray = {
    '0': 'Anakin Skywalker',
    '1': 'Darth Vader',
  }
  const expectation = ['Anakin Skywalker', 'Darth Vader']
  const test = objectHydrateArray(testArray)

  expect(test).toStrictEqual(expectation)
})

test('Test that we can objectHydrate a mixed object.', () => {
  const testObject = {
    name: 'Darth Vader',
    'attributes.list.0.side': 'sith',
    'attributes.list.0.is': 'evil',
    'attributes.lightSabers.0': 'blue',
    'attributes.lightSabers.1': 'red',
  }
  const expectation = {
    name: 'Darth Vader',
    attributes: {
      list: [{ side: 'sith', is: 'evil' }],
      lightSabers: ['blue', 'red'],
    },
  }
  const test = objectHydrate(testObject)

  expect(test).toStrictEqual(expectation)
})
