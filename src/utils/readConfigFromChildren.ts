import { Children } from 'react'
import invariant from 'invariant'
import markupToRegex from './markupToRegex'
import countPlaceholders from './countPlaceholders'
import { MentionProps } from '../Typescript/types/types'

type MentionChild = React.ReactElement<MentionProps>

const readConfigFromChildren = (children: MentionChild[]) =>
  (Children.toArray(children) as MentionChild[]).map(
    ({ props: { markup, regex, displayTransform } }) => ({
      markup,
      regex: regex
        ? coerceCapturingGroups(regex, markup)
        : markupToRegex(markup as string),
      displayTransform:
        displayTransform || ((id?: string, display?: string) => display || id),
    })
  )

// make sure that the custom regex defines the correct number of capturing groups
const coerceCapturingGroups = (regex: RegExp, markup?: string) => {
  // I did a ugly hack here because
  // didn't want to waste time her
  const numberOfGroups =
    new RegExp(regex.toString() + '|').exec('')!?.length - 1
  const numberOfPlaceholders = countPlaceholders(markup)

  invariant(
    numberOfGroups === numberOfPlaceholders,
    `Number of capturing groups in RegExp ${regex.toString()} (${numberOfGroups}) does not match the number of placeholders in the markup '${markup}' (${numberOfPlaceholders})`
  )

  return regex
}

export default readConfigFromChildren
