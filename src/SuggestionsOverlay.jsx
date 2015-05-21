var React = require('react');
var emptyFunction = require('react/lib/emptyFunction');
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
    if(this.countSuggestions() === 0) return null;

    return (
      <div className="suggestions" onMouseDown={this.props.onMouseDown}>
        <ul>{ this.renderSuggestions() }</ul>
      </div>
    );
  },

  renderSuggestions: function() {
    var listItems = [];
    for(var mentionType in this.props.suggestions) {
      if(!this.props.suggestions.hasOwnProperty(mentionType)) return;
      var suggestions = this.props.suggestions[mentionType];

      for(var i=0, l=suggestions.results.length; i < l; ++i) {
        listItems.push(
          this.renderSuggestion(
            suggestions.results[i], suggestions.query,
            suggestions.querySequenceStart, suggestions.querySequenceEnd,
            suggestions.mentionDescriptor, listItems.length
          )
        );
      }
    }
    return listItems;
  },

  renderSuggestion: function(suggestion, query, querySequenceStart, querySequenceEnd, mentionDescriptor, index) {
    var id, display;
    var type = mentionDescriptor.props.type;

    if(suggestion instanceof String) {
      id = display = suggestion;
    } else if(!suggestion.id || !suggestion.display) {
      id = display = suggestion.id || suggestion.id;
    } else {
      id = suggestion.id;
      display = suggestion.display;
    }

    var isFocused = (index === this.state.focusIndex);
    var cls = isFocused ? "focus" : "";
    var handleClick = this.select.bind(null, suggestion, mentionDescriptor, querySequenceStart, querySequenceEnd);

    var highlightedDisplay = this.renderHighlightedDisplay(display, query);
    var content = mentionDescriptor.props.renderSuggestion ?
      mentionDescriptor.props.renderSuggestion(id, display, query, highlightedDisplay) :
      highlightedDisplay;

    return (
      <li key={id} ref={isFocused && "focused"} className={cls} onClick={handleClick} onMouseEnter={this.handleMouseEnter.bind(null, index)}>
        { content }
      </li>
    );
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

  handleMouseEnter: function(index, ev) {
    this.setState({
      focusIndex: index
    });
  },

  select: function(suggestion, mentionDescriptor, querySequenceStart, querySequenceEnd) {
    this.props.onSelect(suggestion, mentionDescriptor, querySequenceStart, querySequenceEnd);
  },

  selectFocused: function() {
    // call click handler of the focused element
    this.refs.focused.props.onClick();
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
