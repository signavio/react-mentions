import expect from 'expect'
import isObjectEqual from './isObjectEqual';

describe('#isObjectEqual', () => {
  const pairs = [
    [{ left: 1, top: 2 }, { left: 1, top: 2 }, true],
    [{ left: 1, top: 2 }, { left: 1, top: 1 }, false],
    [{ left: 1, top: 2 }, { left: 2, top: 2 }, false],
    [{ left: 1 }, undefined, false],
    [{ left: 0 }, { top: 1 }, false],
    [{}, {}, true],
    [undefined, { left: 1 }, false],
    [undefined, {}, false],
    [undefined, undefined, false],
  ]

  pairs.forEach(pair => {
    const value1 = JSON.stringify(pair[0])
    const value2 = JSON.stringify(pair[1])
    it(`${value1} should ${pair[2] ? '' : 'not '}equal ${value2}`, () => {
      const result = isObjectEqual(pair[0], pair[1]);
      expect(result).toBe(pair[2])
    })
  })
})