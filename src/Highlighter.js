import React, { Component, Children } from 'react'
import PropTypes from 'prop-types'
import { defaultStyle } from './utils'

import {
  iterateMentionsMarkup,
  mapPlainTextIndex,
  readConfigFromChildren,
  isNumber,
} from './utils'

const _generateComponentKey = (usedKeys, id) => {
  if (!usedKeys.hasOwnProperty(id)) {
    usedKeys[id] = 0
  } else {
    usedKeys[id]++
  }
  return id + '_' + usedKeys[id]
}

class Highlighter extends Component {
  static propTypes = {
    selectionStart: PropTypes.number,
    selectionEnd: PropTypes.number,
    value: PropTypes.string.isRequired,
    onCaretPositionChange: PropTypes.func.isRequired,
    containerRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({
        current:
          typeof Element === 'undefined'
            ? PropTypes.any
            : PropTypes.instanceOf(Element),
      }),
    ]),
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element),
    ]).isRequired,
  }

  static defaultProps = {
    value: '',
  }

  constructor() {
    super(...arguments)

    this.state = { left: undefined, top: undefined }
  }

  componentDidMount() {
    this.notifyCaretPosition()
  }

  componentDidUpdate() {
    this.notifyCaretPosition()
  }

  notifyCaretPosition() {
    if (!this.caretElement) {
      return
    }

    const { offsetLeft, offsetTop } = this.caretElement

    if (this.state.left === offsetLeft && this.state.top === offsetTop) {
      return
    }

    const newPosition = {
      left: offsetLeft,
      top: offsetTop,
    }
    this.setState(newPosition)

    this.props.onCaretPositionChange(newPosition)
  }

  renderLine({
    value,
    selectionStart,
    selectionEnd,
    config
  }) {
    // If there's a caret (i.e. no range selection), map the caret position into the marked up value
    let caretPositionInMarkup
    if (selectionStart === selectionEnd) {
      caretPositionInMarkup = mapPlainTextIndex(
        value,
        config,
        selectionStart,
        'START'
      )
    }

    const resultComponents = []
    const componentKeys = {}

    // start by appending directly to the resultComponents
    let components = resultComponents
    let substringComponentKey = 0

    const textIteratee = (substr, index, indexInPlainText) => {
      // check whether the caret element has to be inserted inside the current plain substring
      if (
        isNumber(caretPositionInMarkup) &&
        caretPositionInMarkup >= index &&
        caretPositionInMarkup <= index + substr.length
      ) {
        // if yes, split substr at the caret position and insert the caret component
        const splitIndex = caretPositionInMarkup - index
        components.push(
          this.renderSubstring(
            substr.substring(0, splitIndex),
            substringComponentKey
          )
        )

        // add all following substrings and mention components as children of the caret component
        components = [
          this.renderSubstring(
            substr.substring(splitIndex),
            substringComponentKey
          ),
        ]
      } else {
        // otherwise just push the plain text substring
        components.push(this.renderSubstring(substr, substringComponentKey))
      }

      substringComponentKey++
    }

    const mentionIteratee = (
      markup,
      index,
      indexInPlainText,
      id,
      display,
      mentionChildIndex,
      lastMentionEndIndex
    ) => {
      // generate a component key based on the id
      const key = _generateComponentKey(componentKeys, id)
      components.push(
        this.getMentionComponentForMatch(id, display, mentionChildIndex, key)
      )
    }

    iterateMentionsMarkup(value, config, mentionIteratee, textIteratee)

    // append a span containing a space, to ensure the last text line has the correct height
    components.push(' ')

    if (components !== resultComponents) {
      // if a caret component is to be rendered, add all components that followed as its children
      resultComponents.push(this.renderHighlighterCaret(components))
    }
    return resultComponents
  }

  render() {
    const {
      selectionStart,
      selectionEnd,
      value,
      style,
      children,
      containerRef,
      _unstableAutoDirection,
    } = this.props
    const config = readConfigFromChildren(children)

    let resultComponents
    // If auto direction is used and the value contains newlines, split be \n and iterate over each line separately
    if (_unstableAutoDirection && value.indexOf('\n') !== -1) {
      const lines = value.split('\n')
      resultComponents = lines.map((value, index) => (
        <div key={index} dir="auto">{this.renderLine({
          value,
          selectionStart,
          selectionEnd,
          config
        })}</div>
      ))
    } else {
      resultComponents =this.renderLine({
        value,
        selectionStart,
        selectionEnd,
        config
      })
    }

    return (
      <div {...style} ref={containerRef}>
        {resultComponents}
      </div>
    )
  }

  renderSubstring(string, key) {
    // set substring span to hidden, so that Emojis are not shown double in Mobile Safari
    return (
      <span {...this.props.style('substring')} key={key}>
        {string}
      </span>
    )
  }

  // Returns a clone of the Mention child applicable for the specified type to be rendered inside the highlighter
  getMentionComponentForMatch(id, display, mentionChildIndex, key) {
    const props = { id, display, key }
    const child = Children.toArray(this.props.children)[mentionChildIndex]
    return React.cloneElement(child, props)
  }

  // Renders an component to be inserted in the highlighter at the current caret position
  renderHighlighterCaret(children) {
    return (
      <span
        {...this.props.style('caret')}
        ref={this.setCaretElement}
        key="caret"
      >
        {children}
      </span>
    )
  }

  setCaretElement = (el) => {
    this.caretElement = el
  }
}

const styled = defaultStyle(
  {
    position: 'relative',
    boxSizing: 'border-box',
    width: '100%',
    color: 'transparent',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    border: '1px solid transparent',
    textAlign: 'start',

    '&singleLine': {
      whiteSpace: 'pre',
      wordWrap: null,
    },

    substring: {
      visibility: 'hidden',
    },
  },
  (props) => ({
    '&singleLine': props.singleLine,
  })
)

export default styled(Highlighter)
