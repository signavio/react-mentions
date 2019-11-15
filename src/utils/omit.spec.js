import omit from './omit'

describe('#omit', () => {
  const values = [
    { input: { a: 2 }, keys: [undefined], expected: { a: 2 } },
    { input: { a: 2 }, keys: ['a'], expected: {} },
    { input: { a: 2 }, keys: ['b'], expected: { a: 2 } },
    { input: { a: 2, c: 3 }, keys: 'b', expected: { a: 2, c: 3 } },
    { input: { a: 2, b: 3, c: 4 }, keys: ['a', 'c'], expected: { b: 3 } },
  ]

  values.forEach(value => {
    it(`should omit values from input with given key `, () => {
      expect(omit(value.input, value.keys, value.other)).toEqual(value.expected)
    })
  })

  it(`should omit values from input with given mutliples arguments `, () => {
    expect(omit({ a: 2, b: 3 }, 'style', ['someKey', 'otherKey', 'b'])).toEqual({ a: 2 })
  })
})
