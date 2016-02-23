import React, { Component } from 'react';
import substyle from 'substyle';

import utils from './utils';

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

    return (
      <div { ...substyle(this.props) }
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

    return (
      <li
        key={id}
        ref={isFocused ? "focused" : null}
        { ...substyle(substyle(this.props, 'item'), {
          "&focussed": isFocused
        }) }
        onClick={ () => this.select(suggestion, descriptor) }
        onMouseEnter={ () => this.handleMouseEnter(index) }>

        { this.renderContent(id, suggestion, descriptor) }
      </li>
    );
  }

  renderContent(id, suggestion, { mentionDescriptor, query }) {
    var display = this.getDisplay(suggestion);
    var highlightedDisplay = this.renderHighlightedDisplay(display, query);

    if(mentionDescriptor.props.renderSuggestion) {
      return mentionDescriptor.props.renderSuggestion(id, display, query, highlightedDisplay);
    }

    return highlightedDisplay;
  }

  getDisplay(suggestion) {
    if(suggestion instanceof String) {
      return suggestion;
    }

    if(!suggestion.id || !suggestion.display) {
      return suggestion.id;
    }

    return suggestion.display;
  }

  getID(suggestion) {
    if(suggestion instanceof String) {
      return suggestion;
    }

    return suggestion.id;
  }

  renderHighlightedDisplay(display, query) {
    var i = display.toLowerCase().indexOf(query.toLowerCase());
    if(i === -1) return <span>{ display }</span>;

    return (
      <span>
        { display.substring(0, i) }
        <b>{ display.substring(i, i+query.length) }</b>
        { display.substring(i+query.length) }
      </span>
    );
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
