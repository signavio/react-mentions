import getMentions from './getMentions'
import markupToRegex from './markupToRegex'

describe('#getMentions', () => {
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

  it('should return an array of all mentions in the provided value', () => {
    const mentions = getMentions(value, config)
    expect(mentions).toEqual([
      {
        id: 'johndoe',
        display: 'John Doe',
        childIndex: 0,
        index: 3,
        plainTextIndex: 3,
      },
      {
        id: 'joe@smoe.com',
        display: 'joe@smoe.com',
        childIndex: 1,
        index: 42,
        plainTextIndex: 25,
      },
    ])
  })

  it('should take into account the displayTransform if passed', () => {
    const mentions = getMentions(
      value,
      config.map(c => ({ ...c, displayTransform }))
    )
    expect(mentions).toEqual([
      {
        id: 'johndoe',
        display: '<--johndoe-->',
        childIndex: 0,
        index: 3,
        plainTextIndex: 3,
      },
      {
        id: 'joe@smoe.com',
        display: '<--joe@smoe.com-->',
        childIndex: 1,
        index: 42,
        plainTextIndex: 30,
      },
    ])
  })
})
