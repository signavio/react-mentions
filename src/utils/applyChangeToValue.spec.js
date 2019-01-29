import expect from 'expect'
import applyChangeToValue from './applyChangeToValue'
import markupToRegex from './markupToRegex'

describe('#applyChangeToValue', () => {
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

  const displayTransform = id => `<--${id}-->`
  const plainTextDisplayTransform =
    "Hi <--johndoe-->, \n\nlet's add <--joe@smoe.com--> to this conversation..."

  it('should correctly add a character at the end, beginning, and in the middle of text', () => {
    let changed = 'S' + plainText
    let result = applyChangeToValue(value, config, changed, 0, 0, 1)
    expect(result).toEqual('S' + value)

    changed = plainText + 'E'
    result = applyChangeToValue(
      value,
      config,
      changed,
      plainText.length,
      plainText.length,
      changed.length
    )
    expect(result).toEqual(value + 'E')

    changed = "Hi John Doe, \n\nlet's Madd joe@smoe.com to this conversation..."
    result = applyChangeToValue(value, config, changed, 21, 21, 22)
    expect(result).toEqual(
      "Hi @[John Doe](user:johndoe), \n\nlet's Madd @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
    )
  })

  it('should correctly delete single characters and ranges of selected text', () => {
    // delete "i"
    let changed =
      "H John Doe, \n\nlet's add joe@smoe.com to this conversation..."
    let result = applyChangeToValue(value, config, changed, 2, 2, 1)
    expect(result).toEqual(
      "H @[John Doe](user:johndoe), \n\nlet's add @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
    )

    // delete "add "
    changed = "Hi John Doe, \n\nlet's joe@smoe.com to this conversation..."
    result = applyChangeToValue(
      value,
      config,
      changed,
      plainText.indexOf('add '),
      plainText.indexOf('add ') + 'add '.length,
      plainText.indexOf('add ')
    )
    expect(result).toEqual(
      "Hi @[John Doe](user:johndoe), \n\nlet's @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
    )
  })

  it('should correctly add ranges of pasted text and replace the selected range with the new range', () => {
    // add range
    let changed = plainText.replace('add', 'add add')
    let result = applyChangeToValue(
      value,
      config,
      changed,
      plainText.indexOf('add') + 'add'.length,
      plainText.indexOf('add') + 'add'.length,
      plainText.indexOf('add') + 'add add'.length
    )
    expect(result).toEqual(value.replace('add', 'add add'))

    // replace range
    changed = plainText.replace('add', 'remove')
    result = applyChangeToValue(
      value,
      config,
      changed,
      plainText.indexOf('add'),
      plainText.indexOf('add') + 'add'.length,
      plainText.indexOf('add') + 'remove'.length
    )
    expect(result).toEqual(value.replace('add', 'remove'))
  })

  it('should remove mentions markup contained in deleted text ranges', () => {
    // delete without a range selection
    let changed =
      "Hi John Do, \n\nlet's add joe@smoe.com to this conversation..."
    let result = applyChangeToValue(value, config, changed, 11, 11, 10)
    expect(result).toEqual(
      "Hi , \n\nlet's add @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
    )

    // delete mention inside the range
    changed = "Hi let's add joe@smoe.com to this conversation..."
    result = applyChangeToValue(value, config, changed, 3, 15, 3)
    expect(result).toEqual(
      "Hi let's add @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
    )

    // delete mention partially inside the range
    changed = "Hi John Doe, \n\nlet's add joe@smoe.com to this conversation..."
    result = applyChangeToValue(
      value,
      config,
      changed,
      plainText.indexOf(' add'),
      plainText.indexOf(' add') + ' add joe@'.length,
      plainText.indexOf(' add')
    )
    expect(result).toEqual(
      "Hi @[John Doe](user:johndoe), \n\nlet's to this conversation..."
    )
  })

  it('should correctly add a new character after a mention at the end of the string', () => {
    const value = 'Hi @[John Doe](user:johndoe)'
    const changed = 'Hi John Doe,'

    const result = applyChangeToValue(value, config, changed, 11, 11, 12)
    expect(result).toEqual('Hi @[John Doe](user:johndoe),')
  })

  it('should support deletion of whole words (Alt + Backspace) and whole lines (Cmd + Backspace)', () => {
    const changed = plainText.replace('add', '')

    const result = applyChangeToValue(value, config, changed, 24, 24, 21)
    expect(result).toEqual(
      "Hi @[John Doe](user:johndoe), \n\nlet's  @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
    )
  })

  it('should support deletion to the right using Del key', () => {
    const changed = plainText.replace('add', 'dd')

    const result = applyChangeToValue(value, config, changed, 21, 21, 21)
    expect(result).toEqual(
      "Hi @[John Doe](user:johndoe), \n\nlet's dd @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
    )
  })

  it('should support deletion to the right using Del key when using the displayTransform option', () => {
    const changed = plainTextDisplayTransform.replace('add', 'dd')
    const result = applyChangeToValue(
      value,
      config.map(c => ({ ...c, displayTransform })),
      changed,
      26,
      26,
      26
    )
    expect(result).toEqual(
      "Hi @[John Doe](user:johndoe), \n\nlet's dd @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
    )
  })

  it('should correctly handle text auto-correction', () => {
    const result = applyChangeToValue('ill', config, "I'll", 3, 3, 4)
    expect(result).toEqual("I'll")
  })
})
