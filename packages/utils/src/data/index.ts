/**
 * Creates a bidirectional map supporting fast lookup in both directions (K -> V and V -> K).
 * Also supports efficient sorted queries and binary search on keys and values.
 *
 * @template K - Key type
 * @template V - Value type
 *
 * @returns {Object} BiMap interface with set, get, getKey, delete, searchKey, searchValue, and rangeByKey methods.
 */
export function createBiMap<K, V>() {
  const fwd = new Map<K, V>()
  const rev = new Map<V, K>()
  let sortedKeys: K[] = []
  let sortedValues: V[] = []
  let dirty = false

  /**
   * Performs a binary search for the given target in a sorted array.
   *
   * @template T
   * @param {T[]} arr - Sorted array to search in.
   * @param {T} target - Target value to find.
   * @param {(a: T, b: T) => number} compareFn - Comparison function (like Array.prototype.sort).
   * @returns {number} Index if found, else -1.
   */
  function binarySearch<T>(arr: T[], target: T, compareFn: (a: T, b: T) => number): number {
    let lo = 0
    let hi = arr.length - 1
    while (lo <= hi) {
      // Integer midpoint without overflow; arr[mid] is in bounds while lo <= hi
      const mid = (lo + hi) >>> 1
      const midVal: T = arr[mid] as T
      const cmp = compareFn(midVal, target)
      if (cmp === 0) return mid
      if (cmp < 0) {
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return -1
  }

  /**
   * Lazily rebuilds sorted key/value arrays if needed.
   * dirty is set on set/delete so we only sort when the map has changed.
   */
  function ensureSorted() {
    if (!dirty) return
    sortedKeys = [...fwd.keys()].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0))
    sortedValues = [...rev.keys()].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0))
    dirty = false
  }

  return {
    /**
     * Sets the mapping for both key->value and value->key.
     * Overwrites any existing entry for key or value.
     *
     * @param {K} key - The key to set.
     * @param {V} value - The value to associate with the key.
     */
    set(key: K, value: V): void {
      fwd.set(key, value)
      rev.set(value, key)
      dirty = true
    },

    /**
     * Looks up the value for the given key.
     * @param {K} key
     * @returns {V | undefined} The value, or undefined if not present.
     */
    get(key: K): V | undefined {
      return fwd.get(key) // O(1) exact match
    },

    /**
     * Looks up the key for the given value.
     * @param {V} value
     * @returns {K | undefined} The key, or undefined if not present.
     */
    getKey(value: V): K | undefined {
      return rev.get(value) // O(1) exact match
    },

    /**
     * Deletes the given key and its reverse mapping, if present.
     * @param {K} key - The key to delete.
     */
    delete(key: K): void {
      const value = fwd.get(key)
      if (value !== undefined) {
        rev.delete(value)
        fwd.delete(key)
        dirty = true
      }
    },

    /**
     * Searches for an exact key in the sorted key array using binary search.
     *
     * @param {K} target - The key to locate.
     * @param {(a: K, b: K) => number} compareFn - Comparison function (like Array.prototype.sort).
     * @returns {V | undefined} The associated value, or undefined if not found.
     */
    searchKey(target: K, compareFn: (a: K, b: K) => number): V | undefined {
      ensureSorted()
      const idx = binarySearch(sortedKeys, target, compareFn)
      if (idx === -1) return undefined
      const key = sortedKeys[idx]
      return key !== undefined ? fwd.get(key) : undefined
    },

    /**
     * Searches for an exact value in the sorted value array using binary search.
     *
     * @param {V} target - The value to locate.
     * @param {(a: V, b: V) => number} compareFn - Comparison function (like Array.prototype.sort).
     * @returns {K | undefined} The associated key, or undefined if not found.
     */
    searchValue(target: V, compareFn: (a: V, b: V) => number): K | undefined {
      ensureSorted()
      const idx = binarySearch(sortedValues, target, compareFn)
      if (idx === -1) return undefined
      const value = sortedValues[idx]
      return value !== undefined ? rev.get(value) : undefined
    },

    /**
     * Returns all [key, value] pairs with keys in the range [min, max] (inclusive), in sorted order.
     *
     * @param {K} min - Minimum key value (inclusive).
     * @param {K} max - Maximum key value (inclusive).
     * @param {(a: K, b: K) => number} compareFn - Comparison function for keys.
     * @returns {[K, V][]} Array of [key, value] pairs within the range.
     */
    rangeByKey(min: K, max: K, compareFn: (a: K, b: K) => number): [K, V][] {
      ensureSorted()
      const result: [K, V][] = []
      for (const key of sortedKeys) {
        if (compareFn(key, min) >= 0 && compareFn(key, max) <= 0) {
          const value = fwd.get(key)
          if (value !== undefined) {
            result.push([key, value])
          }
        }
      }
      return result
    },
  }
}
