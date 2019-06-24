const omit = (obj, ...rest) => {
  const keys = [].concat(...rest)
  return Object.keys(obj).reduce((acc, k) => {
    if (obj.hasOwnProperty(k) && !keys.includes(k) && obj[k] !== undefined) {
      acc[k] = obj[k]
    }
    return acc
  }, {})
}


export default omit