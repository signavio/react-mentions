import expect from 'expect'
import combineRegExps from './combineRegExps'

describe('combineRegExps', () => {
  it('should concatenate all regexps using | and wrap each one in a capturing group', () => {
    const result = combineRegExps([/a/, /b/])
    expect(result.toString()).toEqual('/(a)|(b)/g')
  })
})
