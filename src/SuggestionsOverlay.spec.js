import { Mention } from './index'
import SuggestionsOverlay from './SuggestionsOverlay'

import React from 'react'
import { mount } from 'enzyme'

const suggestions = {
  '0': {
    queryInfo: {
      childIndex: 0,
      query: 'en',
      querySequenceStart: 0,
      querySequenceEnd: 3,
      plainTextValue: '@en',
    },
    results: [
      {
        id: 'first',
        display: 'First entry',
      },
      {
        id: 'second',
        display: 'Second entry',
        disabled: true,
      },
    ],
  },
}

const data = [
  { id: 'first', value: 'First entry' },
  { id: 'second', value: 'Second entry', disabled: true },
  { id: 'third', value: 'Third' },
]

describe('SuggestionsOverlay', () => {
  let wrapper
  const onSelect = jest.fn()
  const onMouseEnter = jest.fn()

  beforeEach(() => {
    wrapper = mount(
      <SuggestionsOverlay
        id="foo"
        suggestions={suggestions}
        onSelect={onSelect}
        onMouseEnter={onMouseEnter}
        isOpened
      >
        <Mention trigger="@" data={data} />
      </SuggestionsOverlay>
    )
    jest.resetAllMocks()
  })

  it('should render a list of all passed suggestions.', () => {
    expect(wrapper.find('li').length).toEqual(2)
  })

  it('should be possible to style the list.', () => {
    wrapper.setProps({ style: { list: { color: 'red' } } })

    expect(wrapper.find('ul').props().style.color).toEqual('red')
  })

  it('should be possible to apply styles to the items in the list.', () => {
    wrapper.setProps({ style: { item: { color: 'green' } } })

    expect(
      wrapper
        .find('li')
        .first()
        .props().style.color
    ).toEqual('green')
  })

  it('should notify when the user clicks on a suggestion.', () => {
    wrapper
      .find('li')
      .first()
      .simulate('click')

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('should be possible to show a loading indicator.', () => {
    wrapper.setProps({ isLoading: true })

    expect(wrapper.find('div[aria-label="Loading indicator"]').length).toBe(1)
  })

  it('should be possible to style the loading indicator.', () => {
    wrapper.setProps({
      isLoading: true,
      style: { loadingIndicator: { color: 'purple' } },
    })

    expect(
      wrapper.find('div[aria-label="Loading indicator"]').props().style.color
    ).toBe('purple')
  })

  it('should notify when the user enters a suggestion with their mouse.', () => {
    wrapper
      .find('li')
      .first()
      .simulate('mouseenter')

    expect(onMouseEnter).toHaveBeenCalledTimes(1)
  })

  it('should prevent selecting a disabled suggestion.', () => {
    const results = wrapper.find('li')

    expect(results.last().props()['aria-disabled']).toBe(true)
    results.last().simulate('click')
    expect(onSelect).toHaveBeenCalledTimes(0)

    expect(results.first().props()['aria-disabled']).toBe(false)
    results.first().simulate('click')
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})
