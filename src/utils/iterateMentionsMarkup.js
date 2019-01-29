import findPositionOfCapturingGroup from './findPositionOfCapturingGroup'
import combineRegExps from './combineRegExps'
import countPlaceholders from './countPlaceholders'

// Finds all occurrences of the markup in the value and iterates the plain text sub strings
// in between those markups using `textIteratee` and the markup occurrences using the
// `markupIteratee`.
const iterateMentionsMarkup = (value, config, textIteratee, markupIteratee) => {
  const regex = combineRegExps(config.map(c => c.regex))

  let accOffset = 2 // first is whole match, second is the for the capturing group of first regexp component
  const captureGroupOffsets = config.map(({ markup }) => {
    const result = accOffset
    // + 1 is for the capturing group we add around each regexp component in combineRegExps
    accOffset += countPlaceholders(markup) + 1
    return result
  })

  let match
  let start = 0
  let currentPlainTextIndex = 0

  // detect all mention markup occurrences in the value and iterate the matches
  while ((match = regex.exec(value)) !== null) {
    console.log('MATCH', match)
    const offset = captureGroupOffsets.find(o => !!match[o])
    const mentionsChildIndex = captureGroupOffsets.indexOf(offset)
    const { markup, displayTransform } = config[mentionsChildIndex]
    const idPos = offset + findPositionOfCapturingGroup(markup, 'id')
    const displayPos = offset + findPositionOfCapturingGroup(markup, 'display')

    const id = match[idPos]
    const display = displayTransform(id, match[displayPos])

    let substr = value.substring(start, match.index)
    textIteratee(substr, start, currentPlainTextIndex)
    currentPlainTextIndex += substr.length
    console.log(
      match[0],
      match.index,
      currentPlainTextIndex,
      id,
      display,
      mentionsChildIndex,
      start
    )
    markupIteratee(
      match[0],
      match.index,
      currentPlainTextIndex,
      id,
      display,
      mentionsChildIndex,
      start
    )
    currentPlainTextIndex += display.length
    start = regex.lastIndex
  }

  if (start < value.length) {
    textIteratee(value.substring(start), start, currentPlainTextIndex)
  }
}

export default iterateMentionsMarkup
