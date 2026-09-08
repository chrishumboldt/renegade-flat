import assert from 'node:assert/strict'
import { test } from 'node:test'
import { flat } from './flat'
import { objectFlatten } from './flatten'
import { objectHydrate } from './hydrate'

// Property based tests. A tiny deterministic PRNG generates plain nested
// structures (objects, arrays, primitives, nulls, empty containers) and we
// assert the library's invariants hold across all of them. Every failure
// message carries the seed so it reproduces exactly.

const SEEDS = 400

function makeRng(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Rng = () => number

const KEY_POOL = [
  'name',
  'alpha',
  'beta',
  'gamma',
  'delta',
  'nested',
  'items',
  'meta',
  'flag',
  'count',
  'label',
  'group',
] as const

const STRING_POOL = ['red', 'blue', 'Vader', 'Jedi', '', 'a b c'] as const

function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)]
}

function distinctKeys(rng: Rng, count: number): string[] {
  const keys = new Set<string>()
  while (keys.size < count) {
    keys.add(pick(rng, KEY_POOL))
  }
  return [...keys]
}

function generate(seed: number): Record<string, unknown> {
  const rng = makeRng(seed)

  function primitive(): unknown {
    const roll = rng()
    if (roll < 0.3) return pick(rng, STRING_POOL)
    if (roll < 0.55) return Math.floor(rng() * 4000) - 2000
    if (roll < 0.72) return rng() < 0.5
    if (roll < 0.85) return null
    return Math.round(rng() * 1000) / 8
  }

  function value(depth: number): unknown {
    const roll = rng()
    if (depth >= 4 || roll < 0.45) return primitive()
    if (roll < 0.75) return object(depth + 1)
    return array(depth + 1)
  }

  function object(depth: number): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const key of distinctKeys(rng, Math.floor(rng() * 5))) {
      result[key] = value(depth)
    }
    return result
  }

  function array(depth: number): unknown[] {
    const result: unknown[] = []
    const size = Math.floor(rng() * 5)
    for (let index = 0; index < size; index++) {
      result.push(value(depth))
    }
    return result
  }

  return object(0)
}

function isLeaf(value: unknown): boolean {
  if (value === null || typeof value !== 'object') return true
  if (Array.isArray(value)) return value.length === 0
  return Object.keys(value).length === 0
}

test('Test that objectHydrate(objectFlatten(x)) deep equals x for generated structures.', () => {
  for (let seed = 1; seed <= SEEDS; seed++) {
    const input = generate(seed)
    const roundTripped = objectHydrate(objectFlatten(input))

    assert.deepStrictEqual(
      roundTripped,
      input,
      `seed ${seed}: ${JSON.stringify(input)}`,
    )
  }
})

test('Test that flat(x).get() deep equals x for generated structures.', () => {
  for (let seed = 1; seed <= SEEDS; seed++) {
    const input = generate(seed)

    assert.deepStrictEqual(
      flat(input).get(),
      input,
      `seed ${seed}: ${JSON.stringify(input)}`,
    )
  }
})

test('Test that objectFlatten only ever produces primitive or empty container leaves.', () => {
  for (let seed = 1; seed <= SEEDS; seed++) {
    const flattened = objectFlatten(generate(seed))

    for (const key of Object.keys(flattened)) {
      assert.ok(
        isLeaf(flattened[key]),
        `seed ${seed} key ${key}: ${JSON.stringify(flattened[key])}`,
      )
    }
  }
})

test('Test that get(key) returns each individual leaf for its flattened key.', () => {
  for (let seed = 1; seed <= SEEDS; seed++) {
    const input = generate(seed)
    const flattened = objectFlatten(input)
    const unit = flat(input)

    for (const key of Object.keys(flattened)) {
      assert.deepStrictEqual(
        unit.get(key),
        flattened[key],
        `seed ${seed} key ${key}`,
      )
    }
  }
})

test('Test that a second flatten of a hydrated structure is identical.', () => {
  for (let seed = 1; seed <= SEEDS; seed++) {
    const once = objectFlatten(generate(seed))
    const twice = objectFlatten(objectHydrate(once))

    assert.deepStrictEqual(twice, once, `seed ${seed}`)
  }
})
