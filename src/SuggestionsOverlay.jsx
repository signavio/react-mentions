import React, { Component } from 'react';
import substyle from 'substyle';

import utils from './utils';

import Suggestion from "./Suggestion";

export default class SuggestionsOverlay extends Component {

  static defaultProps = {
    suggestions: {},
    onSelect: () => null
  };

  constructor() {
    super(...arguments);

    this.state = {
      focusIndex: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    // always reset the focus on update
    this.setState({
      focusIndex: 0
    });
  }

  render() {
    // do not show suggestions until there is some data
    if(this.countSuggestions() === 0 && !this.props.isLoading) {
      return null;
    }

    let { className, style } = substyle(this.props);

    return (
      <div
        className={ className }
        style={{
          ...defaultStyle,
          ...style
        }}
        onMouseDown={this.props.onMouseDown}>

        <ul {...substyle(this.props, "list") }>
          { this.renderSuggestions() }
        </ul>

        { this.renderLoadingIndicator() }
      </div>
    );
  }

  getSuggestions() {
    var suggestions = [];

    for(var mentionType in this.props.suggestions) {
      if(!this.props.suggestions.hasOwnProperty(mentionType)) {
        return;
      }

      suggestions = suggestions.concat({
        suggestions: this.props.suggestions[mentionType].results,
        descriptor: this.props.suggestions[mentionType]
      });
    }

    return suggestions;
  }

  getSuggestion(index) {
    return this.getSuggestions().reduce((result, { suggestions, descriptor }) => [
      ...result,

      ...suggestions.map((suggestion) => ({
        suggestion: suggestion,
        descriptor: descriptor
      }))
    ], [])[index];
  }

  renderSuggestions() {
    return this.getSuggestions().reduce((result, { suggestions, descriptor }) => [
      ...result,

      ...suggestions.map((suggestion, index) => this.renderSuggestion(
        suggestion,
        descriptor,
        result.length + index
      ))
    ], []);
  }

  renderSuggestion(suggestion, descriptor, index) {
    let id = this.getID(suggestion);
    let isFocused = (index === this.state.focusIndex);

    let { mentionDescriptor, query } = descriptor;

    return (
      <Suggestion { ...substyle(this.props, "item") }
        key={ id }
        id={ id }
        ref={isFocused ? "focused" : null}
        query={ query }
        descriptor={ mentionDescriptor }
        suggestion={ suggestion }
        focussed={ isFocused }
        onClick={ () => this.select(suggestion, descriptor) }
        onMouseEnter={ () => this.handleMouseEnter(index) } />
    );
  }

  getID(suggestion) {
    if(suggestion instanceof String) {
      return suggestion;
    }

    return suggestion.id;
  }

  renderLoadingIndicator () {
    if(!this.props.isLoading) {
      return;
    }

    return (
      <div { ...substyle(this.props, "loading-indicator") }>
        <div { ...substyle(this.props, "spinner") }>
          <div { ...substyle(this.props, "element1") } />
          <div { ...substyle(this.props, "element2") } />
          <div { ...substyle(this.props, "element3") } />
          <div { ...substyle(this.props, "element4") } />
          <div { ...substyle(this.props, "element5") } />
        </div>
      </div>
    );
  }

  handleMouseEnter(index, ev) {
    this.setState({
      focusIndex: index
    });
  }

  select(suggestion, {mentionDescriptor, querySequenceStart, querySequenceEnd, plainTextValue}) {
    this.props.onSelect(suggestion, mentionDescriptor, querySequenceStart, querySequenceEnd, plainTextValue);
  }

  selectFocused() {
    var { suggestion, descriptor } = this.getSuggestion(this.state.focusIndex);

    this.select(suggestion, descriptor);
  }

  shiftFocus(delta) {
    var suggestionsCount = this.countSuggestions();

    this.setState({
      focusIndex: (suggestionsCount + this.state.focusIndex + delta) % suggestionsCount
    });
  }

  countSuggestions(props) {
    props = props || this.props;
    var result = 0;
    for(var prop in this.props.suggestions) {
      if(this.props.suggestions.hasOwnProperty(prop)) {
        result += this.props.suggestions[prop].results.length;
      }
    }
    return result;
  }

};

const defaultStyle = {
  position: "absolute",
  zIndex: 1,
};
