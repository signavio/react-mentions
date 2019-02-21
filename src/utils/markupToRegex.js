import PLACEHOLDERS from './placeholders'
import escapeRegex from './escapeRegex'

const markupToRegex = markup => {
  const escapedMarkup = escapeRegex(markup)
  const charAfterDisplay =
    markup[markup.indexOf(PLACEHOLDERS.display) + PLACEHOLDERS.display.length]
  const charAfterId =
    markup[markup.indexOf(PLACEHOLDERS.display) + PLACEHOLDERS.display.length]
  return new RegExp(
    escapedMarkup
      .replace(
        PLACEHOLDERS.display,
        `([^${escapeRegex(charAfterDisplay || '')}]+?)`
      )
      .replace(PLACEHOLDERS.id, `([^${escapeRegex(charAfterId || '')}]+?)`)
  )
}

export default markupToRegex
