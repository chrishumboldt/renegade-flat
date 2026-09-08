# Renegade Flat

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Flatten Object](#flatten-object)
- [Result](#result)
- [Get Value](#get-value)
- [Set Value](#set-value)
- [Upsert](#upsert)
- [Type](#type)
- [Behaviour Notes](#behaviour-notes)

## Introduction

The Renegade flat library has been created to solve a very specific problem. Allow the two way binding of data against a nested object for the sake of presentation. As with most reactive libraries the object reference is used to check for change. This will often require the use of hacks in order to get the data to bind to a nested property. 

So instead of referencing something deeply nested, it is now possible to reference the key directly. See examples of the returned objects to get the gist.

## Getting Started

To install the library simply use the NPM install command.

```bash
npm install @renegaderocks/flat
```

## Flatten Object

To flatten an object you simply use the flat function.

```javascript
import { flat } from '@renegaderocks/flat'

function example() {
    const flatObject = flat({
        name: 'Darth Vader',
        attributes: {
            lightsaber: 'red',
            mainlyMachine: true
        }
    })
}
```

This will result in the following object being generated:

```javascript
{
    'name': 'Darth Vader',
    'attributes.lightsaber': 'red',
    'attributes.mainlyMachine': true
}
```
**NOTE** that this is an entirely new object and has no reference to the existing object anymore.

It is possible to flatten values that are arrays. For example:

```javascript
import { flat } from '@renegaderocks/flat'

function example() {
    const flatObject = flat({
        name: 'Darth Vader',
        affiliations: ['Jedi', 'Sith']
    })
}
```
This will result in the following object being generated:

```javascript
{
    'name': 'Darth Vader',
    'affiliations.0': 'Jedi',
    'affiliations.1': 'Sith'
}
```

## Result

The result function will return the current flattened object.

```javascript
import { flat } from '@renegaderocks/flat'

function example() {
    const flatObject = flat({
        name: 'Darth Vader',
        affiliations: ['Jedi', 'Sith']
    })

    console.log(flatObject.result())
}
```

## Get Value

You can get values anywhere within the object tree and it will return a "mini-hydrated" form.

```javascript
import { flat } from '@renegaderocks/flat'

function example() {
    const flatObject = flat({
        name: 'Darth Vader',
        attributes: {
            lightsaber: 'red',
            mainlyMachine: true
        },
        allNames: ['Anakin Skywalker', 'Darth Vader']
    })

    const name = flatObject.get('name')
    const attributes = flatObject.get('attributes')
    const lightsaberColour = flatObject.get('attributes.lightsaber')
    const allNames = flatObject.get('allNames')
    const entireObject = flatObject.get()
}
```

Name will return `Darth Vader` as expected but `attributes` will return the object as shown below.

```javascript
{
    'lightsaber': 'red',
    'mainlyMachine': true
}
```

On the other hand `allNames` will return an array.

```javascript
['Anakin Skywalker', 'Darth Vader']
```

If you wish to retrieve the entire object you can simply omit a key for the `get` function argument or provide an empty `string`.

## Set Value

It is possible to set an object based on the flat key. It is possible to break the object by setting a property that does not fit into the structure. It is up to you to manage this properly.

```javascript
import { flat } from '@renegaderocks/flat'

function example() {
    const flatObject = flat({
        name: 'Darth Vader',
        attributes: {
            lightsaber: 'red',
            mainlyMachine: true
        },
        allNames: ['Anakin Skywalker', 'Darth Vader']
    })

    flatObject.set('name', 'Anakin Skywalker')
    flatObject.set('attributes.lightsaber', 'blue')
    flatObject.set('allNames.0', 'Ani')
}
```

## Upsert

In the event that you don't want to set individual keys, you can pass in an object to upsert against the flat. This is a faster way of adding to the flat without having to set each individual key.

```javascript
import { flat } from '@renegaderocks/flat'

function example() {
    const flatObject = flat({
        name: 'Darth Vader',
        allNames: ['Anakin Skywalker', 'Darth Vader']
    })
    flatObject.upsert({
        attributes: {
            lightsaber: 'red',
            mainlyMachine: true
        },
    })
}
```

## Type

The type function will just return a simple typeof result of the original input.

```javascript
import { flat } from '@renegaderocks/flat'

function example() {
    const flatObject = flat({
        name: 'Darth Vader',
        attributes: {
            lightsaber: 'red',
            mainlyMachine: true
        },
        allNames: ['Anakin Skywalker', 'Darth Vader']
    })

    console.log(flatObject.type())
}
```

## Behaviour Notes

A few things worth knowing about how values round trip:

- **`null` values are kept.** `flat({ a: null })` flattens to `{ 'a': null }` and hydrates back to `{ a: null }`.
- **Empty objects and arrays are kept.** `flat({ a: {}, b: [] })` round trips to `{ a: {}, b: [] }`.
- **Arrays are rebuilt only from contiguous indices.** An object whose keys are exactly `0..n-1` becomes an array on `get`. A string map that merely contains a `"0"` key, or a set of indices with gaps, is returned as an object so nothing is dropped or reordered.
- **Non plain objects are opaque.** Instances of `Date`, `Map`, `RegExp`, class instances and the like are treated as leaf values. They are stored by reference and are not flattened into their internals.
- **Prototype keys are ignored.** Path segments of `__proto__`, `constructor` or `prototype` are rejected by `set` and skipped during hydration, so a flattened key can never mutate the prototype chain.
- **`set` and `upsert` require an object.** When `flat` was given a non object (a string, number, boolean or `null`), `set` and `upsert` return `false` instead of throwing, and `get` returns the original value.

### Limitations

The library targets plain nested data. Outside that it has sharp edges:

- **The dot is the path separator.** An input key that already contains a `.` (for example `{ 'a.b': 1 }`) is split on `get`, so it comes back as `{ a: { b: 1 } }` rather than its original shape.
- **Circular references throw.** `flat` recurses eagerly, so a value that references itself overflows the stack. Break cycles before flattening.
- **Symbol keys are dropped.** Only string keys are walked.
- **A non plain object as the root is not useful.** `flat(new Date())` does not throw, but flattens to `{}`. Pass a plain object.
