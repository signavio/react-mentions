import PLACEHOLDERS from './placeholders'

const escapeRegex = str => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

const markupToRegex = markup => {
  const markupPattern = escapeRegex(markup)
    .replace(PLACEHOLDERS.display, '(.+?)')
    .replace(PLACEHOLDERS.id, '(.+?)')
  return new RegExp(markupPattern)
}

export default markupToRegex
