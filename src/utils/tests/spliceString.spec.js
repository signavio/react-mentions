import spliceString from '../spliceString'

describe('#spliceString', () => {
  it('should replace the substring between start and end with the provided insertion', () => {
    expect(spliceString('012345678', 1, 4, 'xx')).toEqual('0xx45678')
  })
})
