import mapPlainTextIndex from './mapPlainTextIndex'
import getPlainText from './getPlainText'
import spliceString from './spliceString'

// Applies a change from the plain text textarea to the underlying marked up value
// guided by the textarea text selection ranges before and after the change
const applyChangeToValue = (
  value,
  config,
  plainTextValue,
  selectionStartBeforeChange,
  selectionEndBeforeChange,
  selectionEndAfterChange
) => {
  let oldPlainTextValue = getPlainText(value, config)

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

  let mappedSpliceStart = mapPlainTextIndex(value, config, spliceStart, 'START')
  let mappedSpliceEnd = mapPlainTextIndex(value, config, spliceEnd, 'END')

  let controlSpliceStart = mapPlainTextIndex(value, config, spliceStart, 'NULL')
  let controlSpliceEnd = mapPlainTextIndex(value, config, spliceEnd, 'NULL')
  let willRemoveMention =
    controlSpliceStart === null || controlSpliceEnd === null

  let newValue = spliceString(value, mappedSpliceStart, mappedSpliceEnd, insert)

  if (!willRemoveMention) {
    // test for auto-completion changes
    let controlPlainTextValue = getPlainText(newValue, config)
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
      mappedSpliceStart = mapPlainTextIndex(value, config, spliceStart, 'START')
      mappedSpliceEnd = mapPlainTextIndex(value, config, spliceEnd, 'END')
      newValue = spliceString(value, mappedSpliceStart, mappedSpliceEnd, insert)
    }
  }

  return newValue
}

export default applyChangeToValue
