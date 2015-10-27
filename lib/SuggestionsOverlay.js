'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var React = require('react');
var emptyFunction = require('fbjs/lib/emptyFunction');
var utils = require('./utils');

module.exports = React.createClass({

  displayName: 'SuggestionsOverlay',

  getDefaultProps: function getDefaultProps() {
    return {
      suggestions: {},
      onSelect: emptyFunction
    };
  },

  getInitialState: function getInitialState() {
    return {
      focusIndex: 0
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    // always reset the focus on update
    this.setState({
      focusIndex: 0
    });
  },

  render: function render() {
    // do not show suggestions until there is some data
    if (this.countSuggestions() === 0 && !this.props.isLoading) return null;

    return React.createElement(
      'div',
      {
        className: 'suggestions',
        onMouseDown: this.props.onMouseDown },
      React.createElement(
        'ul',
        null,
        this.renderSuggestions()
      ),
      this.renderLoadingIndicator()
    );
  },

  getSuggestions: function getSuggestions() {
    var suggestions = [];

    for (var mentionType in this.props.suggestions) {
      if (!this.props.suggestions.hasOwnProperty(mentionType)) {
        return;
      }

      suggestions = suggestions.concat({
        suggestions: this.props.suggestions[mentionType].results,
        descriptor: this.props.suggestions[mentionType]
      });
    }

    return suggestions;
  },

  getSuggestion: function getSuggestion(index) {
    return this.getSuggestions().reduce(function (result, _ref) {
      var suggestions = _ref.suggestions;
      var descriptor = _ref.descriptor;

      var partial = suggestions.map(function (suggestion) {
        return {
          suggestion: suggestion,
          descriptor: descriptor
        };
      });

      return [].concat(_toConsumableArray(result), _toConsumableArray(partial));
    }, [])[index];
  },

  renderSuggestions: function renderSuggestions() {
    var _this = this;

    var transformSuggestions = function transformSuggestions(result, _ref2) {
      var suggestions = _ref2.suggestions;
      var descriptor = _ref2.descriptor;
      var query = descriptor.query;
      var querySequenceStart = descriptor.querySequenceStart;
      var querySequenceEnd = descriptor.querySequenceEnd;
      var mentionDescriptor = descriptor.mentionDescriptor;
      var plainTextValue = descriptor.plainTextValue;

      var partial = suggestions.map(function (suggestion, index) {
        return _this.renderSuggestion(suggestion, descriptor, result.length + index);
      });

      return [].concat(_toConsumableArray(result), _toConsumableArray(partial));
    };

    return this.getSuggestions().reduce(transformSuggestions, []);
  },

  renderSuggestion: function renderSuggestion(suggestion, descriptor, index) {
    var id = this.getID(suggestion);

    var isFocused = index === this.state.focusIndex;
    var cls = isFocused ? "focus" : "";
    var handleClick = this.select.bind(null, suggestion, descriptor);

    return React.createElement(
      'li',
      {
        key: id,
        ref: isFocused && "focused",
        className: cls,
        onClick: handleClick,
        onMouseEnter: this.handleMouseEnter.bind(null, index) },
      this.renderContent(id, suggestion, descriptor)
    );
  },

  renderContent: function renderContent(id, suggestion, _ref3) {
    var mentionDescriptor = _ref3.mentionDescriptor;
    var query = _ref3.query;

    var display = this.getDisplay(suggestion);
    var highlightedDisplay = this.renderHighlightedDisplay(display, query);

    if (mentionDescriptor.props.renderSuggestion) {
      return mentionDescriptor.props.renderSuggestion(id, display, query, highlightedDisplay);
    }

    return highlightedDisplay;
  },

  getDisplay: function getDisplay(suggestion) {
    if (suggestion instanceof String) {
      return suggestion;
    }

    if (!suggestion.id || !suggestion.display) {
      return suggestion.id;
    }

    return suggestion.display;
  },

  getID: function getID(suggestion) {
    if (suggestion instanceof String) {
      return suggestion;
    }

    return suggestion.id;
  },

  renderHighlightedDisplay: function renderHighlightedDisplay(display, query) {
    var i = display.toLowerCase().indexOf(query.toLowerCase());
    if (i === -1) return React.createElement(
      'span',
      null,
      display
    );

    return React.createElement(
      'span',
      null,
      display.substring(0, i),
      React.createElement(
        'b',
        null,
        display.substring(i, i + query.length)
      ),
      display.substring(i + query.length)
    );
  },

  renderLoadingIndicator: function renderLoadingIndicator() {
    if (!this.props.isLoading) {
      return;
    }

    return React.createElement(
      'div',
      { className: 'loading-indicator' },
      React.createElement(
        'div',
        { className: 'spinner' },
        React.createElement('div', { className: 'element1' }),
        React.createElement('div', { className: 'element2' }),
        React.createElement('div', { className: 'element3' }),
        React.createElement('div', { className: 'element4' }),
        React.createElement('div', { className: 'element5' })
      )
    );
  },

  handleMouseEnter: function handleMouseEnter(index, ev) {
    this.setState({
      focusIndex: index
    });
  },

  select: function select(suggestion, _ref4) {
    var mentionDescriptor = _ref4.mentionDescriptor;
    var querySequenceStart = _ref4.querySequenceStart;
    var querySequenceEnd = _ref4.querySequenceEnd;
    var plainTextValue = _ref4.plainTextValue;

    this.props.onSelect(suggestion, mentionDescriptor, querySequenceStart, querySequenceEnd, plainTextValue);
  },

  selectFocused: function selectFocused() {
    var _getSuggestion = this.getSuggestion(this.state.focusIndex);

    var suggestion = _getSuggestion.suggestion;
    var descriptor = _getSuggestion.descriptor;

    this.select(suggestion, descriptor);
  },

  shiftFocus: function shiftFocus(delta) {
    var suggestionsCount = this.countSuggestions();

    this.setState({
      focusIndex: (suggestionsCount + this.state.focusIndex + delta) % suggestionsCount
    });
  },

  countSuggestions: function countSuggestions(props) {
    props = props || this.props;
    var result = 0;
    for (var prop in this.props.suggestions) {
      if (this.props.suggestions.hasOwnProperty(prop)) {
        result += this.props.suggestions[prop].results.length;
      }
    }
    return result;
  }

});