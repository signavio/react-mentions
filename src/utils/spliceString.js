const spliceString = (str, start, end, insert) =>
  str.substring(0, start) + insert + str.substring(end)

export default spliceString
