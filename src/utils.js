import isNumber from 'lodash/isNumber'
import isFinite from 'lodash/isFinite'
import keys from 'lodash/keys'

const PLACEHOLDERS = {
  id: '__id__',
  display: '__display__',
  type: '__type__',
}

const numericComparator = function(a, b) {
  a = a === null ? Number.MAX_VALUE : a
  b = b === null ? Number.MAX_VALUE : b
  return a - b
}

export const escapeRegex = str => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')


const countCapturingGroups = regex => {
  return (new RegExp(regex.toString() + '|')).exec('').length - 1
}

const markupToRegex = (markup) => {
  let markupPattern = escapeRegex(markup)
  markupPattern = markupPattern.replace(PLACEHOLDERS.display, '(.+?)')
  markupPattern = markupPattern.replace(PLACEHOLDERS.id, '(.+?)')
  markupPattern = markupPattern.replace(PLACEHOLDERS.type, '(.+?)')

  return new RegExp(markupPattern, 'g')
}

export const spliceString = (str, start, end, insert) =>
  str.substring(0, start) + insert + str.substring(end)

/**
 * Returns the computed length property value for the provided element.
 * Note: According to spec and testing, can count on length values coming back in pixels. See https://developer.mozilla.org/en-US/docs/Web/CSS/used_value#Difference_from_computed_value
 */
export const getComputedStyleLengthProp = (forElement, propertyName) => {
  const length = parseFloat(window.getComputedStyle(forElement, null).getPropertyValue(propertyName))
  return isFinite(length) ? length : 0;
}

/**
 * parameterName: "id", "display", or "type"
 * TODO: This is currently only exported for testing
 */
export const getPositionOfCapturingGroup = (markup, parameterName, regex) => {
  if (
    parameterName !== 'id' &&
    parameterName !== 'display' &&
    parameterName !== 'type'
  ) {
    throw new Error("parameterName must be 'id', 'display', or 'type'")
  }

  // calculate positions of placeholders in the markup
  let indexDisplay = markup.indexOf(PLACEHOLDERS.display)
  let indexId = markup.indexOf(PLACEHOLDERS.id)
  let indexType = markup.indexOf(PLACEHOLDERS.type)

  // set indices to null if not found
  if (indexDisplay < 0) indexDisplay = null
  if (indexId < 0) indexId = null
  if (indexType < 0) indexType = null

  if (indexDisplay === null && indexId === null) {
    // markup contains none of the mandatory placeholders
    throw new Error(
      'The markup `' +
        markup +
        '` must contain at least one of the placeholders `__id__` or `__display__`'
    )
  }

  if (indexType === null && parameterName === 'type') {
    // markup does not contain optional __type__ placeholder
    return null
  }

  // sort indices in ascending order (null values will always be at the end)
  const sortedIndices = [indexDisplay, indexId, indexType].sort(
    numericComparator
  )

  // If only one the placeholders __id__ and __display__ is present,
  // use the captured string for both parameters, id and display
  if (indexDisplay === null) indexDisplay = indexId
  if (indexId === null) indexId = indexDisplay


  if(regex && countCapturingGroups(regex) === 0) {
    // custom regex does not use any capturing groups, so use the full match for ID and display
    return parameterName === "type" ? null : 0;
  }

  if(parameterName === "id") return sortedIndices.indexOf(indexId);
  if(parameterName === "display") return sortedIndices.indexOf(indexDisplay);
  if(parameterName === "type") return indexType === null ? null : sortedIndices.indexOf(indexType);

}

// Finds all occurences of the markup in the value and iterates the plain text sub strings
// in between those markups using `textIteratee` and the markup occurrences using the
// `markupIteratee`.
export const iterateMentionsMarkup = (
  value,
  markup,
  textIteratee,
  markupIteratee,
  displayTransform,
  regex
) => {
  regex = regex || markupToRegex(markup)
  let displayPos = getPositionOfCapturingGroup(markup, 'display', regex)
  let idPos = getPositionOfCapturingGroup(markup, 'id', regex)
  let typePos = getPositionOfCapturingGroup(markup, 'type', regex)

  let match
  let start = 0
  let currentPlainTextIndex = 0

  // detect all mention markup occurences in the value and iterate the matches
  while ((match = regex.exec(value)) !== null) {
    // first argument is the whole match, capturing groups are following
    let id = match[idPos + 1]
    let display = match[displayPos + 1]
    let type = typePos !== null ? match[typePos + 1] : null

    if (displayTransform) display = displayTransform(id, display, type)

    let substr = value.substring(start, match.index)
    textIteratee(substr, start, currentPlainTextIndex)
    currentPlainTextIndex += substr.length

    markupIteratee(
      match[0],
      match.index,
      currentPlainTextIndex,
      id,
      display,
      type,
      start
    )
    currentPlainTextIndex += display.length

    start = regex.lastIndex
  }

  if (start < value.length) {
    textIteratee(value.substring(start), start, currentPlainTextIndex)
  }
}

// For the passed character index in the plain text string, returns the corresponding index
// in the marked up value string.
// If the passed character index lies inside a mention, the value of `inMarkupCorrection` defines the
// correction to apply:
//   - 'START' to return the index of the mention markup's first char (default)
//   - 'END' to return the index after its last char
//   - 'NULL' to return null
export const mapPlainTextIndex = (
  value,
  markup,
  indexInPlainText,
  inMarkupCorrection = 'START',
  displayTransform,
  regex
) => {
  if (!isNumber(indexInPlainText)) {
    return indexInPlainText
  }

  let result
  let textIteratee = function(substr, index, substrPlainTextIndex) {
    if (result !== undefined) return

    if (substrPlainTextIndex + substr.length >= indexInPlainText) {
      // found the corresponding position in the current plain text range
      result = index + indexInPlainText - substrPlainTextIndex
    }
  }
  let markupIteratee = function(
    markup,
    index,
    mentionPlainTextIndex,
    id,
    display,
    type,
    lastMentionEndIndex
  ) {
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

  iterateMentionsMarkup(
    value,
    markup,
    textIteratee,
    markupIteratee,
    displayTransform,
    regex
  )

  // when a mention is at the end of the value and we want to get the caret position
  // at the end of the string, result is undefined
  return result === undefined ? value.length : result
}

// For a given indexInPlainText that lies inside a mention,
// returns a the index of of the first char of the mention in the plain text.
// If indexInPlainText does not lie inside a mention, returns indexInPlainText.
export const findStartOfMentionInPlainText = (
  value,
  markup,
  indexInPlainText,
  displayTransform,
  regex
) => {
  let result = indexInPlainText
  let foundMention = false

  let markupIteratee = function(
    markup,
    index,
    mentionPlainTextIndex,
    id,
    display,
    type,
    lastMentionEndIndex
  ) {
    if (
      mentionPlainTextIndex <= indexInPlainText &&
      mentionPlainTextIndex + display.length > indexInPlainText
    ) {
      result = mentionPlainTextIndex
      foundMention = true
    }
  }
  iterateMentionsMarkup(
    value,
    markup,
    function() {},
    markupIteratee,
    displayTransform,
    regex
  )

  if (foundMention) {
    return result
  }
}

// Applies a change from the plain text textarea to the underlying marked up value
// guided by the textarea text selection ranges before and after the change
export const applyChangeToValue = (
  value,
  markup,
  plainTextValue,
  selectionStartBeforeChange,
  selectionEndBeforeChange,
  selectionEndAfterChange,
  displayTransform,
  regex
) => {
  let oldPlainTextValue = getPlainText(value, markup, displayTransform, regex)

  let lengthDelta = oldPlainTextValue.length - plainTextValue.length
  if (selectionStartBeforeChange === 'undefined') {
    selectionStartBeforeChange = selectionEndAfterChange + lengthDelta
  }

  if (selectionEndBeforeChange === 'undefined') {
    selectionEndBeforeChange = selectionStartBeforeChange
  }

  // Fixes an issue with replacing combined characters for complex input. Eg like acented letters on OSX
  if (
    selectionStartBeforeChange === selectionEndBeforeChange &&
    selectionEndBeforeChange === selectionEndAfterChange &&
    oldPlainTextValue.length === plainTextValue.length
  ) {
    selectionStartBeforeChange = selectionStartBeforeChange - 1
  }

  // extract the insertion from the new plain text value
  let insert = plainTextValue.slice(
    selectionStartBeforeChange,
    selectionEndAfterChange
  )

  // handling for Backspace key with no range selection
  let spliceStart = Math.min(
    selectionStartBeforeChange,
    selectionEndAfterChange
  )

  let spliceEnd = selectionEndBeforeChange
  if (selectionStartBeforeChange === selectionEndAfterChange) {
    // handling for Delete key with no range selection
    spliceEnd = Math.max(
      selectionEndBeforeChange,
      selectionStartBeforeChange + lengthDelta
    )
  }

  let mappedSpliceStart = mapPlainTextIndex(
    value,
    markup,
    spliceStart,
    'START',
    displayTransform,
    regex
  )
  let mappedSpliceEnd = mapPlainTextIndex(
    value,
    markup,
    spliceEnd,
    'END',
    displayTransform,
    regex
  )

  let controlSpliceStart = mapPlainTextIndex(
    value,
    markup,
    spliceStart,
    'NULL',
    displayTransform,
    regex
  )
  let controlSpliceEnd = mapPlainTextIndex(
    value,
    markup,
    spliceEnd,
    'NULL',
    displayTransform,
    regex
  )
  let willRemoveMention =
    controlSpliceStart === null || controlSpliceEnd === null

  let newValue = spliceString(value, mappedSpliceStart, mappedSpliceEnd, insert)

  if (!willRemoveMention) {
    // test for auto-completion changes
    let controlPlainTextValue = getPlainText(newValue, markup, displayTransform, regex)
    if (controlPlainTextValue !== plainTextValue) {
      // some auto-correction is going on

      // find start of diff
      spliceStart = 0
      while (plainTextValue[spliceStart] === controlPlainTextValue[spliceStart])
        spliceStart++

      // extract auto-corrected insertion
      insert = plainTextValue.slice(spliceStart, selectionEndAfterChange)

      // find index of the unchanged remainder
      spliceEnd = oldPlainTextValue.lastIndexOf(
        plainTextValue.substring(selectionEndAfterChange)
      )

      // re-map the corrected indices
      mappedSpliceStart = mapPlainTextIndex(
        value,
        markup,
        spliceStart,
        'START',
        displayTransform,
        regex
      )
      mappedSpliceEnd = mapPlainTextIndex(
        value,
        markup,
        spliceEnd,
        'END',
        displayTransform,
        regex
      )
      newValue = spliceString(value, mappedSpliceStart, mappedSpliceEnd, insert)
    }
  }

  return newValue
}

export const getPlainText = (value, markup, displayTransform, regex) => {
  regex = regex || markupToRegex(markup)
  let idPos = getPositionOfCapturingGroup(markup, 'id', regex)
  let displayPos = getPositionOfCapturingGroup(markup, 'display', regex)
  let typePos = getPositionOfCapturingGroup(markup, 'type', regex)
  return value.replace(regex, function() {
    // first argument is the whole match, capturing groups are following
    let id = arguments[idPos + 1]
    let display = arguments[displayPos + 1]
    let type = typePos !== null ? arguments[typePos + 1] : null
    if (displayTransform) display = displayTransform(id, display, type)
    return display
  })
}

export const getMentions = (value, markup, displayTransform, regex) => {
  let mentions = []
  iterateMentionsMarkup(
    value,
    markup,
    function() {},
    function(match, index, plainTextIndex, id, display, type, start) {
      mentions.push({
        id: id,
        display: display,
        type: type,
        index: index,
        plainTextIndex: plainTextIndex,
      })
    },
    displayTransform,
    regex
  )
  return mentions
}

export const getEndOfLastMention = (value, markup, displayTransform, regex) => {
  const mentions = getMentions(value, markup, displayTransform, regex)
  const lastMention = mentions[mentions.length - 1]
  return lastMention
    ? lastMention.plainTextIndex + lastMention.display.length
    : 0
}

export const makeMentionsMarkup = (markup, id, display, type) => {
  let result = markup.replace(PLACEHOLDERS.id, id)
  result = result.replace(PLACEHOLDERS.display, display)
  result = result.replace(PLACEHOLDERS.type, type)
  return result
}

export const countSuggestions = suggestions =>
  keys(suggestions).reduce(
    (acc, prop) => acc + suggestions[prop].results.length,
    0
  )

export const getSuggestions = suggestions =>
  keys(suggestions).reduce(
    (acc, mentionType) => [
      ...acc,
      {
        suggestions: suggestions[mentionType].results,
        descriptor: suggestions[mentionType],
      },
    ],
    []
  )

export const getSuggestion = (suggestions, index) =>
  getSuggestions(suggestions).reduce(
    (result, { suggestions, descriptor }) => [
      ...result,

      ...suggestions.map(suggestion => ({
        suggestion: suggestion,
        descriptor: descriptor,
      })),
    ],
    []
  )[index]
