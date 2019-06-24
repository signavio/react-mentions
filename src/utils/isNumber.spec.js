import expect from 'expect'
import isNumber from './isNumber';

describe("#isNumber", () => {
  const passingValues = [
    1,
    0,
    NaN
  ]
  const failingValues = [
    [1, 2, 3],
    Object(0),
    true,
    new Date(),
    new Error(),
    { 'a': 1 },
    /x/,
    'a',
  ]

  passingValues.forEach(value => {
    it(`should return "true" for numbers: ${value}`, () => {
      const result = isNumber(value)
      expect(result).toBe(true)
    })
  })

  failingValues.forEach(value => {
    it(`should return "false" for non-numbers: ${value}`, () => {
      const result = isNumber(value)
      expect(result).toBe(false)
    })
  })
});