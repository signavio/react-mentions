import { Children } from 'react'
import markupToRegex from './markupToRegex'
import countPlaceholders from './countPlaceholders'

const readConfigFromChildren = children =>
  Children.toArray(children).map(
    ({ props: { markup, regex, displayTransform } }) => ({
      markup,
      regex: regex
        ? coerceCapturingGroups(regex, markup)
        : markupToRegex(markup),
      displayTransform: displayTransform || ((id, display) => display),
    })
  )

// make sure that the custom regex defines the correct number of capturing groups
const coerceCapturingGroups = (regex, markup) => {
  const numberOfGroups = new RegExp(regex.toString() + '|').exec('').length - 1
  const numberOfPlaceholders = countPlaceholders(markup)
  if (numberOfGroups !== numberOfPlaceholders) {
    throw new Error(
      `Number of capturing groups in RegExp ${regex.toString()} (${numberOfGroups}) does not match the number of placeholders in the markup '${markup}' (${numberOfPlaceholders})`
    )
  }

  return regex
}

export default readConfigFromChildren
