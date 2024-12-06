/**
 * A type helper just to make sure an array contains union values.
 */
const enumValues = <T extends string | undefined>(
  obj: Record<NonNullable<T>, unknown>,
): T[] => {
  return Object.keys(obj) as T[]
}

export { enumValues }
