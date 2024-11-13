/**
 * Generate a string that represents an enum of the keys of the given object.
 *
 * Example:
 * ```ts
 * const SIZES = {
 *   small: "irrelevant-value",
 *   large: "irrelevant-value",
 * }
 * console.log(docsEnum(SIZES))
 * // '"small" | "large"'
 *
 * ```
 *
 * Use case: Storybook docs are created with react-docgen, which fails to infer
 * typescript enum types.
 *
 *
 */
const docsEnum = <T extends string>(values: T[]) => {
  return values.map((key) => `"${key}"`).join(" | ")
}

const enumValues = <T extends string>(obj: Record<T, unknown>): T[] => {
  return Object.keys(obj) as T[]
}

export { docsEnum, enumValues }
