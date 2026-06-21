/**
 * Coerces a nullable string to a string or null.
 * @param {string | null | undefined} value - The value to coerce
 * @returns {string | null} The string value, or null if undefined/null
 */
export function coerceNullableString(value: string | null | undefined): string | null {
  return value ?? null;
}

/**
 * Gets an existing map entry or creates one with the provided factory.
 * @param {Map<K, V>} map - The map to query
 * @param {K} key - The key to look up
 * @param {() => V} create - Factory function to create a new entry if missing
 * @returns {V} The existing or newly created entry
 */
export function getOrCreateMapEntry<K, V>(map: Map<K, V>, key: K, create: () => V): V {
  const existing = map.get(key);
  if (existing !== undefined) {
    return existing;
  }

  const created = create();
  map.set(key, created);
  return created;
}
