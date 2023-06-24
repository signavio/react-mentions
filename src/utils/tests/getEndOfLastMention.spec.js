import getEndOfLastMention from '../getEndOfLastMention'
import markupToRegex from '../markupToRegex'

describe('#getEndOfLastMention', () => {
  const userMarkup = '@[__display__](user:__id__)'
  const emailMarkup = '@[__display__](email:__id__)'
  const defaultDisplayTransform = (id, display) => display
  const config = [
    {
      markup: userMarkup,
      regex: markupToRegex(userMarkup),
      displayTransform: defaultDisplayTransform,
    },
    {
      markup: emailMarkup,
      regex: markupToRegex(emailMarkup),
      displayTransform: defaultDisplayTransform,
    },
  ]

  const value =
    "Hi @[John Doe](user:johndoe), \n\nlet's add @[joe@smoe.com](email:joe@smoe.com) to this conversation..."

  const displayTransform = id => `<--${id}-->`

  it('should return the end index of the last mention in the plain text', () => {
    const index = getEndOfLastMention(value, config)
    expect(index).toEqual(37)
  })

  it('should take into account the displayTransform', () => {
    const index = getEndOfLastMention(
      value,
      config.map(c => ({ ...c, displayTransform }))
    )
    expect(index).toEqual(48)
  })

  it('should return 0 if there is no mention', () => {
    const index = getEndOfLastMention('No mentions to be found here', config)
    expect(index).toEqual(0)
  })
})
