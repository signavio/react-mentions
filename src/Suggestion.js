import React from 'react'
import PropTypes from 'prop-types'
import { defaultStyle } from './utils'
import { getSubstringIndex } from './utils'

function Suggestion({
  id,
  focused,
  ignoreAccents,
  index,
  onClick,
  onMouseEnter,
  query,
  renderSuggestion,
  suggestion,
  style,
  className,
  classNames,
}) {
  const rest = { onClick, onMouseEnter }

  const renderContent = () => {
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
      id={id}
      role="option"
      aria-selected={focused}
      aria-disabled={Boolean(
        typeof suggestion === 'string' ? false : suggestion.disabled
      )}
      {...rest}
      {...style}
    >
      {renderContent()}
    </li>
  )
}

Suggestion.propTypes = {
  id: PropTypes.string.isRequired,
  query: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  ignoreAccents: PropTypes.bool,

  suggestion: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      display: PropTypes.string,
    }),
  ]).isRequired,
  renderSuggestion: PropTypes.func,

  focused: PropTypes.bool,
}

const styled = defaultStyle(
  {
    cursor: 'pointer',
  },
  (props) => ({
    '&focused': props.focused,
    '&disabled': Boolean(
      typeof props.suggestion === 'string' ? false : props.suggestion.disabled
    ),
  })
)

export default styled(Suggestion)
