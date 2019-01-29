const escapeRegex = str => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

export default escapeRegex
