import React, { Component, Children } from 'react'
import PropTypes from 'prop-types'
import { inline } from 'substyle'
import { defaultStyle } from './utils'

import { getSuggestionHtmlId } from './utils'
import Suggestion from './Suggestion'
import LoadingIndicator from './LoadingIndicator'

class SuggestionsOverlay extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    suggestions: PropTypes.object.isRequired,
    a11ySuggestionsListLabel: PropTypes.string,
    focusIndex: PropTypes.number,
    position: PropTypes.string,
    left: PropTypes.number,
    right: PropTypes.number,
    top: PropTypes.number,
    scrollFocusedIntoView: PropTypes.bool,
    isLoading: PropTypes.bool,
    isOpened: PropTypes.bool.isRequired,
    onSelect: PropTypes.func,
    ignoreAccents: PropTypes.bool,
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
    suggestions: {},
    onSelect: () => null,
  }

  componentDidUpdate() {
    if (
      !this.ulElement ||
      this.ulElement.offsetHeight >= this.ulElement.scrollHeight ||
      !this.props.scrollFocusedIntoView
    ) {
      return
    }

    const scrollTop = this.ulElement.scrollTop
    let { top, bottom } = this.ulElement.children[
      this.props.focusIndex
    ].getBoundingClientRect()
    const { top: topContainer } = this.ulElement.getBoundingClientRect()
    top = top - topContainer + scrollTop
    bottom = bottom - topContainer + scrollTop

    if (top < scrollTop) {
      this.ulElement.scrollTop = top
    } else if (bottom > this.ulElement.offsetHeight) {
      this.ulElement.scrollTop = bottom - this.ulElement.offsetHeight
    }
  }

  render() {
    const {
      id,
      a11ySuggestionsListLabel,
      isOpened,
      style,
      onMouseDown,
      containerRef,
      position,
      left,
      right,
      top,
    } = this.props

    // do not show suggestions until there is some data
    if (!isOpened) {
      return null
    }

    return (
      <div
        {...inline(
          { position: position || 'absolute', left, right, top },
          style
        )}
        onMouseDown={onMouseDown}
        ref={containerRef}
      >
        
        <ul
          ref={this.setUlElement}
          id={id}
          role="listbox"
          aria-label={a11ySuggestionsListLabel}
          {...style('list')}
        >
        {this.renderSuggestions()}
        </ul>
        {this.renderLoadingIndicator()}
      </div>
    )
  }

  renderSuggestions() {
    const {customSuggestionsContainer} = this.props;
    const suggestions = Object.values(this.props.suggestions).reduce(
      (accResults, { results, queryInfo }) => [
        ...accResults,
        ...results.map((result, index) =>
          this.renderSuggestion(result, queryInfo, accResults.length + index)
        ),
      ],
      []
    );

    if(customSuggestionsContainer)
      return customSuggestionsContainer(suggestions);
    else
      return suggestions;
  }

  renderSuggestion(result, queryInfo, index) {
    const isFocused = index === this.props.focusIndex
    const { childIndex, query } = queryInfo
    const { renderSuggestion } = Children.toArray(this.props.children)[
      childIndex
    ].props
    const { ignoreAccents } = this.props

    return (
      <Suggestion
        style={this.props.style('item')}
        key={`${childIndex}-${getID(result)}`}
        id={getSuggestionHtmlId(this.props.id, index)}
        query={query}
        index={index}
        ignoreAccents={ignoreAccents}
        renderSuggestion={renderSuggestion}
        suggestion={result}
        focused={isFocused}
        onClick={() => this.select(result, queryInfo)}
        onMouseEnter={() => this.handleMouseEnter(index)}
      />
    )
  }

  renderLoadingIndicator() {
    if (!this.props.isLoading) {
      return
    }

    return <LoadingIndicator style={this.props.style('loadingIndicator')} />
  }

  handleMouseEnter = (index, ev) => {
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(index)
    }
  }

  select = (suggestion, queryInfo) => {
    this.props.onSelect(suggestion, queryInfo)
  }

  setUlElement = (el) => {
    this.ulElement = el
  }
}

const getID = (suggestion) => {
  if (typeof suggestion === 'string') {
    return suggestion
  }

  return suggestion.id
}

const styled = defaultStyle({
  zIndex: 1,
  backgroundColor: 'white',
  marginTop: 14,
  minWidth: 100,

  list: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
})

export default styled(SuggestionsOverlay)
