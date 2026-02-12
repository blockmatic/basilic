# Data utils (`@repo/utils/data`)

Bidirectional map with O(1) exact lookups and optional sorted key/value queries (binary search, range by key). No peer dependencies.

## Usage

```ts
import { createBiMap } from '@repo/utils/data'

const map = createBiMap<number, string>()
map.set(3, 'charlie')
map.set(1, 'alice')
map.set(2, 'bob')

const numCmp = (a: number, b: number) => a - b
const strCmp = (a: string, b: string) => (a > b ? 1 : a < b ? -1 : 0)

map.searchKey(2, numCmp)         // 'bob' — O(log n)
map.searchValue('alice', strCmp)  // 1 — O(log n)
map.rangeByKey(1, 2, numCmp)     // [[1,'alice'], [2,'bob']]
```

## When to use which

- **get / getKey** — Prefer for exact lookups; O(1).
- **searchKey / searchValue** — Use when the comparator is more complex than equality (e.g. custom object comparison).
- **rangeByKey** — Use for range queries without scanning the whole map.

Sorting runs only when the map has changed (dirty flag), so repeated queries stay cheap.

## Performance (JS at scale)

| Approach        | Lookup    | Setup       | Best for                    |
|----------------|-----------|-------------|-----------------------------|
| Map            | O(1)      | O(n)        | Exact match on any key      |
| Binary search  | O(log n)  | O(n log n)  | Sorted numeric/string data  |
| Trie           | O(k)      | O(n·k)      | Prefix/autocomplete         |
| Bloom filter   | O(k)      | O(n)        | Existence (probabilistic)   |
| Flat Typed Array | O(log n) | O(n)        | Numeric keys, max perf      |

## Practical recommendations

- **Exact lookups** — `Map` is usually best; V8 is highly optimized.
- **Range queries** — Sort once and use binary search, or a B-tree (e.g. `sorted-btree`).
- **Full-text/fuzzy** — Use Fuse.js for small sets or FlexSearch for large indexes.
- **Very large data** — Use a Web Worker or IndexedDB with indexes.
