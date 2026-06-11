/**
 * Coerces a nullable or undefined value to a string or null,
 * returning null for any falsy input.
 *
 * @param value - The value to coerce.
 * @returns The original string or null.
 */
export function coerceNullableString(value: string | null | undefined): string | null {
  return value ?? null;
}

/**
 * Gets an existing entry from a map or creates and inserts a default value
 * using the provided factory function if the key is not present.
 *
 * @param map - The map to look up or insert into.
 * @param key - The key to look up.
 * @param create - Factory function called to produce the default value.
 * @returns The existing or newly created value.
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
