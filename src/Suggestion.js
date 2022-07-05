import React from 'react'
import { defaultStyle } from './utils'

import { getSubstringIndex, keys, omit } from './utils'

function Suggestion(props) {
  const rest = omit(
    props,
    ['style', 'classNames', 'className'], // substyle props
    keys(Suggestion.propTypes)
  )

  const renderContent = () => {
    let { query, renderSuggestion, suggestion, index, focused } = props

    let display = getDisplay()
    let highlightedDisplay = renderHighlightedDisplay(display, query)

    if (renderSuggestion) {
      return renderSuggestion(
        suggestion,
        query,
        highlightedDisplay,
        index,
        focused
      )
    }

    return highlightedDisplay
  }

  const getDisplay = () => {
    let { suggestion } = props

    if (typeof suggestion === 'string') {
      return suggestion
    }

    let { id, display } = suggestion

    if (id === undefined || !display) {
      return id
    }

    return display
  }

  const renderHighlightedDisplay = (display) => {
    const { ignoreAccents, query, style } = props

    let i = getSubstringIndex(display, query, ignoreAccents)

    if (i === -1) {
      return <span {...style('display')}>{display}</span>
    }

    return (
      <span {...style('display')}>
        {display.substring(0, i)}
        <b {...style('highlight')}>{display.substring(i, i + query.length)}</b>
        {display.substring(i + query.length)}
      </span>
    )
  }

  return (
    <li
      id={props.id}
      role="option"
      aria-selected={props.focused}
      {...rest}
      {...props.style}
    >
      {renderContent()}
    </li>
  )
}

const styled = defaultStyle(
  {
    cursor: 'pointer',
  },
  (props) => ({ '&focused': props.focused })
)

export default styled(Suggestion)
