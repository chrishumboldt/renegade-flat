# Renegade Flat

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Flatten Object](#flatten-object)
- [Get Value](#get-value)
- [Set Value](#set-value)
- [Reconstruct](#reconstruct)

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
**NOTE** that this is an entrely new object and has no referrence the to existing object anymore.

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

## Get Value

You can get values anywhere within the object tree and it will return a "mini-hydrated" form, however it is **IMPORTANT** to note that this will always be in the form of a pure value or object void of arrays.

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
}
```

Name will return `Darth Vader` as expected but `attributes` will return the object as show below.

```javascript
{
    'lightsaber': 'red',
    'mainlyMachine': true
}
```

On the otherhand `allNames` will not return an array but rather a keyed object as show below.

```javascript
{
    '0': 'Anakin Skywalker',
    '1': 'Darth Vader'
}
```

The reason for this is to keep binding to elements easy. In order to reconstruct the object you will need to run the `reconstruct` function.

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

## Reconstruct

Quite simply `reconstruct` will return a new object based on the current values of the flattented object including array types. This is used mainly for things like API requests so that you can return the changed object in its desired shape. This is the most expensive operation in the library.

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

    const newObject = flatObject.reconstruct()
}
```
