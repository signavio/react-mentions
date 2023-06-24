import findStartOfMentionInPlainText from '../findStartOfMentionInPlainText'
import markupToRegex from '../markupToRegex'

describe('#findStartOfMentionInPlainText', () => {
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
  const plainText =
    "Hi John Doe, \n\nlet's add joe@smoe.com to this conversation..."

  it("should return the index of the mention's first char in the plain text if the passed index lies inside a mention", () => {
    const result = findStartOfMentionInPlainText(
      value,
      config,
      plainText.indexOf('Doe')
    )
    expect(result).toEqual(plainText.indexOf('John Doe'))
  })

  it('should return `undefined`, if it does not lie inside a mention', () => {
    const result = findStartOfMentionInPlainText(
      value,
      config,
      plainText.indexOf('add')
    )
    expect(result).toEqual(undefined)
  })

  it("should return the index of the mention's first char if that one is the probe value", () => {
    const result = findStartOfMentionInPlainText(
      value,
      config,
      plainText.indexOf('John')
    )
    expect(result).toEqual(plainText.indexOf('John'))
  })
})
