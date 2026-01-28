const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`
  // value looks like `; name1=value1; name2=value2; name3=value3` etc
  const parts = value.split(`; ${name}=`)
  // Splitting at 2, parts look like
  // ["; name1=value1", "value2; name3=value3"]
  if (parts.length === 2) {
    // parts[1] looks like "value2; name3=value3"
    return parts[1]?.split(";")[0]
  }
  return undefined
}

export { getCookie }
