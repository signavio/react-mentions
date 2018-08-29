import React, { Component } from "react";
import PropTypes from "prop-types";
import { defaultStyle } from "substyle";

import { countSuggestions, getSuggestions } from "./utils";
import Suggestion from "./Suggestion";
import LoadingIndicator from "./LoadingIndicator";

class SuggestionsOverlay extends Component {
  static propTypes = {
    suggestions: PropTypes.object.isRequired,
    focusIndex: PropTypes.number,
    scrollFocusedIntoView: PropTypes.bool,
    isLoading: PropTypes.bool,
    onSelect: PropTypes.func
  };

  static defaultProps = {
    suggestions: {},
    onSelect: () => null
  };

  componentDidUpdate() {
    if (
      !this.suggestionsRef ||
      this.suggestionsRef.offsetHeight >= this.suggestionsRef.scrollHeight ||
      !this.props.scrollFocusedIntoView
    ) {
      return;
    }

    const scrollTop = this.suggestionsRef.scrollTop;
    let { top, bottom } = this.suggestionsRef.children[
      this.props.focusIndex
    ].getBoundingClientRect();
    const { top: topContainer } = this.suggestionsRef.getBoundingClientRect();
    top = top - topContainer + scrollTop;
    bottom = bottom - topContainer + scrollTop;

    if (top < scrollTop) {
      this.suggestionsRef.scrollTop = top;
    } else if (bottom > this.suggestionsRef.offsetHeight) {
      this.suggestionsRef.scrollTop = bottom - this.suggestionsRef.offsetHeight;
    }
  }

  render() {
    const { suggestions, isLoading, style, onMouseDown } = this.props;

    // do not show suggestions until there is some data
    if (countSuggestions(suggestions) === 0 && !isLoading) {
      return null;
    }

    return (
      <div {...style} onMouseDown={onMouseDown}>
        <ul
          ref={el => {
            this.suggestionsRef = el;
          }}
          {...style("list")}
        >
          {this.renderSuggestions()}
        </ul>

        {this.renderLoadingIndicator()}
      </div>
    );
  }

  renderSuggestions() {
    return getSuggestions(this.props.suggestions).reduce(
      (result, { suggestions, descriptor }) => [
        ...result,

        ...suggestions.map((suggestion, index) =>
          this.renderSuggestion(suggestion, descriptor, result.length + index)
        )
      ],
      []
    );
  }

  renderSuggestion(suggestion, descriptor, index) {
    let id = this.getID(suggestion);
    let isFocused = index === this.props.focusIndex;

    let { mentionDescriptor, query } = descriptor;

    const type = mentionDescriptor.props.type;

    return (
      <Suggestion
        style={this.props.style("item")}
        key={`${type}-${id}`}
        id={id}
        query={query}
        index={index}
        descriptor={mentionDescriptor}
        suggestion={suggestion}
        focused={isFocused}
        onClick={() => this.select(suggestion, descriptor)}
        onMouseEnter={() => this.handleMouseEnter(index)}
      />
    );
  }

  getID(suggestion) {
    if (suggestion instanceof String) {
      return suggestion;
    }

    return suggestion.id;
  }

  renderLoadingIndicator() {
    if (!this.props.isLoading) {
      return;
    }

    return <LoadingIndicator {...this.props.style("loadingIndicator")} />;
  }

  handleMouseEnter(index, ev) {
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(index);
    }
  }

  select(suggestion, descriptor) {
    this.props.onSelect(suggestion, descriptor);
  }
}

const styled = defaultStyle(({ position }) => ({
  position: "absolute",
  zIndex: 1,
  backgroundColor: "white",
  marginTop: 14,
  minWidth: 100,
  ...position,

  list: {
    margin: 0,
    padding: 0,
    listStyleType: "none"
  }
}));

export default styled(SuggestionsOverlay);
