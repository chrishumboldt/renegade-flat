# Renegade Flat

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Flatten Object](#flatten-object)
- [Result](#result)
- [Get Value](#get-value)
- [Set Value](#set-value)
- [Upsert](#upsert)
- [Type](#type)

## Introduction

The Renegade flat libray has been created to solve a very specific proplem. Allow the two way binding of data against a nested object for the sake of presentation. As with most reactive libraries the object reference is used to check for change. This will often require the use of hacks in order to get the data to bind to a nested property. 

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
**NOTE** that this is an entrely new object and has no referrence to the existing object anymore.

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

Name will return `Darth Vader` as expected but `attributes` will return the object as show below.

```javascript
{
    'lightsaber': 'red',
    'mainlyMachine': true
}
```

On the otherhand `allNames` will return an array.

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
