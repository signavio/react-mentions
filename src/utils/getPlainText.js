import iterateMentionsMarkup from './iterateMentionsMarkup'

const getPlainText = (value, config) => {
  let result = ''
  iterateMentionsMarkup(
    value,
    config,
    plainText => {
      result += plainText
    },
    (match, index, plainTextIndex, id, display) => {
      result += display
    }
  )
  return result
}

export default getPlainText
