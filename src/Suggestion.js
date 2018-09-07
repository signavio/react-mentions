import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { defaultStyle } from 'substyle'
import omit from 'lodash/omit'
import keys from 'lodash/keys'

class Suggestion extends Component {
  static propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    query: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,

    suggestion: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        display: PropTypes.string,
      }),
    ]).isRequired,
    descriptor: PropTypes.object.isRequired,

    focused: PropTypes.bool,
  }

  render() {
    let rest = omit(this.props, 'style', keys(Suggestion.propTypes))

    return (
      <li {...rest} {...this.props.style}>
        {this.renderContent()}
      </li>
    )
  }

  renderContent() {
    let { query, descriptor, suggestion, index, focused } = this.props

    let display = this.getDisplay()
    let highlightedDisplay = this.renderHighlightedDisplay(display, query)

    if (descriptor.props.renderSuggestion) {
      return descriptor.props.renderSuggestion(
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

    if (suggestion instanceof String) {
      return suggestion
    }

    let { id, display } = suggestion

    if (!id || !display) {
      return id
    }

    return display
  }

  renderHighlightedDisplay(display) {
    const { query, style } = this.props

    let i = display.toLowerCase().indexOf(query.toLowerCase())

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
  props => ({ '&focused': props.focused })
)

export default styled(Suggestion)
