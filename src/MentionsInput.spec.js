import { Mention, MentionsInput } from './index'

import React from 'react'
import { makeTriggerRegex } from './MentionsInput'
import { mount } from 'enzyme'

const data = [
  { id: 'first', value: 'First entry' },
  { id: 'second', value: 'Second entry' },
  { id: 'third', value: 'Third' },
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
      </MentionsInput>
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

  it.todo(
    'should show a list of suggestions once the trigger key has been entered.'
  )
  it.todo(
    'should be possible to navigate through the suggestions with the up and down arrows.'
  )
  it.todo('should be possible to select a suggestion with enter.')
  it.todo('should be possible to close the suggestions with esc.')

  it('should be able to handle sync responses from multiple mentions sources', () => {
    const extraData = [
      { id: 'a', value: 'A' },
      { id: 'b', value: 'B' },
    ]

    const wrapper = mount(
      <MentionsInput value="@">
        <Mention trigger="@" data={data} />
        <Mention trigger="@" data={extraData} />
      </MentionsInput>
    )

    wrapper.find('textarea').simulate('focus')
    wrapper.find('textarea').simulate('select', {
      target: { selectionStart: 1, selectionEnd: 1 },
    })
    wrapper
      .find('textarea')
      .getDOMNode()
      .setSelectionRange(1, 1)

    expect(
      wrapper.find('SuggestionsOverlay').find('Suggestion').length
    ).toEqual(data.length + extraData.length)
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
        <Mention trigger="@" data={data} />
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
      </div>
    )
    const wrapper = mount(
      <MentionsInput
        className={'testClass'}
        value={'@'}
        suggestionsPortalHost={portalNode}
      >
        <Mention trigger="@" data={data} />
      </MentionsInput>
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
    const data = [
      { id: 'aaaa', display: '@A' },
      { id: 'bbbb', display: '@B' },
    ]
    const wrapper = mount(
      <MentionsInput value=":aaaa and :bbbb and :invalidId">
        <Mention
          trigger="@"
          data={data}
          markup=":__id__"
          regex={/:(\S+)/}
          displayTransform={id => {
            let mention = data.find(item => item.id === id)
            return mention ? mention.display : `:${id}`
          }}
        />
      </MentionsInput>
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
      </MentionsInput>
    )
    const el = wrapper.find('textarea').getDOMNode()
    expect(inputRef.current).toBeTruthy()
    expect(inputRef.current).toEqual(el)
  })

  it('should forward the `inputRef` prop to become the `ref` of the input (callback ref)', () => {
    const inputRef = jest.fn()
    const wrapper = mount(
      <MentionsInput value="test" inputRef={inputRef}>
        <Mention trigger="@" data={data} />
      </MentionsInput>
    )
    const el = wrapper.find('textarea').getDOMNode()
    expect(inputRef).toHaveBeenCalledWith(el)
  })

  it('should render a custom input when supplied.', () => {
    const CustomInput = React.forwardRef((props, ref) => {
      return <input id="testInput" ref={ref} {...props} />
    })
    const wrapper = mount(
      <MentionsInput value="test" inputComponent={CustomInput}>
        <Mention trigger="@" data={data} />
      </MentionsInput>
    )

    expect(wrapper.find('textarea').length).toEqual(0)
    expect(wrapper.find('input').length).toEqual(1)
    expect(wrapper.find('input#testInput').length).toEqual(1)
  })

  describe('makeTriggerRegex', () => {
    it('should return regular expressions', () => {
      const trigger = /abc/
      expect(makeTriggerRegex(trigger)).toEqual(trigger)
    })

    it('should escape and capture a string trigger', () => {
      const result = makeTriggerRegex('trigger').toString()
      expect(result).toEqual('/(?:^|\\s)(trigger([^\\strigger]*))$/')
    })

    it('should allow spaces in search', () => {
      const result = makeTriggerRegex('trigger', {
        allowSpaceInQuery: true,
      }).toString()
      expect(result).toEqual('/(?:^|\\s)(trigger([^trigger]*))$/')
    })
  })

  describe('custom cut/copy/paste', () => {
    let component

    const plainTextValue = "Hi First, \n\nlet's add Second to the conversation."
    const value =
      "Hi @[First](first), \n\nlet's add @[Second](second) to the conversation."

    beforeEach(() => {
      component = mount(
        <MentionsInput value={value}>
          <Mention trigger="@[__display__](__id__)" data={data} />
        </MentionsInput>,
        {
          attachTo: host,
        }
      )
    })

    it.each(['cut', 'copy'])(
      'should include the whole mention for a "%s" event when the selection starts in one.',
      eventType => {
        const textarea = component.find('textarea')

        const selectionStart = plainTextValue.indexOf('First') + 2
        const selectionEnd = plainTextValue.length

        textarea.simulate('select', {
          target: { selectionStart, selectionEnd },
        })
        textarea.getDOMNode().setSelectionRange(selectionStart, selectionEnd)

        const setData = jest.fn()

        const event = new Event(eventType, { bubbles: true })
        event.clipboardData = { setData }

        textarea.getDOMNode().dispatchEvent(event)

        expect(setData).toHaveBeenCalledTimes(2)

        expect(setData).toHaveBeenNthCalledWith(
          1,
          'text/plain',
          plainTextValue.slice(selectionStart, selectionEnd)
        )
        expect(setData).toHaveBeenNthCalledWith(
          2,
          'text/react-mentions',
          "@[First](first), \n\nlet's add @[Second](second) to the conversation."
        )
      }
    )

    it.each(['cut', 'copy'])(
      'should include the whole mention for a "%s" event when the selection ends in one.',
      eventType => {
        const textarea = component.find('textarea')

        const selectionStart = 0
        const selectionEnd = plainTextValue.indexOf('Second') + 2

        textarea.simulate('select', {
          target: { selectionStart, selectionEnd },
        })
        textarea.getDOMNode().setSelectionRange(selectionStart, selectionEnd)

        const setData = jest.fn()

        const event = new Event(eventType, { bubbles: true })
        event.clipboardData = { setData }

        textarea.getDOMNode().dispatchEvent(event)

        expect(setData).toHaveBeenCalledTimes(2)

        expect(setData).toHaveBeenNthCalledWith(
          1,
          'text/plain',
          plainTextValue.slice(selectionStart, selectionEnd)
        )
        expect(setData).toHaveBeenNthCalledWith(
          2,
          'text/react-mentions',
          "Hi @[First](first), \n\nlet's add @[Second](second)"
        )
      }
    )

    it.each(['cut', 'copy'])(
      'should fallback to the browsers behavior if the "%s" event does not support clipboardData',
      eventType => {
        // IE 11 has no clipboardData attached to the event and only supports mime type "text"
        // therefore, the new mechanism should ignore those events and let the browser handle them
        const textarea = component.find('textarea')

        const selectionStart = plainTextValue.indexOf('First') + 2
        const selectionEnd = plainTextValue.length

        textarea.simulate('select', {
          target: { selectionStart, selectionEnd },
        })
        textarea.getDOMNode().setSelectionRange(selectionStart, selectionEnd)

        const preventDefault = jest.fn()
        const event = new Event(eventType, { bubbles: true })
        event.preventDefault = preventDefault

        textarea.getDOMNode().dispatchEvent(event)

        expect(preventDefault).not.toHaveBeenCalled()
      }
    )

    it('should remove a leading mention from the value when the text is cut.', () => {
      const onChange = jest.fn()

      component.setProps({ onChange })

      const textarea = component.find('textarea')

      const selectionStart = plainTextValue.indexOf('First') + 2
      const selectionEnd = plainTextValue.indexOf('First') + 'First'.length + 5

      textarea.simulate('select', {
        target: { selectionStart, selectionEnd },
      })
      textarea.getDOMNode().setSelectionRange(selectionStart, selectionEnd)

      const event = new Event('cut', { bubbles: true })
      event.clipboardData = { setData: jest.fn() }

      expect(onChange).not.toHaveBeenCalled()

      textarea.getDOMNode().dispatchEvent(event)

      expect(onChange).toHaveBeenCalledTimes(1)

      const [[, newValue, newPlainTextValue]] = onChange.mock.calls

      expect(newValue).toMatchSnapshot()
      expect(newPlainTextValue).toMatchSnapshot()
    })

    it('should remove a trailing mention from the value when the text is cut.', () => {
      const onChange = jest.fn()

      component.setProps({ onChange })

      const textarea = component.find('textarea')

      const selectionStart = plainTextValue.indexOf('First') + 'First'.length
      const selectionEnd = plainTextValue.indexOf('Second') + 2

      textarea.simulate('select', {
        target: { selectionStart, selectionEnd },
      })
      textarea.getDOMNode().setSelectionRange(selectionStart, selectionEnd)

      const event = new Event('cut', { bubbles: true })
      event.clipboardData = { setData: jest.fn() }

      expect(onChange).not.toHaveBeenCalled()

      textarea.getDOMNode().dispatchEvent(event)

      expect(onChange).toHaveBeenCalledTimes(1)

      const [[, newValue, newPlainTextValue]] = onChange.mock.calls

      expect(newValue).toMatchSnapshot()
      expect(newPlainTextValue).toMatchSnapshot()
    })

    it('should read mentions markup from a paste event.', () => {
      const onChange = jest.fn()

      component.setProps({ onChange })

      const textarea = component.find('textarea')

      const pastedText = 'Not forget about @[Third](third)!'

      const event = new Event('paste', { bubbles: true })
      event.clipboardData = {
        getData: jest.fn(type =>
          type === 'text/react-mentions' ? pastedText : ''
        ),
      }

      expect(onChange).not.toHaveBeenCalled()

      textarea.getDOMNode().dispatchEvent(event)

      expect(onChange).toHaveBeenCalledTimes(1)

      const [[, newValue, newPlainTextValue]] = onChange.mock.calls

      expect(newValue).toMatchSnapshot()
      expect(newPlainTextValue).toMatchSnapshot()
    })

    it('should default to the standard pasted text.', () => {
      const onChange = jest.fn()

      component.setProps({ onChange })

      const textarea = component.find('textarea')

      const pastedText = 'Not forget about @[Third](third)!'

      const event = new Event('paste', { bubbles: true })
      event.clipboardData = {
        getData: jest.fn(type => (type === 'text/plain' ? pastedText : '')),
      }

      expect(onChange).not.toHaveBeenCalled()

      textarea.getDOMNode().dispatchEvent(event)

      expect(onChange).toHaveBeenCalledTimes(1)

      const [[, newValue, newPlainTextValue]] = onChange.mock.calls

      expect(newValue).toMatchSnapshot()
      expect(newPlainTextValue).toMatchSnapshot()
    })

    it('should remove carriage returns from pasted values', () => {
      const pastedText =
        "Hi First, \r\n\r\nlet's add Second to the conversation."

      const event = new Event('paste', { bubbles: true })

      event.clipboardData = {
        getData: jest.fn(type => (type === 'text/plain' ? pastedText : '')),
      }

      const onChange = jest.fn()

      component.setProps({ onChange, value: '' })

      expect(onChange).not.toHaveBeenCalled()

      const textarea = component.find('textarea')

      textarea.getDOMNode().dispatchEvent(event)

      const [[, newValue, newPlainTextValue]] = onChange.mock.calls

      expect(newValue).toEqual(
        "Hi First, \n\nlet's add Second to the conversation."
      )

      expect(newPlainTextValue).toEqual(
        "Hi First, \n\nlet's add Second to the conversation."
      )
    })

    it('should fallback to the browsers behaviour if the "paste" event does not support clipboardData', () => {
      // IE 11 has no clipboardData attached to the event and only supports mime type "text"
      // therefore, the new mechanism should ignore those events and let the browser handle them
      const textarea = component.find('textarea')

      const selectionStart = plainTextValue.indexOf('First') + 2
      const selectionEnd = plainTextValue.length

      textarea.simulate('select', {
        target: { selectionStart, selectionEnd },
      })
      textarea.getDOMNode().setSelectionRange(selectionStart, selectionEnd)

      const preventDefault = jest.fn()
      const event = new Event('paste', { bubbles: true })
      event.preventDefault = preventDefault

      textarea.getDOMNode().dispatchEvent(event)

      expect(preventDefault).not.toHaveBeenCalled()
    })
  })

  it('should not track mentions if `trackMentions` is false', () => {
    const data = [{ id: 'first', display: 'First Entry' }]
    const onChange = jest.fn()

    const wrapper = mount(
      <MentionsInput onChange={onChange} trackMentions={false} value="@">
        <Mention trigger="@" data={data} />
      </MentionsInput>
    )

    expect(onChange).not.toHaveBeenCalled()

    wrapper.find('textarea').simulate('focus')
    wrapper.find('textarea').simulate('select', {
      target: { selectionStart: 1, selectionEnd: 1 },
    })
    wrapper
      .find('textarea')
      .getDOMNode()
      .setSelectionRange(1, 1)

    expect(
      wrapper.find('SuggestionsOverlay').find('Suggestion').length
    ).toEqual(data.length)
    wrapper
      .find('SuggestionsOverlay')
      .find('Suggestion')
      .at(0)
      .simulate('click')
    const [[, newValue, newPlainTextValue]] = onChange.mock.calls
    expect(newValue).toEqual('First Entry')
    expect(newPlainTextValue).toEqual('First Entry')
  })
})
