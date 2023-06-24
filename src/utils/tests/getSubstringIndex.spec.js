import getSubstringIndex, { normalizeString } from './getSubstringIndex'

describe('#normalizeString', () => {
  it('Should return the string in lowercase without accents', () => {
    expect(normalizeString('Aurait-Il été ãdOré là-bas ?')).toEqual(
      'aurait-il ete adore la-bas ?'
    )
  })
})

describe('#getSubstringIndex', () => {
  it('Should return the index of the substring or -1 ignoring only the case', () => {
    expect(
      getSubstringIndex('Aurait-Il été ãdOré là-bas ?', 'aurait-il')
    ).toEqual(0)
    expect(getSubstringIndex('Aurait-Il été ãdOré là-bas ?', 'adore')).toEqual(
      -1
    )
    expect(
      getSubstringIndex(
        'Aurait-Il été ãdOré là-bas ?',
        'not existing substring'
      )
    ).toEqual(-1)
  })
  it('Should return the index of the substring or -1 ignoring the accents and the case', () => {
    expect(
      getSubstringIndex('Aurait-Il été ãdOré là-bas ?', 'adore', true)
    ).toEqual(14)
    expect(
      getSubstringIndex(
        'Aurait-Il été ãdOré là-bas ?',
        'not existing substring',
        true
      )
    ).toEqual(-1)
  })
})
