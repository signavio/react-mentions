const findFirstDiffPos = (a, b) => {
  const shorterLength = Math.min(a.length, b.length)

  for (var i = 0; i < shorterLength; i++) {
    if (a[i] !== b[i]) return i
  }

  if (a.length !== b.length) return shorterLength

  return -1
}

export default findFirstDiffPos
