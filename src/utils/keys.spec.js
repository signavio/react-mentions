import keys from './keys'

describe('#keys', () => {
  const inputValues = [{ input: { a: 1, b: 1 }, expected: ['a', 'b'] }, { input: {}, expected: [] }]

  inputValues.forEach(value => {
    it(`should return the string keyed property names of 'object'`, () => {
      expect(keys(value.input)).toEqual(value.expected)
    })
  })
})
