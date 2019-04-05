import iterateMentionsMarkup from './iterateMentionsMarkup'

const getPlainText = (value, config) => {
  let result = ''
  iterateMentionsMarkup(
    value,
    config,
    (match, index, plainTextIndex, id, display) => {
      result += display
    },
    plainText => {
      result += plainText
    }
  )
  return result
}

export default getPlainText
