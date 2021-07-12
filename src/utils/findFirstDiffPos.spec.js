import findFirstDiffPos from './findFirstDiffPos'

describe('#findFirstDiffPos', () => {
  it('should return -1 if the strings are equal', () => {
    const result = findFirstDiffPos('Hello world', 'Hello world')
    expect(result).toBe(-1)
  })

  const mapping = [
    {
      a: 'Hello world',
      b: 'Hell0 world',
      expected: 4,
    },
    {
      a: 'Hello world',
      b: 'He world',
      expected: 2,
    },
    {
      a: 'Hell0 world',
      b: 'Hello word',
      expected: 4,
    },
  ]

  it('should return the correct position if the strings differs', () => {
    mapping.forEach(({ a, b, expected }) => {
      const result = findFirstDiffPos(a, b)
      expect(result).toBe(expected)
    })
  })
})
