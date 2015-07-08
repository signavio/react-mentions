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
      React.createElement("div", {className: "suggestions", onMouseDown: this.props.onMouseDown}, 
        React.createElement("ul", null,  this.renderSuggestions() )
      )
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
            suggestions.mentionDescriptor, listItems.length,
            suggestions.plainTextValue
          )
        );
      }
    }
    return listItems;
  },

  renderSuggestion: function(suggestion, query, querySequenceStart, querySequenceEnd, mentionDescriptor, index, plainTextValue) {
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
    var handleClick = this.select.bind(null, suggestion, mentionDescriptor, querySequenceStart, querySequenceEnd, plainTextValue);

    var highlightedDisplay = this.renderHighlightedDisplay(display, query);
    var content = mentionDescriptor.props.renderSuggestion ?
      mentionDescriptor.props.renderSuggestion(id, display, query, highlightedDisplay) :
      highlightedDisplay;

    return (
      React.createElement("li", {key: id, ref: isFocused && "focused", className: cls, onClick: handleClick, onMouseEnter: this.handleMouseEnter.bind(null, index)}, 
         content 
      )
    );
  },

  renderHighlightedDisplay: function(display, query) {
    var i = display.toLowerCase().indexOf(query.toLowerCase());
    if(i === -1) return React.createElement("span", null,  display );

    return (
      React.createElement("span", null, 
         display.substring(0, i), 
        React.createElement("b", null,  display.substring(i, i+query.length) ), 
         display.substring(i+query.length) 
      )
    );
  },

  handleMouseEnter: function(index, ev) {
    this.setState({
      focusIndex: index
    });
  },

  select: function(suggestion, mentionDescriptor, querySequenceStart, querySequenceEnd, plainTextValue) {
    this.props.onSelect(suggestion, mentionDescriptor, querySequenceStart, querySequenceEnd, plainTextValue);
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
