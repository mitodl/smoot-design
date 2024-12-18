/**
 * A type helper just to make sure an array contains union values.
 */
const enumValues = <T extends string | undefined>(
  obj: Record<NonNullable<T>, unknown>,
): NonNullable<T>[] => {
  return Object.keys(obj) as NonNullable<T>[]
}

const gitLink = (filepath: string) => {
  if (!filepath.startsWith("src/")) {
    throw new Error(`Invalid filepath: ${filepath}\nShould start with "src/"`)
  }
  return `https://github.com/mitodl/smoot-design/blob/${process.env.STORYBOOK_GIT_SHA}/${filepath}`
}

export { enumValues, gitLink }
