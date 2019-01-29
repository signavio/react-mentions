import expect, { createSpy } from 'expect'
import iterateMentionsMarkup from './iterateMentionsMarkup'
import markupToRegex from './markupToRegex'

describe('#iterateMentionsMarkup', () => {
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

  const displayTransform = function(id) {
    return '<--' + id + '-->'
  }
  const plainTextDisplayTransform =
    "Hi <--johndoe-->, \n\nlet's add <--joe@smoe.com--> to this conversation..."

  it('should call the `markupIteratee` for every markup occurrence', () => {
    const markupIteratee = createSpy()
    iterateMentionsMarkup(value, config, () => {}, markupIteratee)

    expect(markupIteratee.calls.length).toEqual(2)
    expect(markupIteratee).toHaveBeenCalledWith(
      '@[John Doe](user:johndoe)',
      value.indexOf('@[John Doe](user:johndoe)'),
      plainText.indexOf('John Doe'),
      'johndoe',
      'John Doe',
      0,
      0
    )
    expect(markupIteratee).toHaveBeenCalledWith(
      '@[joe@smoe.com](email:joe@smoe.com)',
      value.indexOf('@[joe@smoe.com](email:joe@smoe.com)'),
      plainText.indexOf('joe@smoe.com'),
      'joe@smoe.com',
      'joe@smoe.com',
      1,
      value.indexOf('@[John Doe](user:johndoe)') +
        '@[John Doe](user:johndoe)'.length
    )
  })

  it('should call the `markupIteratee` with the correct plain text indices when a display transform is used', () => {
    const markupIteratee = createSpy()
    const displayTransform = (id, display) => `[${display}]`
    iterateMentionsMarkup(
      value,
      config.map(c => ({ ...c, displayTransform })),
      () => {},
      markupIteratee
    )
    const plainTextWithDisplayTransform =
      "Hi [John Doe], \n\nlet's add [joe@smoe.com] to this conversation..."

    expect(markupIteratee.calls.length).toEqual(2)
    expect(markupIteratee).toHaveBeenCalledWith(
      '@[John Doe](user:johndoe)',
      value.indexOf('@[John Doe](user:johndoe)'),
      plainTextWithDisplayTransform.indexOf('[John Doe]'),
      'johndoe',
      '[John Doe]',
      0,
      0
    )
    expect(markupIteratee).toHaveBeenCalledWith(
      '@[joe@smoe.com](email:joe@smoe.com)',
      value.indexOf('@[joe@smoe.com](email:joe@smoe.com)'),
      plainTextWithDisplayTransform.indexOf('[joe@smoe.com]'),
      'joe@smoe.com',
      '[joe@smoe.com]',
      1,
      value.indexOf('@[John Doe](user:johndoe)') +
        '@[John Doe](user:johndoe)'.length
    )
  })

  it('should call the `textIteratee` for all plain text sub string between markups', () => {
    const textIteratee = createSpy()
    iterateMentionsMarkup(value, config, textIteratee, () => {})

    expect(textIteratee.calls.length).toEqual(3)
    expect(textIteratee).toHaveBeenCalledWith('Hi ', 0, 0)
    expect(textIteratee).toHaveBeenCalledWith(
      ", \n\nlet's add ",
      value.indexOf(", \n\nlet's add "),
      plainText.indexOf(", \n\nlet's add ")
    )
    expect(textIteratee).toHaveBeenCalledWith(
      ' to this conversation...',
      value.indexOf(' to this conversation...'),
      plainText.indexOf(' to this conversation...')
    )
  })

  it('should call the `markupIteratee` for every markup occurrence with display transform', () => {
    const markupIteratee = createSpy()
    iterateMentionsMarkup(
      value,
      config.map(c => ({ ...c, displayTransform })),
      () => {},
      markupIteratee
    )

    expect(markupIteratee.calls.length).toEqual(2)
    expect(markupIteratee).toHaveBeenCalledWith(
      '@[John Doe](user:johndoe)',
      value.indexOf('@[John Doe](user:johndoe)'),
      plainTextDisplayTransform.indexOf('<--johndoe-->'),
      'johndoe',
      '<--johndoe-->',
      0,
      0
    )
    expect(markupIteratee).toHaveBeenCalledWith(
      '@[joe@smoe.com](email:joe@smoe.com)',
      value.indexOf('@[joe@smoe.com](email:joe@smoe.com)'),
      plainTextDisplayTransform.indexOf('<--joe@smoe.com-->'),
      'joe@smoe.com',
      '<--joe@smoe.com-->',
      1,
      value.indexOf('@[John Doe](user:johndoe)') +
        '@[John Doe](user:johndoe)'.length
    )
  })

  it('should call the `textIteratee` for all plain text sub string between markups with display transform', () => {
    const textIteratee = createSpy()
    iterateMentionsMarkup(
      value,
      config.map(c => ({ ...c, displayTransform })),
      textIteratee,
      () => {}
    )

    expect(textIteratee.calls.length).toEqual(3)
    expect(textIteratee).toHaveBeenCalledWith('Hi ', 0, 0)
    expect(textIteratee).toHaveBeenCalledWith(
      ", \n\nlet's add ",
      value.indexOf(", \n\nlet's add "),
      plainTextDisplayTransform.indexOf(", \n\nlet's add ")
    )
    expect(textIteratee).toHaveBeenCalledWith(
      ' to this conversation...',
      value.indexOf(' to this conversation...'),
      plainTextDisplayTransform.indexOf(' to this conversation...')
    )
  })
})
