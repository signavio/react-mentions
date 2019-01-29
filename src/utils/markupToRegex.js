import PLACEHOLDERS from './placeholders'
import escapeRegex from './escapeRegex'

const markupToRegex = markup => {
  const markupPattern = escapeRegex(markup)
    .replace(PLACEHOLDERS.display, '(.+?)')
    .replace(PLACEHOLDERS.id, '(.+?)')
  return new RegExp(markupPattern)
}

export default markupToRegex
