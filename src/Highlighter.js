import React, { Component, Children } from 'react'
import PropTypes from 'prop-types'
import { defaultStyle } from 'substyle'
import isEqual from 'lodash/isEqual'
import isNumber from 'lodash/isNumber'

import { iterateMentionsMarkup, mapPlainTextIndex } from './utils'
import Mention from './Mention'

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
    selection: PropTypes.shape({
      start: PropTypes.number,
      end: PropTypes.number,
    }).isRequired,

    markup: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,

    displayTransform: PropTypes.func.isRequired,
    onCaretPositionChange: PropTypes.func.isRequired,
    inputStyle: PropTypes.object,
  }

  static defaultProps = {
    value: '',
    inputStyle: {},
  }

  constructor() {
    super(...arguments)

    this.state = { lastPosition: {} }
  }

  componentDidMount() {
    this.notifyCaretPosition()
  }

  componentDidUpdate() {
    this.notifyCaretPosition()
  }

  notifyCaretPosition() {
    if (!this.caretRef) {
      return
    }

    let position = {
      left: this.caretRef.offsetLeft,
      top: this.caretRef.offsetTop,
    }

    let { lastPosition } = this.state

    if (isEqual(lastPosition, position)) {
      return
    }

    this.setState({
      lastPosition: position,
    })

    this.props.onCaretPositionChange(position)
  }

  render() {
    let {
      selection,
      value,
      markup,
      displayTransform,
      style,
      inputStyle,
      regex,
    } = this.props

    // If there's a caret (i.e. no range selection), map the caret position into the marked up value
    let caretPositionInMarkup
    if (selection.start === selection.end) {
      caretPositionInMarkup = mapPlainTextIndex(
        value,
        markup,
        selection.start,
        'START',
        displayTransform,
        regex
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
      type,
      lastMentionEndIndex
    ) => {
      // generate a component key based on the id
      const key = _generateComponentKey(componentKeys, id)
      components.push(this.getMentionComponentForMatch(id, display, type, key))
    }

    iterateMentionsMarkup(
      value,
      markup,
      textIteratee,
      mentionIteratee,
      displayTransform,
      regex
    )

    // append a span containing a space, to ensure the last text line has the correct height
    components.push(' ')

    if (components !== resultComponents) {
      // if a caret component is to be rendered, add all components that followed as its children
      resultComponents.push(this.renderHighlighterCaret(components))
    }

    return (
      <div
        {...style}
        style={{
          ...inputStyle,
          ...style.style,
        }}
      >
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
  getMentionComponentForMatch(id, display, type, key) {
    const childrenCount = Children.count(this.props.children)
    const props = { id, display, key }

    if (childrenCount > 1) {
      if (!type) {
        throw new Error(
          'Since multiple Mention components have been passed as children, the markup has to define the __type__ placeholder'
        )
      }

      // detect the Mention child to be cloned
      let foundChild = null
      Children.forEach(this.props.children, child => {
        if (!child) {
          return
        }

        if (child.props.type === type) {
          foundChild = child
        }
      })

      // clone the Mention child that is applicable for the given type
      return React.cloneElement(foundChild, props)
    }

    if (childrenCount === 1) {
      // clone single Mention child
      const child = this.props.children.length
        ? this.props.children[0]
        : Children.only(this.props.children)
      return React.cloneElement(child, props)
    }
    // no children, use default configuration
    return Mention(props)
  }

  // Renders an component to be inserted in the highlighter at the current caret position
  renderHighlighterCaret(children) {
    return (
      <span
        {...this.props.style('caret')}
        ref={el => {
          this.caretRef = el
        }}
        key="caret"
      >
        {children}
      </span>
    )
  }
}

const styled = defaultStyle(
  {
    position: 'relative',
    width: 'inherit',
    color: 'transparent',

    overflow: 'hidden',

    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',

    '&singleLine': {
      whiteSpace: 'pre',
      wordWrap: null,
    },

    substring: {
      visibility: 'hidden',
    },
  },
  props => ({
    '&singleLine': props.singleLine,
  })
)

export default styled(Highlighter)
