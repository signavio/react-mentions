import React, { Children, useState, useEffect } from 'react'
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

function Highlighter({
  selectionStart,
  selectionEnd,
  value = '',
  onCaretPositionChange,
  containerRef,
  children,
  singleLine,
  style,
}) {
  const [position, setPosition] = useState({ left: undefined, top: undefined })
  const [caretElement, setCaretElement] = useState()

  useEffect(() => {
    notifyCaretPosition()
  }, [caretElement])

  const notifyCaretPosition = () => {
    if (!caretElement) {
      return
    }

    const { offsetLeft, offsetTop } = caretElement

    if (position.left === offsetLeft && position.top === offsetTop) {
      return
    }

    const newPosition = { left: offsetLeft, top: offsetTop }
    setPosition(newPosition)

    onCaretPositionChange(newPosition)
  }

  const config = readConfigFromChildren(children)
  let caretPositionInMarkup

  if (selectionEnd === selectionStart) {
    caretPositionInMarkup = mapPlainTextIndex(
      value,
      config,
      selectionStart,
      'START'
    )
  }

  const resultComponents = []
  const componentKeys = {}
  let components = resultComponents
  let substringComponentKey = 0

  const textIteratee = (substr, index, indexInPlainText) => {
    if (
      isNumber(caretPositionInMarkup) &&
      caretPositionInMarkup >= index &&
      caretPositionInMarkup <= index + substr.length
    ) {
      const splitIndex = caretPositionInMarkup - index
      components.push(
        renderSubstring(substr.substring(0, splitIndex), substringComponentKey)
      )

      components = [
        renderSubstring(substr.substring(splitIndex), substringComponentKey),
      ]
    } else {
      components.push(renderSubstring(substr, substringComponentKey))
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
    const key = _generateComponentKey(componentKeys, id)
    components.push(
      getMentionComponentForMatch(id, display, mentionChildIndex, key)
    )
  }

  const renderSubstring = (string, key) => {
    return (
      <span {...style('substring')} key={key}>
        {string}
      </span>
    )
  }

  const getMentionComponentForMatch = (id, display, mentionChildIndex, key) => {
    const props = { id, display, key }
    const child = Children.toArray(children)[mentionChildIndex]
    return React.cloneElement(child, props)
  }

  const renderHighlighterCaret = (children) => {
    return (
      <span {...style('caret')} ref={setCaretElement} key="caret">
        {children}
      </span>
    )
  }

  iterateMentionsMarkup(value, config, mentionIteratee, textIteratee)
  components.push(' ')

  if (components !== resultComponents) {
    resultComponents.push(renderHighlighterCaret(components))
  }

  return (
    <div {...style} ref={containerRef}>
      {resultComponents}
    </div>
  )
}

Highlighter.propTypes = {
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
