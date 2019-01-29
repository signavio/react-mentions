import expect, { createSpy } from 'expect'
import * as utils from './index'

describe('utils', () => {
  const defaultMarkup = '@[__display__](__type__:__id__)'
  const value =
    "Hi @[John Doe](user:johndoe), \n\nlet's add @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
  const plainText =
    "Hi John Doe, \n\nlet's add joe@smoe.com to this conversation..."

  const displayTransform = function(id) {
    return '<--' + id + '-->'
  }
  const plainTextDisplayTransform =
    "Hi <--johndoe-->, \n\nlet's add <--joe@smoe.com--> to this conversation..."

  describe('#spliceString', () => {
    it('should replace the substring between start and end with the provided insertion', () => {
      expect(utils.spliceString('012345678', 1, 4, 'xx')).toEqual('0xx45678')
    })
  })

  describe('#getPositionOfCapturingGroup', () => {
    const testData = {
      '@[__display__](__id__)': { display: 0, id: 1, type: null },
      '@[__display__](__type__:__id__)': { display: 0, id: 2, type: 1 },
      '@(__type__:__id__)': { display: 1, id: 1, type: 0 },
      '{{__id__#__display__}}': { display: 1, id: 0, type: null },
      '{{__id__}}': { display: 0, id: 0, type: null },
      '{{__display__}}': { display: 0, id: 0, type: null },
    }

    Object.keys(testData).forEach(key => {
      const markup = key
      const positions = testData[key]

      it(
        'should return ' +
          positions.display +
          ' for the `display` position in markup `' +
          markup +
          '`',
        () => {
          expect(utils.getPositionOfCapturingGroup(markup, 'display')).toEqual(
            positions.display
          )
        }
      )

      it(
        'should return ' +
          positions.id +
          ' for the `id` position in markup `' +
          markup +
          '`',
        () => {
          expect(utils.getPositionOfCapturingGroup(markup, 'id')).toEqual(
            positions.id
          )
        }
      )

      it(
        'should return ' +
          positions.type +
          ' for the `type` position in markup `' +
          markup +
          '`',
        () => {
          expect(utils.getPositionOfCapturingGroup(markup, 'type')).toEqual(
            positions.type
          )
        }
      )
    })
  })

  describe('#iterateMentionsMarkup', () => {
    it('should call the `markupIteratee` for every markup occurrence', () => {
      const markupIteratee = createSpy()
      utils.iterateMentionsMarkup(
        value,
        defaultMarkup,
        () => {},
        markupIteratee
      )

      expect(markupIteratee.calls.length).toEqual(2)
      expect(markupIteratee).toHaveBeenCalledWith(
        '@[John Doe](user:johndoe)',
        value.indexOf('@[John Doe](user:johndoe)'),
        plainText.indexOf('John Doe'),
        'johndoe',
        'John Doe',
        'user',
        0
      )
      expect(markupIteratee).toHaveBeenCalledWith(
        '@[joe@smoe.com](email:joe@smoe.com)',
        value.indexOf('@[joe@smoe.com](email:joe@smoe.com)'),
        plainText.indexOf('joe@smoe.com'),
        'joe@smoe.com',
        'joe@smoe.com',
        'email',
        value.indexOf('@[John Doe](user:johndoe)') +
          '@[John Doe](user:johndoe)'.length
      )
    })

    it('should call the `markupIteratee` with the correct plain text indices when a display transform is used', () => {
      const markupIteratee = createSpy()
      utils.iterateMentionsMarkup(
        value,
        defaultMarkup,
        () => {},
        markupIteratee,
        (id, display, type) => `[${display}]`
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
        'user',
        0
      )
      expect(markupIteratee).toHaveBeenCalledWith(
        '@[joe@smoe.com](email:joe@smoe.com)',
        value.indexOf('@[joe@smoe.com](email:joe@smoe.com)'),
        plainTextWithDisplayTransform.indexOf('[joe@smoe.com]'),
        'joe@smoe.com',
        '[joe@smoe.com]',
        'email',
        value.indexOf('@[John Doe](user:johndoe)') +
          '@[John Doe](user:johndoe)'.length
      )
    })

    it('should call the `textIteratee` for all plain text sub string between markups', () => {
      const textIteratee = createSpy()
      utils.iterateMentionsMarkup(value, defaultMarkup, textIteratee, () => {})

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
      utils.iterateMentionsMarkup(
        value,
        defaultMarkup,
        () => {},
        markupIteratee,
        displayTransform
      )

      expect(markupIteratee.calls.length).toEqual(2)
      expect(markupIteratee).toHaveBeenCalledWith(
        '@[John Doe](user:johndoe)',
        value.indexOf('@[John Doe](user:johndoe)'),
        plainTextDisplayTransform.indexOf('<--johndoe-->'),
        'johndoe',
        '<--johndoe-->',
        'user',
        0
      )
      expect(markupIteratee).toHaveBeenCalledWith(
        '@[joe@smoe.com](email:joe@smoe.com)',
        value.indexOf('@[joe@smoe.com](email:joe@smoe.com)'),
        plainTextDisplayTransform.indexOf('<--joe@smoe.com-->'),
        'joe@smoe.com',
        '<--joe@smoe.com-->',
        'email',
        value.indexOf('@[John Doe](user:johndoe)') +
          '@[John Doe](user:johndoe)'.length
      )
    })

    it('should call the `textIteratee` for all plain text sub string between markups with display transform', () => {
      const textIteratee = createSpy()
      utils.iterateMentionsMarkup(
        value,
        defaultMarkup,
        textIteratee,
        () => {},
        displayTransform
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

  describe('#mapPlainTextIndex', () => {
    it('should correctly calculate the index of a character in the plain text between mentions', () => {
      const plainTextIndex = plainText.indexOf("let's add")
      const result = utils.mapPlainTextIndex(
        value,
        defaultMarkup,
        plainTextIndex
      )
      expect(result).toEqual(value.indexOf("let's add"))
    })

    it('should correctly calculate the index of a character in the plain text between mentions with display tranform', () => {
      const plainTextIndex = plainTextDisplayTransform.indexOf("let's add")
      const result = utils.mapPlainTextIndex(
        value,
        defaultMarkup,
        plainTextIndex,
        'START',
        displayTransform
      )
      expect(result).toEqual(value.indexOf("let's add"))
    })

    it('should correctly calculate the indices of the character in the plain text before the first mention', () => {
      const result = utils.mapPlainTextIndex(value, defaultMarkup, 2)
      expect(result).toEqual(2)
    })

    it('should correctly calculate the index of a character in the plain text after the last mention', () => {
      const plainTextIndex = plainText.indexOf('...')
      const result = utils.mapPlainTextIndex(
        value,
        defaultMarkup,
        plainTextIndex
      )
      expect(result).toEqual(value.indexOf('...'))
    })

    it('should correctly calculate the index of the first plain text character after a mention', () => {
      const plainTextIndex = plainText.indexOf(',') // first char after John Doe mention
      const result = utils.mapPlainTextIndex(
        value,
        defaultMarkup,
        plainTextIndex
      )
      expect(result).toEqual(value.indexOf(','))
    })

    it('should return the input index if there are no mentions', () => {
      const result = utils.mapPlainTextIndex(plainText, defaultMarkup, 10)
      expect(result).toEqual(10)
    })

    it("should return the index of the corresponding markup's first character if the plain text index lies inside a mention", () => {
      // index for first char of markup
      let plainTextIndex = plainText.indexOf('John Doe')
      let result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex)
      expect(result).toEqual(value.indexOf('@[John Doe](user:johndoe)'))

      // index of char inside the markup
      const joeMarkup = '@[joe@smoe.com](email:joe@smoe.com)'
      plainTextIndex = plainText.indexOf('joe@smoe.com') + 3
      result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex)
      expect(result).toEqual(value.indexOf(joeMarkup))

      // index of markup's last char
      plainTextIndex =
        plainText.indexOf('joe@smoe.com') + 'joe@smoe.com'.length - 1
      result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex)
      expect(result).toEqual(value.indexOf(joeMarkup))
    })

    it("should return the index of the corresponding markup's last character if the plain text index lies inside a mention and the `inMarkupCorrection` is set to 'END'", () => {
      // index for first char of markup
      let plainTextIndex = plainText.indexOf('John Doe')
      let result = utils.mapPlainTextIndex(
        value,
        defaultMarkup,
        plainTextIndex,
        'END'
      )
      expect(result).toEqual(value.indexOf('@[John Doe](user:johndoe)'))

      // index of char inside the markup
      const joeMarkup = '@[joe@smoe.com](email:joe@smoe.com)'
      plainTextIndex = plainText.indexOf('joe@smoe.com') + 3
      result = utils.mapPlainTextIndex(
        value,
        defaultMarkup,
        plainTextIndex,
        'END'
      )
      expect(result).toEqual(value.indexOf(joeMarkup) + joeMarkup.length)

      // index of markup's last char
      plainTextIndex =
        plainText.indexOf('joe@smoe.com') + 'joe@smoe.com'.length - 1
      result = utils.mapPlainTextIndex(
        value,
        defaultMarkup,
        plainTextIndex,
        'END'
      )
      expect(result).toEqual(value.indexOf(joeMarkup) + joeMarkup.length)
    })

    it("should return `null` if `inMarkupCorrection` is set to 'NULL'", () => {
      // index of char inside the markup
      const plainTextIndex = plainText.indexOf('joe@smoe.com') + 3
      const result = utils.mapPlainTextIndex(
        value,
        defaultMarkup,
        plainTextIndex,
        'NULL'
      )
      expect(result).toEqual(null)
    })

    it("should return the index of the corresponding markup's first character if the plain text index lies inside a mention with display transform", () => {
      // index of char inside the markup
      const joeMarkup = '@[joe@smoe.com](email:joe@smoe.com)'
      const plainTextIndex =
        plainTextDisplayTransform.indexOf('joe@smoe.com') + 3
      const result = utils.mapPlainTextIndex(
        value,
        defaultMarkup,
        plainTextIndex
      )
      expect(result).toEqual(value.indexOf(joeMarkup))
    })

    it('should return the correctly mapped caret position at the end of the string after a mention', () => {
      const value = 'Hi @[John Doe](user:johndoe)'
      const plainText = 'Hi John Doe'
      const result = utils.mapPlainTextIndex(
        value,
        defaultMarkup,
        plainText.length,
        'END'
      )
      expect(result).toEqual(value.length)
    })
  })

  describe('#findStartOfMentionInPlainText', () => {
    it("should return the index of the mention's first char in the plain text if the passed index lies inside a mention", () => {
      const result = utils.findStartOfMentionInPlainText(
        value,
        defaultMarkup,
        plainText.indexOf('Doe')
      )
      expect(result).toEqual(plainText.indexOf('John Doe'))
    })

    it('should return `undefined`, if it does not lie inside a mention', () => {
      const result = utils.findStartOfMentionInPlainText(
        value,
        defaultMarkup,
        plainText.indexOf('add')
      )
      expect(result).toEqual(undefined)
    })

    it("should return the index of the mention's first char if that one is the probe value", () => {
      const result = utils.findStartOfMentionInPlainText(
        value,
        defaultMarkup,
        plainText.indexOf('John')
      )
      expect(result).toEqual(plainText.indexOf('John'))
    })
  })

  describe('#applyChangeToValue', () => {
    it('should correctly add a character at the end, beginning, and in the middle of text', () => {
      let changed = 'S' + plainText
      let result = utils.applyChangeToValue(
        value,
        defaultMarkup,
        changed,
        0,
        0,
        1
      )
      expect(result).toEqual('S' + value)

      changed = plainText + 'E'
      result = utils.applyChangeToValue(
        value,
        defaultMarkup,
        changed,
        plainText.length,
        plainText.length,
        changed.length
      )
      expect(result).toEqual(value + 'E')

      changed =
        "Hi John Doe, \n\nlet's Madd joe@smoe.com to this conversation..."
      result = utils.applyChangeToValue(
        value,
        defaultMarkup,
        changed,
        21,
        21,
        22
      )
      expect(result).toEqual(
        "Hi @[John Doe](user:johndoe), \n\nlet's Madd @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
      )
    })

    it('should correctly delete single characters and ranges of selected text', () => {
      // delete "i"
      let changed =
        "H John Doe, \n\nlet's add joe@smoe.com to this conversation..."
      let result = utils.applyChangeToValue(
        value,
        defaultMarkup,
        changed,
        2,
        2,
        1
      )
      expect(result).toEqual(
        "H @[John Doe](user:johndoe), \n\nlet's add @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
      )

      // delete "add "
      changed = "Hi John Doe, \n\nlet's joe@smoe.com to this conversation..."
      result = utils.applyChangeToValue(
        value,
        defaultMarkup,
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
      let result = utils.applyChangeToValue(
        value,
        defaultMarkup,
        changed,
        plainText.indexOf('add') + 'add'.length,
        plainText.indexOf('add') + 'add'.length,
        plainText.indexOf('add') + 'add add'.length
      )
      expect(result).toEqual(value.replace('add', 'add add'))

      // replace range
      changed = plainText.replace('add', 'remove')
      result = utils.applyChangeToValue(
        value,
        defaultMarkup,
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
      let result = utils.applyChangeToValue(
        value,
        defaultMarkup,
        changed,
        11,
        11,
        10
      )
      expect(result).toEqual(
        "Hi , \n\nlet's add @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
      )

      // delete mention inside the range
      changed = "Hi let's add joe@smoe.com to this conversation..."
      result = utils.applyChangeToValue(value, defaultMarkup, changed, 3, 15, 3)
      expect(result).toEqual(
        "Hi let's add @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
      )

      // delete mention partially inside the range
      changed =
        "Hi John Doe, \n\nlet's add joe@smoe.com to this conversation..."
      result = utils.applyChangeToValue(
        value,
        defaultMarkup,
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

      const result = utils.applyChangeToValue(
        value,
        defaultMarkup,
        changed,
        11,
        11,
        12
      )
      expect(result).toEqual('Hi @[John Doe](user:johndoe),')
    })

    it('should support deletion of whole words (Alt + Backspace) and whole lines (Cmd + Backspace)', () => {
      const changed = plainText.replace('add', '')

      const result = utils.applyChangeToValue(
        value,
        defaultMarkup,
        changed,
        24,
        24,
        21
      )
      expect(result).toEqual(
        "Hi @[John Doe](user:johndoe), \n\nlet's  @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
      )
    })

    it('should support deletion to the right using Del key', () => {
      const changed = plainText.replace('add', 'dd')

      const result = utils.applyChangeToValue(
        value,
        defaultMarkup,
        changed,
        21,
        21,
        21
      )
      expect(result).toEqual(
        "Hi @[John Doe](user:johndoe), \n\nlet's dd @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
      )
    })

    it('should support deletion to the right using Del key when using the displayTransform option', () => {
      const changed = plainTextDisplayTransform.replace('add', 'dd')
      const result = utils.applyChangeToValue(
        value,
        defaultMarkup,
        changed,
        26,
        26,
        26,
        displayTransform
      )
      expect(result).toEqual(
        "Hi @[John Doe](user:johndoe), \n\nlet's dd @[joe@smoe.com](email:joe@smoe.com) to this conversation..."
      )
    })

    it('should correctly handle text auto-correction', () => {
      const result = utils.applyChangeToValue(
        'ill',
        defaultMarkup,
        "I'll",
        3,
        3,
        4
      )
      expect(result).toEqual("I'll")
    })
  })

  describe('#getMentions', () => {
    it('should return an array of all mentions in the provided value', () => {
      const mentions = utils.getMentions(value, defaultMarkup)
      expect(mentions).toEqual([
        {
          id: 'johndoe',
          display: 'John Doe',
          type: 'user',
          index: 3,
          plainTextIndex: 3,
        },
        {
          id: 'joe@smoe.com',
          display: 'joe@smoe.com',
          type: 'email',
          index: 42,
          plainTextIndex: 25,
        },
      ])
    })

    it('should take into account the displayTransform if passed', () => {
      const mentions = utils.getMentions(value, defaultMarkup, displayTransform)
      expect(mentions).toEqual([
        {
          id: 'johndoe',
          display: '<--johndoe-->',
          type: 'user',
          index: 3,
          plainTextIndex: 3,
        },
        {
          id: 'joe@smoe.com',
          display: '<--joe@smoe.com-->',
          type: 'email',
          index: 42,
          plainTextIndex: 30,
        },
      ])
    })
  })

  describe('#getEndOfLastMention', () => {
    it('should return the end index of the last mention in the plain text', () => {
      const index = utils.getEndOfLastMention(value, defaultMarkup)
      expect(index).toEqual(37)
    })

    it('should take into account the displayTransform', () => {
      const index = utils.getEndOfLastMention(
        value,
        defaultMarkup,
        displayTransform
      )
      expect(index).toEqual(48)
    })

    it('should return 0 if there is no mention', () => {
      const index = utils.getEndOfLastMention(
        'No mentions to be found here',
        defaultMarkup
      )
      expect(index).toEqual(0)
    })
  })
})
