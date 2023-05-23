import PLACEHOLDERS from './placeholders'

const makeMentionsMarkup = (markup, id, display) => {
  return markup
    .replace(PLACEHOLDERS.id, id)
    .replace(PLACEHOLDERS.display, display)
}

export default makeMentionsMarkup
