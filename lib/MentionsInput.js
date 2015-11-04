'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = require('react');
var LinkedValueUtils = require('react/lib/LinkedValueUtils');
var emptyFunction = require('fbjs/lib/emptyFunction');

var utils = require('./utils');
var Mention = require('./Mention');
var SuggestionsOverlay = require('./SuggestionsOverlay');

var _generateComponentKey = function _generateComponentKey(usedKeys, id) {
  if (!usedKeys.hasOwnProperty(id)) {
    usedKeys[id] = 0;
  } else {
    usedKeys[id]++;
  }
  return id + "_" + usedKeys[id];
};

var _getTriggerRegex = function _getTriggerRegex(trigger) {
  if (trigger instanceof RegExp) {
    return trigger;
  } else {
    var escapedTriggerChar = utils.escapeRegex(trigger);

    // first capture group is the part to be replaced on completion
    // second capture group is for extracting the search query
    return new RegExp("(?:^|\\s)(" + escapedTriggerChar + "([^\\s" + escapedTriggerChar + "]*))$");
  }
};

var _getDataProvider = function _getDataProvider(data) {
  if (data instanceof Array) {
    // if data is an array, create a function to query that
    return function (query, callback) {
      var results = [];
      for (var i = 0, l = data.length; i < l; ++i) {
        var display = data[i].display || data[i].id;
        if (display.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
          results.push(data[i]);
        }
      }
      return results;
    };
  } else {
    // expect data to be a query function
    return data;
  }
};

var KEY = { TAB: 9, RETURN: 13, ESC: 27, UP: 38, DOWN: 40 };

module.exports = React.createClass({

  displayName: 'MentionsInput',

  mixins: [LinkedValueUtils.Mixin],

  propTypes: {

    /**
     * If set to `true` a regular text input element will be rendered
     * instead of a textarea
     */
    singleLine: React.PropTypes.bool,

    markup: React.PropTypes.string,

    displayTransform: React.PropTypes.func

  },

  getDefaultProps: function getDefaultProps() {
    return {
      markup: "@[__display__](__id__)",
      singleLine: false,
      className: "react-mentions",
      displayTransform: function displayTransform(id, display, type) {
        return display;
      },
      onKeyDown: emptyFunction,
      onSelect: emptyFunction,
      onBlur: emptyFunction
    };
  },

  getInitialState: function getInitialState() {
    return {
      selectionStart: null,
      selectionEnd: null,

      suggestions: {}
    };
  },

  render: function render() {
    var _props = this.props;
    var singleLine = _props.singleLine;
    var className = _props.className;
    var markup = _props.markup;
    var displayTransform = _props.displayTransform;
    var onKeyDown = _props.onKeyDown;
    var onSelect = _props.onSelect;
    var onBlur = _props.onBlur;
    var onChange = _props.onChange;
    var children = _props.children;
    var value = _props.value;
    var valueLink = _props.valueLink;

    var inputProps = _objectWithoutProperties(_props, ['singleLine', 'className', 'markup', 'displayTransform', 'onKeyDown', 'onSelect', 'onBlur', 'onChange', 'children', 'value', 'valueLink']);

    return React.createElement(
      'div',
      { ref: 'container', className: className, style: { position: "relative", overflowY: "visible" } },
      React.createElement(
        'div',
        { className: "control " + (singleLine ? "input" : "textarea") },
        React.createElement(
          'div',
          { className: 'highlighter', ref: 'highlighter', style: this.getHighlighterStyle() },
          this.renderHighlighter()
        ),
        this.renderInput(inputProps)
      ),
      this.renderSuggestionsOverlay()
    );
  },

  renderInput: function renderInput(props) {
    props.value = this.getPlainText();

    if (!this.props.readOnly && !this.props.disabled) {
      props.onChange = this.handleChange;
      props.onSelect = this.handleSelect;
      props.onKeyDown = this.handleKeyDown;
      props.onBlur = this.handleBlur;
    }

    // shared styles for input and textarea
    var style = {
      display: "block",
      position: "absolute",
      top: 0,
      boxSizing: "border-box",
      background: "transparent",
      font: "inherit"
    };

    if (this.props.singleLine) {

      // styles for input only
      style.width = "inherit";

      return React.createElement('input', _extends({ type: 'text' }, props, { ref: 'input', style: style }));
    }

    // styles for textarea only
    style.width = "100%";
    style.height = "100%";
    style.bottom = 0;
    style.overflow = "hidden";
    style.resize = "none";

    if (typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // fix weird textarea padding in mobile Safari (see: http://stackoverflow.com/questions/6890149/remove-3-pixels-in-ios-webkit-textarea)
      style.marginTop = 1;
      style.marginLeft = -3;
    }

    return React.createElement('textarea', _extends({}, props, { ref: 'input', style: style }));
  },

  getHighlighterStyle: function getHighlighterStyle() {
    var style = {
      position: "relative",
      width: "inherit",
      color: "transparent",
      font: "inherit",
      overflow: "hidden"
    };
    if (this.props.singleLine) {
      style.whiteSpace = "pre";
    } else {
      style.whiteSpace = "pre-wrap";
      style.wordWrap = "break-word";
    }
    return style;
  },

  renderSuggestionsOverlay: function renderSuggestionsOverlay() {
    if (!utils.isNumber(this.state.selectionStart)) {
      // do not show suggestions when the input does not have the focus
      return null;
    }
    return React.createElement(SuggestionsOverlay, {
      ref: 'suggestions',
      suggestions: this.state.suggestions,
      onSelect: this.addMention,
      onMouseDown: this.handleSuggestionsMouseDown,
      isLoading: this.isLoading() });
  },

  renderHighlighter: function renderHighlighter() {
    var value = LinkedValueUtils.getValue(this.props) || "";

    // If there's a caret (i.e. no range selection), map the caret position into the marked up value
    var caretPositionInMarkup;
    if (this.state.selectionStart === this.state.selectionEnd) {
      caretPositionInMarkup = utils.mapPlainTextIndex(value, this.props.markup, this.state.selectionStart, false, this.props.displayTransform);
    }

    var resultComponents = [];
    var componentKeys = {};

    // start by appending directly to the resultComponents
    var components = resultComponents;

    var substringComponentKey = 0;

    var textIteratee = (function (substr, index, indexInPlainText) {
      // check whether the caret element has to be inserted inside the current plain substring
      if (utils.isNumber(caretPositionInMarkup) && caretPositionInMarkup >= index && caretPositionInMarkup <= index + substr.length) {
        // if yes, split substr at the caret position and insert the caret component
        var splitIndex = caretPositionInMarkup - index;
        components.push(this.renderSubstring(substr.substring(0, splitIndex), substringComponentKey));

        // add all following substrings and mention components as children of the caret component
        components = [this.renderSubstring(substr.substring(splitIndex), substringComponentKey)];
      } else {
        // otherwise just push the plain text substring
        components.push(this.renderSubstring(substr, substringComponentKey));
      }

      substringComponentKey++;
    }).bind(this);

    var mentionIteratee = (function (markup, index, indexInPlainText, id, display, type, lastMentionEndIndex) {
      // generate a component key based on the id
      var key = _generateComponentKey(componentKeys, id);
      components.push(this.getMentionComponentForMatch(id, display, type, key));
    }).bind(this);
    utils.iterateMentionsMarkup(value, this.props.markup, textIteratee, mentionIteratee, this.props.displayTransform);

    // append a span containing a space, to ensure the last text line has the correct height
    components.push(" ");

    if (components !== resultComponents) {
      // if a caret component is to be rendered, add all components that followed as its children
      resultComponents.push(this.renderHighlighterCaret(components));
    }

    return resultComponents;
  },

  renderSubstring: function renderSubstring(string, key) {
    // set substring spand to hidden, so that Emojis are not shown double in Mobile Safari
    return React.createElement(
      'span',
      { style: { visibility: 'hidden' }, key: key },
      string
    );
  },

  // Renders an component to be inserted in the highlighter at the current caret position
  renderHighlighterCaret: function renderHighlighterCaret(children) {
    return React.createElement(
      'span',
      { className: 'caret-marker', ref: 'caret', key: 'caret' },
      children
    );
  },

  // Returns a clone of the Mention child applicable for the specified type to be rendered inside the highlighter
  getMentionComponentForMatch: function getMentionComponentForMatch(id, display, type, key) {
    var childrenCount = React.Children.count(this.props.children);
    var props = { id: id, display: display, key: key };

    if (childrenCount > 1) {
      if (!type) {
        throw new Error("Since multiple Mention components have been passed as children, the markup has to define the __type__ placeholder");
      }

      // detect the Mention child to be cloned
      var foundChild = null;
      React.Children.forEach(this.props.children, function (child) {
        if (!child) {
          return;
        }

        if (child.props.type === type) {
          foundChild = child;
        }
      });

      // clone the Mention child that is applicable for the given type
      return React.cloneElement(foundChild, props);
    } else if (childrenCount === 1) {
      // clone single Mention child
      var child = this.props.children.length ? this.props.children[0] : React.Children.only(this.props.children);
      return React.cloneElement(child, props);
    } else {
      // no children, use default configuration
      return Mention(props);
    }
  },

  // Returns the text to set as the value of the textarea with all markups removed
  getPlainText: function getPlainText() {
    var value = LinkedValueUtils.getValue(this.props) || "";
    return utils.getPlainText(value, this.props.markup, this.props.displayTransform);
  },

  getOnChange: function getOnChange(props) {
    if (this.props.onChange) {
      return this.props.onChange;
    }

    if (this.props.valueLink) {
      return this.props.valueLink.requestChange;
    }
  },

  // Handle input element's change event
  handleChange: function handleChange(ev) {

    if (document.activeElement !== ev.target) {
      // fix an IE bug (blur from empty input element with placeholder attribute trigger "input" event)
      return;
    }

    var value = LinkedValueUtils.getValue(this.props) || "";
    var newPlainTextValue = ev.target.value;

    // Derive the new value to set by applying the local change in the textarea's plain text
    var newValue = utils.applyChangeToValue(value, this.props.markup, newPlainTextValue, this.state.selectionStart, this.state.selectionEnd, ev.target.selectionEnd, this.props.displayTransform);

    // In case a mention is deleted, also adjust the new plain text value
    newPlainTextValue = utils.getPlainText(newValue, this.props.markup, this.props.displayTransform);

    // Save current selection after change to be able to restore caret position after rerendering
    var selectionStart = ev.target.selectionStart;
    var selectionEnd = ev.target.selectionEnd;
    var setSelectionAfterMentionChange = false;

    // Adjust selection range in case a mention will be deleted by the characters outside of the
    // selection range that are automatically deleted
    var startOfMention = utils.findStartOfMentionInPlainText(value, this.props.markup, selectionStart, this.props.displayTransform);

    if (startOfMention !== undefined && this.state.selectionEnd > startOfMention) {
      // only if a deletion has taken place
      selectionStart = startOfMention;
      selectionEnd = selectionStart;
      setSelectionAfterMentionChange = true;
    }

    this.setState({
      selectionStart: selectionStart,
      selectionEnd: selectionEnd,
      setSelectionAfterMentionChange: setSelectionAfterMentionChange
    });

    var mentions = utils.getMentions(newValue, this.props.markup);

    // Propagate change
    var handleChange = this.getOnChange(this.props) || emptyFunction;
    var eventMock = { target: { value: newValue } };
    // this.props.onChange.call(this, eventMock, newValue, newPlainTextValue, mentions);
    handleChange.call(this, eventMock, newValue, newPlainTextValue, mentions);
  },

  // Handle input element's select event
  handleSelect: function handleSelect(ev) {
    // keep track of selection range / caret position
    this.setState({
      selectionStart: ev.target.selectionStart,
      selectionEnd: ev.target.selectionEnd
    });

    // refresh suggestions queries
    var el = this.refs.input;
    if (ev.target.selectionStart === ev.target.selectionEnd) {
      this.updateMentionsQueries(el.value, ev.target.selectionStart);
    } else {
      this.clearSuggestions();
    }

    // sync highlighters scroll position
    this.updateHighlighterScroll();

    this.props.onSelect(ev);
  },

  handleKeyDown: function handleKeyDown(ev) {
    var keyHandlers = {};

    // do not intercept key events if the suggestions overlay is not shown
    var suggestionsCount = 0;
    for (var prop in this.state.suggestions) {
      if (this.state.suggestions.hasOwnProperty(prop)) {
        suggestionsCount += this.state.suggestions[prop].results.length;
      }
    }

    var suggestionsComp = this.refs.suggestions;
    if (suggestionsCount > 0 && suggestionsComp) {
      keyHandlers[KEY.ESC] = this.clearSuggestions;
      keyHandlers[KEY.DOWN] = suggestionsComp.shiftFocus.bind(null, +1);
      keyHandlers[KEY.UP] = suggestionsComp.shiftFocus.bind(null, -1);
      keyHandlers[KEY.RETURN] = suggestionsComp.selectFocused;
      keyHandlers[KEY.TAB] = suggestionsComp.selectFocused;
    }

    if (keyHandlers[ev.keyCode]) {
      keyHandlers[ev.keyCode]();
      ev.preventDefault();
    } else {
      this.props.onKeyDown(ev);
    }
  },

  handleBlur: function handleBlur(ev) {
    // only reset selection if the mousdown happened on an element
    // other than the suggestions overlay
    if (!this._suggestionsMouseDown) {
      this.setState({
        selectionStart: null,
        selectionEnd: null
      });
    };
    this._suggestionsMouseDown = false;

    var that = this;
    window.setTimeout(function () {
      that.updateHighlighterScroll();
    }, 1);

    this.props.onBlur(ev);
  },

  handleSuggestionsMouseDown: function handleSuggestionsMouseDown(ev) {
    this._suggestionsMouseDown = true;
  },

  updateSuggestionsPosition: function updateSuggestionsPosition() {
    if (!this.refs.caret || !this.refs.suggestions) return;

    var containerEl = this.refs.container;
    var caretEl = this.refs.caret;
    var suggestionsEl = React.findDOMNode(this.refs.suggestions);
    var highligherEl = this.refs.highlighter;
    if (!suggestionsEl) return;

    var leftPos = caretEl.offsetLeft - highligherEl.scrollLeft;
    // guard for mentions suggestions list clipped by right edge of window
    if (leftPos + suggestionsEl.offsetWidth > containerEl.offsetWidth) {
      suggestionsEl.style.right = "0px";
    } else {
      suggestionsEl.style.left = leftPos + "px";
    }
    suggestionsEl.style.top = caretEl.offsetTop - highligherEl.scrollTop + "px";
  },

  updateHighlighterScroll: function updateHighlighterScroll() {
    if (!this.refs.input || !this.refs.highlighter) {
      // since the invocation of this function is deferred,
      // the whole component may have been unmounted in the meanwhile
      return;
    }
    var input = this.refs.input;
    var highlighter = this.refs.highlighter;
    highlighter.scrollLeft = input.scrollLeft;
  },

  componentDidMount: function componentDidMount() {
    this.updateSuggestionsPosition();
  },

  componentDidUpdate: function componentDidUpdate() {
    this.updateSuggestionsPosition();

    // maintain selection in case a mention is added/removed causing
    // the cursor to jump to the end
    if (this.state.setSelectionAfterMentionChange) {
      this.setState({ setSelectionAfterMentionChange: false });
      this.setSelection(this.state.selectionStart, this.state.selectionEnd);
    }
  },

  setSelection: function setSelection(selectionStart, selectionEnd) {
    if (selectionStart === null || selectionEnd === null) return;

    var el = this.refs.input;
    if (el.setSelectionRange) {
      el.setSelectionRange(selectionStart, selectionEnd);
    } else if (el.createTextRange) {
      var range = el.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      range.select();
    }
  },

  updateMentionsQueries: function updateMentionsQueries(plainTextValue, caretPosition) {
    // Invalidate previous queries. Async results for previous queries will be neglected.
    this._queryId++;
    this.setState({
      suggestions: {}
    });

    // If caret is inside of or directly behind of mention, do not query
    var value = LinkedValueUtils.getValue(this.props) || "";
    if (utils.isInsideOfMention(value, this.props.markup, caretPosition, this.props.displayTransform) || utils.isInsideOfMention(value, this.props.markup, caretPosition - 1, this.props.displayTransform)) {
      return;
    }

    // Check if suggestions have to be shown:
    // Match the trigger patterns of all Mention children the new plain text substring up to the current caret position
    var substring = plainTextValue.substring(0, caretPosition);

    var that = this;
    React.Children.forEach(this.props.children, function (child) {
      if (!child) {
        return;
      }

      var regex = _getTriggerRegex(child.props.trigger);
      var match = substring.match(regex);
      if (match) {
        var querySequenceStart = substring.indexOf(match[1], match.index);
        that.queryData(match[2], child, querySequenceStart, querySequenceStart + match[1].length, plainTextValue);
      }
    });
  },

  clearSuggestions: function clearSuggestions() {
    // Invalidate previous queries. Async results for previous queries will be neglected.
    this._queryId++;
    this.setState({
      suggestions: {}
    });
  },

  queryData: function queryData(query, mentionDescriptor, querySequenceStart, querySequenceEnd, plainTextValue) {
    var provideData = _getDataProvider(mentionDescriptor.props.data);
    var snycResult = provideData(query, this.updateSuggestions.bind(null, this._queryId, mentionDescriptor, query, querySequenceStart, querySequenceEnd, plainTextValue));
    if (snycResult instanceof Array) {
      this.updateSuggestions(this._queryId, mentionDescriptor, query, querySequenceStart, querySequenceEnd, plainTextValue, snycResult);
    }
  },

  updateSuggestions: function updateSuggestions(queryId, mentionDescriptor, query, querySequenceStart, querySequenceEnd, plainTextValue, suggestions) {
    // neglect async results from previous queries
    if (queryId !== this._queryId) return;

    var update = {};
    update[mentionDescriptor.type] = {
      query: query,
      mentionDescriptor: mentionDescriptor,
      querySequenceStart: querySequenceStart,
      querySequenceEnd: querySequenceEnd,
      results: suggestions,
      plainTextValue: plainTextValue
    };

    this.setState({
      suggestions: utils.extend({}, this.state.suggestions, update)
    });
  },

  addMention: function addMention(suggestion, mentionDescriptor, querySequenceStart, querySequenceEnd, plainTextValue) {
    // Insert mention in the marked up value at the correct position
    var value = LinkedValueUtils.getValue(this.props) || "";
    var start = utils.mapPlainTextIndex(value, this.props.markup, querySequenceStart, false, this.props.displayTransform);
    var end = start + querySequenceEnd - querySequenceStart;
    var insert = utils.makeMentionsMarkup(this.props.markup, suggestion.id, suggestion.display, mentionDescriptor.props.type);
    var newValue = utils.spliceString(value, start, end, insert);

    // Refocus input and set caret position to end of mention
    this.refs.input.focus();

    var displayValue = this.props.displayTransform(suggestion.id, suggestion.display, mentionDescriptor.props.type);
    var newCaretPosition = querySequenceStart + displayValue.length;
    this.setState({
      selectionStart: newCaretPosition,
      selectionEnd: newCaretPosition,
      setSelectionAfterMentionChange: true
    });

    // Propagate change
    var handleChange = this.getOnChange(this) || emptyFunction;
    var eventMock = { target: { value: newValue } };
    var mentions = utils.getMentions(newValue, this.props.markup);
    var newPlainTextValue = utils.spliceString(plainTextValue, querySequenceStart, querySequenceEnd, displayValue);
    handleChange.call(this, eventMock, newValue, newPlainTextValue, mentions);

    var onAdd = mentionDescriptor.props.onAdd;
    if (onAdd) {
      onAdd(suggestion.id, suggestion.display);
    }

    // Make sure the suggestions overlay is closed
    this.clearSuggestions();
  },

  isLoading: function isLoading() {
    var isLoading = false;
    React.Children.forEach(this.props.children, function (child) {
      isLoading = isLoading || child && child.props.isLoading;
    });
    return isLoading;
  },

  _queryId: 0

});