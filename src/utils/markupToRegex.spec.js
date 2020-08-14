import markupToRegex from './markupToRegex'

describe('#markupToRegex', () => {
  it('it should generate a regex that matches the markup for the given pattern', () => {
    const regex = markupToRegex('@[__display__](foo:__id__)')

    const [mention, display, id] = regex.exec('Hi @[Foo](foo:1), how are you?')

    expect(mention).toEqual('@[Foo](foo:1)')
    expect(display).toEqual('Foo')
    expect(id).toEqual('1')
  })

  it('it should match lazily', () => {
    const regex = markupToRegex('@[__display__](foo:__id__)')

    const [mention, display, id] = regex.exec(
      'Hi @[Foo](foo:1)](bar:2), how are you?'
    )

    expect(mention).toEqual('@[Foo](foo:1)')
    expect(display).toEqual('Foo')
    expect(id).toEqual('1')
  })

  it('should only should stop matching the placeholder group once we hit the char after the placeholder in the markup', () => {
    const regex = markupToRegex('@[__display__](foo:__id__)')
    expect(regex.exec('Hi @[Foo], how are you ](foo:1)')).toEqual(null)
  })
  
  it('should parse regex that doesn\'t use "display"', () => {
    const regex = markupToRegex('[tag id=__id__ /]')
    expect(regex.exec('[tag id=italy /]')[1]).toEqual('italy')
  })
})
