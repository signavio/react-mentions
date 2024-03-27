import createMatcher from './createMatcher'

describe('#createMatcher', () => {
  it('should match substring including input value', () => {
    const enRegex = createMatcher('je')
    expect(enRegex.test('Jesse Pinkman')).toEqual(true)
    expect(enRegex.test('Pinkman')).toEqual(false)

    const enRegex2 = createMatcher('pi')
    expect('Jesse Pinkman'.match(enRegex2).index).toEqual(6)
    expect('Pinkman'.match(enRegex2).index).toEqual(0)
  })

  it('should match substring including Korean consonants', () => {
    const koRegex = createMatcher('ㅅㄷ')
    expect(koRegex.test('성덕선')).toEqual(true)
    expect(koRegex.test('덕선')).toEqual(false)

    const enRegex2 = createMatcher('ㄷㅅ')
    expect('성덕선'.match(enRegex2).index).toEqual(1)
    expect('덕선'.match(enRegex2).index).toEqual(0)
  })
})
