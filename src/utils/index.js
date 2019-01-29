import isNumber from 'lodash/isNumber'
import isFinite from 'lodash/isFinite'
import keys from 'lodash/keys'
import { Children } from 'react'

import PLACEHOLDERS from './placeholders'
import iterateMentionsMarkup from './iterateMentionsMarkup'
import findPositionOfCapturingGroup from './findPositionOfCapturingGroup'
import countPlaceholders from './countPlaceholders'
import markupToRegex from './markupToRegex'

export { iterateMentionsMarkup }

export const spliceString = (str, start, end, insert) =>
  str.substring(0, start) + insert + str.substring(end)

/**
 * Returns the computed length property value for the provided element.
 * Note: According to spec and testing, can count on length values coming back in pixels. See https://developer.mozilla.org/en-US/docs/Web/CSS/used_value#Difference_from_computed_value
 */
export const getComputedStyleLengthProp = (forElement, propertyName) => {
  const length = parseFloat(
    window.getComputedStyle(forElement, null).getPropertyValue(propertyName)
  )
  return isFinite(length) ? length : 0
}

// make sure that the custom regex defines the correct number of capturing groups
const coerceCapturingGroups = (regex, markup) => {
  const numberOfGroups = new RegExp(regex.toString() + '|').exec('').length - 1
  if (numberOfGroups !== countPlaceholders(markup)) {
    throw new Error(
      `Number of capturing groups in RegExp ${regex.toString()} (${numberOfGroups}) does not match the number of placeholders in the markup '${markup}' (${numberOfPlaceholders})`
    )
  }

  return regex
}

export const readConfigFromChildren = children =>
  Children.toArray(children).map(
    ({ props: { markup, regex, displayTransform } }) => ({
      markup,
      regex: regex
        ? coerceCapturingGroups(regex, markup)
        : markupToRegex(markup),
      displayTransform: displayTransform || ((id, display) => display),
    })
  )

// For the passed character index in the plain text string, returns the corresponding index
// in the marked up value string.
// If the passed character index lies inside a mention, the value of `inMarkupCorrection` defines the
// correction to apply:
//   - 'START' to return the index of the mention markup's first char (default)
//   - 'END' to return the index after its last char
//   - 'NULL' to return null
export const mapPlainTextIndex = (
  value,
  config,
  indexInPlainText,
  inMarkupCorrection = 'START'
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

  iterateMentionsMarkup(value, config, textIteratee, markupIteratee)

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
    let controlPlainTextValue = getPlainText(
      newValue,
      markup,
      displayTransform,
      regex
    )
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
  let idPos = findPositionOfCapturingGroup(markup, 'id', regex)
  let displayPos = findPositionOfCapturingGroup(markup, 'display', regex)
  let typePos = findPositionOfCapturingGroup(markup, 'type', regex)
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
  return markup
    .replace(PLACEHOLDERS.id, id)
    .replace(PLACEHOLDERS.display, display)
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
