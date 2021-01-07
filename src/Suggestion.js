import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { defaultStyle } from './utils'

import { getSubstringIndex, keys, omit } from './utils'

class Suggestion extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    query: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    ignoreAccents: PropTypes.bool,

    suggestion: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        display: PropTypes.string,
      }),
    ]).isRequired,
    renderSuggestion: PropTypes.func,

    focused: PropTypes.bool,
  }

  render() {
    const rest = omit(
      this.props,
      ['style', 'classNames', 'className'], // substyle props
      keys(Suggestion.propTypes)
    )

    return (
      <li
        id={this.props.id}
        role="option"
        aria-selected={this.props.focused}
        {...rest}
        {...this.props.style}
      >
        {this.renderContent()}
      </li>
    )
  }

  renderContent() {
    let { query, renderSuggestion, suggestion, index, focused } = this.props

    let display = this.getDisplay()
    let highlightedDisplay = this.renderHighlightedDisplay(display, query)

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

  getDisplay() {
    let { suggestion } = this.props

    if (typeof suggestion === 'string') {
      return suggestion
    }

    let { id, display } = suggestion

    if (id === undefined || !display) {
      return id
    }

    return display
  }

  renderHighlightedDisplay(display) {
    const { ignoreAccents, query, style } = this.props

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
}

const styled = defaultStyle(
  {
    cursor: 'pointer',
  },
  (props) => ({ '&focused': props.focused })
)

export default styled(Suggestion)
