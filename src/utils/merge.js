import mergeDeep from './mergeDeep'

const merge = (target, ...sources) => {
  return sources.reduce((t, s) => {
    return mergeDeep(t, s)
  }, target)
}

export default merge
