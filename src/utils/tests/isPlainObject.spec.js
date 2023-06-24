import isPlainObject from './isPlainObject'

describe('isPlainObject', () => {
  ;[
    { input: {}, expected: true },
    { input: { a: 1 }, expected: true },
    { input: new Object(), expected: true }, // eslint-disable-line no-new-object
    { input: new Object({ a: 1 }), expected: true }, // eslint-disable-line no-new-object
    { input: new Object({}), expected: true }, // eslint-disable-line no-new-object
    { input: 2, expected: false },
    { input: 'Name', expected: false },
    { input: new Date(), expected: false },
  ].forEach(x => {
    it('should check if input is object', () => {
      expect(isPlainObject(x.input)).toBe(x.expected)
    })
  })
})
