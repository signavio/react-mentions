import getPlainText from './getPlainText'
import markupToRegex from './markupToRegex'

describe('#getPlainText', () => {
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

  it('should replace markup with the correct display values ', () => {
    expect(getPlainText(value, config)).toEqual(
      "Hi John Doe, \n\nlet's add joe@smoe.com to this conversation..."
    )
  })

  it('should take the displayTransform into account', () => {
    expect(
      getPlainText(
        value,
        config.map(c => ({ ...c, displayTransform: id => `<--${id}-->` }))
      )
    ).toEqual(
      "Hi <--johndoe-->, \n\nlet's add <--joe@smoe.com--> to this conversation..."
    )
  })
})
