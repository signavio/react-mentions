import getSuggestionHtmlId from './getSuggestionHtmlId'

describe('#getSuggestionHtmlId', () => {
  it('Should build a string from provided prefix and id', () => {
    expect(
      getSuggestionHtmlId('listid1', 'itemid1')
    ).toEqual('listid1-itemid1')
    expect(getSuggestionHtmlId('listid2', 'itemid2')).toEqual('listid2-itemid2')
  })
})
