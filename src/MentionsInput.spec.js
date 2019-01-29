import expect, { createSpy } from 'expect'
import React from 'react'
import { mount } from 'enzyme'

import { MentionsInput, Mention } from './index'
import { _getTriggerRegex } from './MentionsInput'

const data = [
  { id: 'first', value: 'First entry' },
  { id: 'second', value: 'Second entry' },
]

describe('MentionsInput', () => {
  let wrapper, host

  beforeEach(() => {
    // I don't know where enzmye mounts this, but apparently it is somewhere
    // where our input cannot have a `scollHeight`/`offsetHeight`. Therefore, some tests would fail.
    // By manually creating a wrapper in the DOM, we can work around that
    host = document.createElement('div')
    document.body.appendChild(host)

    wrapper = mount(
      <MentionsInput value="">
        <Mention trigger="@" data={data} />
      </MentionsInput>,
      {
        attachTo: host,
      }
    )
  })

  it('should render a textarea by default.', () => {
    expect(wrapper.find('textarea').length).toEqual(1)
    expect(wrapper.find('input').length).toEqual(0)
  })

  it('should render a regular input when singleLine is set to true.', () => {
    wrapper.setProps({
      singleLine: true,
    })

    expect(wrapper.find('textarea').length).toEqual(0)
    expect(wrapper.find('input').length).toEqual(1)
  })

  it('should show a list of suggestions once the trigger key has been entered.')
  it(
    'should be possible to navigate through the suggestions with the up and down arrows.'
  )
  it('should be possible to select a suggestion with enter.')
  it('should be possible to close the suggestions with esc.')

  it('should be able to handle sync responses from multiple mentions sources', () => {
    const wrapper = mount(
      <MentionsInput value="@">
        <Mention trigger="@" type="testentries" data={data} />
        <Mention
          trigger="@"
          type="testchars"
          data={[{ id: 'a', value: 'A' }, { id: 'b', value: 'B' }]}
        />
      </MentionsInput>,
      {
        attachTo: host,
      }
    )

    wrapper.find('textarea').simulate('focus')
    wrapper.find('textarea').simulate('select', {
      target: { selectionStart: 1, selectionEnd: 1 },
    })

    expect(
      wrapper.find('SuggestionsOverlay').find('Suggestion').length
    ).toEqual(4)
  })

  it('should scroll the highlighter in sync with the textarea', () => {
    const wrapper = mount(
      <MentionsInput
        style={{
          input: {
            overflow: 'auto',
            height: 40,
          },
        }}
        className="mi"
        value={
          'multiple lines causing \n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n the textarea to scroll'
        }
      >
        <Mention trigger="@" type="testentries" data={data} />
      </MentionsInput>,
      {
        attachTo: host,
      }
    )
    wrapper.find('textarea').getDOMNode().scrollTop = 23
    wrapper.find('textarea').simulate('scroll', { deltaY: 23 })
    expect(wrapper.find('.mi__highlighter').getDOMNode().scrollTop).toBe(23)
  })

  it('should place suggestions in suggestionsPortalHost', () => {
    let portalNode
    const rootWrapper = mount(
      <div id="root">
        <div
          id="portalDiv"
          ref={el => {
            portalNode = el
          }}
        >
          <p>menu goes here</p>
        </div>
      </div>,
      {
        attachTo: host,
      }
    )
    const wrapper = mount(
      <MentionsInput
        className={'testClass'}
        value={'@'}
        suggestionsPortalHost={portalNode}
      >
        <Mention trigger="@" data={data} />
      </MentionsInput>,
      {
        attachTo: rootWrapper.find('#root').getDOMNode(),
      }
    )
    // focus & select to show suggestions
    wrapper.find('textarea').simulate('focus')
    wrapper.find('textarea').simulate('select', {
      target: { selectionStart: 1, selectionEnd: 1 },
    })

    let portalDiv = rootWrapper.find('#portalDiv').getDOMNode()
    const suggestionsNode = portalDiv.querySelector('.testClass__suggestions')
    expect(suggestionsNode).toBeTruthy()
  })

  it('should accept a custom regex attribute', () => {
    const data = [{ id: 'aaaa', display: '@A' }, { id: 'bbbb', display: '@B' }]
    const wrapper = mount(
      <MentionsInput
        value=":aaaa and :bbbb and :invalidId"
        markup=":__id__"
        regex={/:(\S+)/g}
        displayTransform={id => {
          let mention = data.find(item => item.id === id)
          return mention ? mention.display : `:${id}`
        }}
      >
        <Mention trigger="@" data={data} />
      </MentionsInput>,
      {
        attachTo: host,
      }
    )
    wrapper.find('textarea').simulate('focus')
    expect(wrapper.find('textarea').getDOMNode().value).toEqual(
      '@A and @B and :invalidId'
    )
  })

  it('should forward the `inputRef` prop to become the `ref` of the input', () => {
    const inputRef = React.createRef()
    const wrapper = mount(
      <MentionsInput value="test" inputRef={inputRef}>
        <Mention trigger="@" data={data} />
      </MentionsInput>,
      {
        attachTo: host,
      }
    )
    const el = wrapper.find('textarea').getDOMNode()
    expect(inputRef.current).toBeTruthy()
    expect(inputRef.current).toEqual(el)
  })

  it('should forward the `inputRef` prop to become the `ref` of the input (callback ref)', () => {
    const inputRef = createSpy()
    const wrapper = mount(
      <MentionsInput value="test" inputRef={inputRef}>
        <Mention trigger="@" data={data} />
      </MentionsInput>,
      {
        attachTo: host,
      }
    )
    const el = wrapper.find('textarea').getDOMNode()
    expect(inputRef).toHaveBeenCalledWith(el)
  })

  describe('_getTriggerRegex', () => {
    it('should return regular expressions', () => {
      const trigger = /abc/
      expect(_getTriggerRegex(trigger)).toEqual(trigger)
    })

    it('should escape and capture a string trigger', () => {
      const result = _getTriggerRegex('trigger').toString()
      expect(result).toEqual('/(?:^|\\s)(trigger([^\\strigger]*))$/')
    })

    it('should allow spaces in search', () => {
      const result = _getTriggerRegex('trigger', {
        allowSpaceInQuery: true,
      }).toString()
      expect(result).toEqual('/(?:^|\\s)(trigger([^trigger]*))$/')
    })
  })
})
