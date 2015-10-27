var React = require('react');
var emptyFunction = require('fbjs/lib/emptyFunction');
var utils = require('./utils');

module.exports = React.createClass({

  displayName: 'SuggestionsOverlay',

  getDefaultProps: function() {
    return {
      suggestions: {},
      onSelect: emptyFunction
    };
  },

  getInitialState: function() {
    return {
      focusIndex: 0
    };
  },

  componentWillReceiveProps: function(nextProps) {
    // always reset the focus on update
    this.setState({
      focusIndex: 0
    });
  },

  render: function() {
    // do not show suggestions until there is some data
    if(this.countSuggestions() === 0 && !this.props.isLoading) return null;

    return (
      <div
        className="suggestions"
        onMouseDown={this.props.onMouseDown}>
        <ul>{ this.renderSuggestions() }</ul>
        { this.renderLoadingIndicator() }
      </div>
    );
  },

  getSuggestions: function() {
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
  },

  getSuggestion: function(index) {
    return this.getSuggestions().reduce((result, { suggestions, descriptor }) => {
      var partial = suggestions.map((suggestion) => {
        return {
          suggestion: suggestion,
          descriptor: descriptor
        };
      });

      return [...result, ...partial];
    }, [])[index];
  },

  renderSuggestions: function() {
    var transformSuggestions = (result, { suggestions, descriptor }) => {
      var { query, querySequenceStart, querySequenceEnd, mentionDescriptor, plainTextValue } = descriptor;

      var partial = suggestions.map((suggestion, index) => this.renderSuggestion(
        suggestion,
        descriptor,
        result.length + index
      ));

      return [...result, ...partial];
    };

    return this.getSuggestions().reduce(transformSuggestions, []);
  },

  renderSuggestion: function(suggestion, descriptor, index) {
    var id = this.getID(suggestion);

    var isFocused = (index === this.state.focusIndex);
    var cls = isFocused ? "focus" : "";
    var handleClick = this.select.bind(null, suggestion, descriptor);

    return (
      <li
        key={id}
        ref={isFocused && "focused"}
        className={cls}
        onClick={handleClick}
        onMouseEnter={this.handleMouseEnter.bind(null, index)}>

        { this.renderContent(id, suggestion, descriptor) }
      </li>
    );
  },

  renderContent: function(id, suggestion, { mentionDescriptor, query }) {
    var display = this.getDisplay(suggestion);
    var highlightedDisplay = this.renderHighlightedDisplay(display, query);

    if(mentionDescriptor.props.renderSuggestion) {
      return mentionDescriptor.props.renderSuggestion(id, display, query, highlightedDisplay);
    }

    return highlightedDisplay;
  },

  getDisplay: function(suggestion) {
    if(suggestion instanceof String) {
      return suggestion;
    }

    if(!suggestion.id || !suggestion.display) {
      return suggestion.id;
    }

    return suggestion.display;
  },

  getID: function(suggestion) {
    if(suggestion instanceof String) {
      return suggestion;
    }

    return suggestion.id;
  },

  renderHighlightedDisplay: function(display, query) {
    var i = display.toLowerCase().indexOf(query.toLowerCase());
    if(i === -1) return <span>{ display }</span>;

    return (
      <span>
        { display.substring(0, i) }
        <b>{ display.substring(i, i+query.length) }</b>
        { display.substring(i+query.length) }
      </span>
    );
  },

  renderLoadingIndicator: function () {
    if(!this.props.isLoading) {
      return;
    }

    return (
      <div className="loading-indicator">
        <div className="spinner">
          <div className="element1"></div>
          <div className="element2"></div>
          <div className="element3"></div>
          <div className="element4"></div>
          <div className="element5"></div>
        </div>
      </div>
    );
  },

  handleMouseEnter: function(index, ev) {
    this.setState({
      focusIndex: index
    });
  },

  select: function(suggestion, {mentionDescriptor, querySequenceStart, querySequenceEnd, plainTextValue}) {
    this.props.onSelect(suggestion, mentionDescriptor, querySequenceStart, querySequenceEnd, plainTextValue);
  },

  selectFocused: function() {
    var { suggestion, descriptor } = this.getSuggestion(this.state.focusIndex);

    this.select(suggestion, descriptor);
  },

  shiftFocus: function(delta) {
    var suggestionsCount = this.countSuggestions();

    this.setState({
      focusIndex: (suggestionsCount + this.state.focusIndex + delta) % suggestionsCount
    });
  },

  countSuggestions: function(props) {
    props = props || this.props;
    var result = 0;
    for(var prop in this.props.suggestions) {
      if(this.props.suggestions.hasOwnProperty(prop)) {
        result += this.props.suggestions[prop].results.length;
      }
    }
    return result;
  }

});
