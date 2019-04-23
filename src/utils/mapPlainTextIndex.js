import iterateMentionsMarkup from './iterateMentionsMarkup'

// For the passed character index in the plain text string, returns the corresponding index
// in the marked up value string.
// If the passed character index lies inside a mention, the value of `inMarkupCorrection` defines the
// correction to apply:
//   - 'START' to return the index of the mention markup's first char (default)
//   - 'END' to return the index after its last char
//   - 'NULL' to return null
const mapPlainTextIndex = (
  value,
  config,
  indexInPlainText,
  inMarkupCorrection = 'START'
) => {
  if (typeof indexInPlainText !== 'number') {
    return indexInPlainText
  }

  let result
  let textIteratee = (substr, index, substrPlainTextIndex) => {
    if (result !== undefined) return

    if (substrPlainTextIndex + substr.length >= indexInPlainText) {
      // found the corresponding position in the current plain text range
      result = index + indexInPlainText - substrPlainTextIndex
    }
  }
  let markupIteratee = (
    markup,
    index,
    mentionPlainTextIndex,
    id,
    display,
    childIndex,
    lastMentionEndIndex
  ) => {
    if (result !== undefined) return

    if (mentionPlainTextIndex + display.length > indexInPlainText) {
      // found the corresponding position inside current match,
      // return the index of the first or after the last char of the matching markup
      // depending on whether the `inMarkupCorrection`
      if (inMarkupCorrection === 'NULL') {
        result = null
      } else {
        result = index + (inMarkupCorrection === 'END' ? markup.length : 0)
      }
    }
  }

  iterateMentionsMarkup(value, config, markupIteratee, textIteratee)

  // when a mention is at the end of the value and we want to get the caret position
  // at the end of the string, result is undefined
  return result === undefined ? value.length : result
}

export default mapPlainTextIndex
