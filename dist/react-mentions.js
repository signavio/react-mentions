!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.ReactMentions=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var emptyFunction = _dereq_('fbjs/lib/emptyFunction');
var utils = _dereq_('./utils');

module.exports = React.createClass({

  displayName: 'Mention',

  propTypes: {
    /**
     * Called when a new mention is added in the input
     *
     * Example:
     *
     * ```js
     * function(id, display) {
     *   console.log("user " + display + " was mentioned!");
     * }
     * ```
     */
    onAdd: React.PropTypes.func,

    renderSuggestion: React.PropTypes.func,

    className: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      trigger: "@",
      onAdd: emptyFunction,
      onRemove: emptyFunction,
      renderSuggestion: null,
      isLoading: false
    };
  },

  render: function render() {
    return React.createElement(
      'strong',
      { className: this.props.className },
      this.props.display
    );
  }

});
},{"./utils":5,"fbjs/lib/emptyFunction":6}],2:[function(_dereq_,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var LinkedValueUtils = _dereq_('react/lib/LinkedValueUtils');
var emptyFunction = _dereq_('fbjs/lib/emptyFunction');

var utils = _dereq_('./utils');
var Mention = _dereq_('./Mention');
var SuggestionsOverlay = _dereq_('./SuggestionsOverlay');

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

  executeOnChange: function executeOnChange(event) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (this.props.onChange) {
      var _props2;

      return (_props2 = this.props).onChange.apply(_props2, [event].concat(args));
    }

    if (this.props.valueLink) {
      var _props$valueLink;

      return (_props$valueLink = this.props.valueLink).requestChange.apply(_props$valueLink, [event.target.value].concat(args));
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
    // var handleChange = this.getOnChange(this.props) || emptyFunction;
    var eventMock = { target: { value: newValue } };
    // this.props.onChange.call(this, eventMock, newValue, newPlainTextValue, mentions);
    this.executeOnChange(eventMock, newValue, newPlainTextValue, mentions);
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
    var eventMock = { target: { value: newValue } };
    var mentions = utils.getMentions(newValue, this.props.markup);
    var newPlainTextValue = utils.spliceString(plainTextValue, querySequenceStart, querySequenceEnd, displayValue);

    this.executeOnChange(eventMock, newValue, newPlainTextValue, mentions);

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
},{"./Mention":1,"./SuggestionsOverlay":3,"./utils":5,"fbjs/lib/emptyFunction":6,"react/lib/LinkedValueUtils":7}],3:[function(_dereq_,module,exports){
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var emptyFunction = _dereq_('fbjs/lib/emptyFunction');
var utils = _dereq_('./utils');

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
},{"./utils":5,"fbjs/lib/emptyFunction":6}],4:[function(_dereq_,module,exports){
'use strict';

module.exports = {
  MentionsInput: _dereq_('./MentionsInput'),
  Mention: _dereq_('./Mention')
};
},{"./Mention":1,"./MentionsInput":2}],5:[function(_dereq_,module,exports){
"use strict";

var PLACEHOLDERS = {
  id: "__id__",
  display: "__display__",
  type: "__type__"
};

var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};
var createEscaper = function createEscaper(map) {
  var escaper = function escaper(match) {
    return map[match];
  };
  var keys = [];
  for (var key in map) {
    if (map.hasOwnProperty(key)) keys.push(key);
  }
  var source = '(?:' + keys.join('|') + ')';
  var testRegexp = RegExp(source);
  var replaceRegexp = RegExp(source, 'g');
  return function (string) {
    string = string == null ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
};

var numericComparator = function numericComparator(a, b) {
  a = a === null ? Number.MAX_VALUE : a;
  b = b === null ? Number.MAX_VALUE : b;
  return a - b;
};

module.exports = {

  escapeHtml: createEscaper(escapeMap),

  escapeRegex: function escapeRegex(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  },

  markupToRegex: function markupToRegex(markup, matchAtEnd) {
    var markupPattern = this.escapeRegex(markup);
    markupPattern = markupPattern.replace(PLACEHOLDERS.display, "(.+?)");
    markupPattern = markupPattern.replace(PLACEHOLDERS.id, "(.+?)");
    markupPattern = markupPattern.replace(PLACEHOLDERS.type, "(.+?)");
    if (matchAtEnd) {
      // append a $ to match at the end of the string
      markupPattern = markupPattern + "$";
    }
    return new RegExp(markupPattern, "g");
  },

  spliceString: function spliceString(str, start, end, insert) {
    return str.substring(0, start) + insert + str.substring(end);
  },

  extend: function extend(obj) {
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
          obj[prop] = source[prop];
        }
      }
    }
    return obj;
  },

  isNumber: function isNumber(obj) {
    return Object.prototype.toString.call(obj) === "[object Number]";
  },

  /**
   * parameterName: "id", "display", or "type"
   */
  getPositionOfCapturingGroup: function getPositionOfCapturingGroup(markup, parameterName) {
    if (parameterName !== "id" && parameterName !== "display" && parameterName !== "type") {
      throw new Error("parameterName must be 'id', 'display', or 'type'");
    }

    // calculate positions of placeholders in the markup
    var indexDisplay = markup.indexOf(PLACEHOLDERS.display);
    var indexId = markup.indexOf(PLACEHOLDERS.id);
    var indexType = markup.indexOf(PLACEHOLDERS.type);

    // set indices to null if not found
    if (indexDisplay < 0) indexDisplay = null;
    if (indexId < 0) indexId = null;
    if (indexType < 0) indexType = null;

    if (indexDisplay === null && indexId === null) {
      // markup contains none of the mandatory placeholders
      throw new Error("The markup `" + markup + "` must contain at least one of the placeholders `__id__` or `__display__`");
    }

    if (indexType === null && parameterName === "type") {
      // markup does not contain optional __type__ placeholder
      return null;
    }

    // sort indices in ascending order (null values will always be at the end)
    var sortedIndices = [indexDisplay, indexId, indexType].sort(numericComparator);

    // If only one the placeholders __id__ and __display__ is present,
    // use the captured string for both parameters, id and display
    if (indexDisplay === null) indexDisplay = indexId;
    if (indexId === null) indexId = indexDisplay;

    if (parameterName === "id") return sortedIndices.indexOf(indexId);
    if (parameterName === "display") return sortedIndices.indexOf(indexDisplay);
    if (parameterName === "type") return indexType === null ? null : sortedIndices.indexOf(indexType);
  },

  // Finds all occurences of the markup in the value and iterates the plain text sub strings
  // in between those markups using `textIteratee` and the markup occurrences using the
  // `markupIteratee`.
  iterateMentionsMarkup: function iterateMentionsMarkup(value, markup, textIteratee, markupIteratee, displayTransform) {
    var regex = this.markupToRegex(markup);
    var displayPos = this.getPositionOfCapturingGroup(markup, "display");
    var idPos = this.getPositionOfCapturingGroup(markup, "id");
    var typePos = this.getPositionOfCapturingGroup(markup, "type");

    var match;
    var start = 0;
    var currentPlainTextIndex = 0;

    // detect all mention markup occurences in the value and iterate the matches
    while ((match = regex.exec(value)) !== null) {

      var id = match[idPos + 1];
      var display = match[displayPos + 1];
      var type = typePos ? match[typePos + 1] : null;

      if (displayTransform) display = displayTransform(id, display, type);

      var substr = value.substring(start, match.index);
      textIteratee(substr, start, currentPlainTextIndex);
      currentPlainTextIndex += substr.length;

      markupIteratee(match[0], match.index, currentPlainTextIndex, id, display, type, start);
      currentPlainTextIndex += display.length;

      start = regex.lastIndex;
    }

    if (start < value.length) {
      textIteratee(value.substring(start), start, currentPlainTextIndex);
    }
  },

  // For the passed character index in the plain text string, returns the corresponding index
  // in the marked up value string.
  // If the passed character index lies inside a mention, returns the index of the mention
  // markup's first char, or respectively tho one after its last char, if the flag `toEndOfMarkup` is set.
  mapPlainTextIndex: function mapPlainTextIndex(value, markup, indexInPlainText, toEndOfMarkup, displayTransform) {
    if (!this.isNumber(indexInPlainText)) {
      return indexInPlainText;
    }

    var result;
    var textIteratee = function textIteratee(substr, index, substrPlainTextIndex) {
      if (result !== undefined) return;

      if (substrPlainTextIndex + substr.length >= indexInPlainText) {
        // found the corresponding position in the current plain text range
        result = index + indexInPlainText - substrPlainTextIndex;
      }
    };
    var markupIteratee = function markupIteratee(markup, index, mentionPlainTextIndex, id, display, type, lastMentionEndIndex) {
      if (result !== undefined) return;

      if (mentionPlainTextIndex + display.length > indexInPlainText) {
        // found the corresponding position inside current match,
        // return the index of the first or after the last char of the matching markup
        // depending on whether the `toEndOfMarkup` is set
        result = index + (toEndOfMarkup ? markup.length : 0);
      }
    };

    this.iterateMentionsMarkup(value, markup, textIteratee, markupIteratee, displayTransform);

    // when a mention is at the end of the value and we want to get the caret position
    // at the end of the string, result is undefined
    return result === undefined ? value.length : result;
  },

  // For a given indexInPlainText that lies inside a mention,
  // returns a the index of of the first char of the mention in the plain text.
  // If indexInPlainText does not lie inside a mention, returns indexInPlainText.
  findStartOfMentionInPlainText: function findStartOfMentionInPlainText(value, markup, indexInPlainText, displayTransform) {
    var result = indexInPlainText;
    var foundMention = false;

    var markupIteratee = function markupIteratee(markup, index, mentionPlainTextIndex, id, display, type, lastMentionEndIndex) {
      if (mentionPlainTextIndex < indexInPlainText && mentionPlainTextIndex + display.length > indexInPlainText) {
        result = mentionPlainTextIndex;
        foundMention = true;
      }
    };
    this.iterateMentionsMarkup(value, markup, function () {}, markupIteratee, displayTransform);

    if (foundMention) {
      return result;
    }
  },

  // Returns whether the given plain text index lies inside a mention
  isInsideOfMention: function isInsideOfMention(value, markup, indexInPlainText, displayTransform) {
    var mentionStart = this.findStartOfMentionInPlainText(value, markup, indexInPlainText, displayTransform);
    return mentionStart !== undefined && mentionStart !== indexInPlainText;
  },

  // Applies a change from the plain text textarea to the underlying marked up value
  // guided by the textarea text selection ranges before and after the change
  applyChangeToValue: function applyChangeToValue(value, markup, plainTextValue, selectionStartBeforeChange, selectionEndBeforeChange, selectionEndAfterChange, displayTransform) {
    var oldPlainTextValue = this.getPlainText(value, markup, displayTransform);

    var lengthDelta = oldPlainTextValue.length - plainTextValue.length;
    if (selectionStartBeforeChange === 'undefined') {
      selectionStartBeforeChange = selectionEndAfterChange + lengthDelta;
    }

    if (selectionEndBeforeChange === 'undefined') {
      selectionEndBeforeChange = selectionStartBeforeChange;
    }

    // Fixes an issue with replacing combined characters for complex input. Eg like acented letters on OSX
    if (selectionStartBeforeChange === selectionEndBeforeChange && selectionEndBeforeChange === selectionEndAfterChange && oldPlainTextValue.length === plainTextValue.length) {
      selectionStartBeforeChange = selectionStartBeforeChange - 1;
    }

    // extract the insertion from the new plain text value
    var insert = plainTextValue.slice(selectionStartBeforeChange, selectionEndAfterChange);

    // handling for Backspace key with no range selection
    var spliceStart = Math.min(selectionStartBeforeChange, selectionEndAfterChange);

    var spliceEnd = selectionEndBeforeChange;
    if (selectionStartBeforeChange === selectionEndAfterChange) {
      // handling for Delete key with no range selection
      spliceEnd = Math.max(selectionEndBeforeChange, selectionStartBeforeChange + lengthDelta);
    }

    // splice the current marked up value and insert new chars
    return this.spliceString(value, this.mapPlainTextIndex(value, markup, spliceStart, false, displayTransform), this.mapPlainTextIndex(value, markup, spliceEnd, true, displayTransform), insert);
  },

  getPlainText: function getPlainText(value, markup, displayTransform) {
    var regex = this.markupToRegex(markup);
    var idPos = this.getPositionOfCapturingGroup(markup, "id");
    var displayPos = this.getPositionOfCapturingGroup(markup, "display");
    var typePos = this.getPositionOfCapturingGroup(markup, "type");
    return value.replace(regex, function () {
      // first argument is the whole match, capturing groups are following
      var id = arguments[idPos + 1];
      var display = arguments[displayPos + 1];
      var type = arguments[typePos + 1];
      if (displayTransform) display = displayTransform(id, display, type);
      return display;
    });
  },

  getMentions: function getMentions(value, markup) {
    var mentions = [];
    this.iterateMentionsMarkup(value, markup, function () {}, function (match, index, plainTextIndex, id, display, type, start) {
      mentions.push({
        id: id,
        display: display,
        type: type,
        index: index,
        plainTextIndex: plainTextIndex
      });
    });
    return mentions;
  },

  makeMentionsMarkup: function makeMentionsMarkup(markup, id, display, type) {
    var result = markup.replace(PLACEHOLDERS.id, id);
    result = result.replace(PLACEHOLDERS.display, display);
    result = result.replace(PLACEHOLDERS.type, type);
    return result;
  }

};
},{}],6:[function(_dereq_,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule emptyFunction
 */

"use strict";

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
function emptyFunction() {}

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;
},{}],7:[function(_dereq_,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule LinkedValueUtils
 * @typechecks static-only
 */

'use strict';

var ReactPropTypes = _dereq_('./ReactPropTypes');
var ReactPropTypeLocations = _dereq_('./ReactPropTypeLocations');

var invariant = _dereq_('fbjs/lib/invariant');
var warning = _dereq_('fbjs/lib/warning');

var hasReadOnlyValue = {
  'button': true,
  'checkbox': true,
  'image': true,
  'hidden': true,
  'radio': true,
  'reset': true,
  'submit': true
};

function _assertSingleLink(inputProps) {
  !(inputProps.checkedLink == null || inputProps.valueLink == null) ? "production" !== 'production' ? invariant(false, 'Cannot provide a checkedLink and a valueLink. If you want to use ' + 'checkedLink, you probably don\'t want to use valueLink and vice versa.') : invariant(false) : undefined;
}
function _assertValueLink(inputProps) {
  _assertSingleLink(inputProps);
  !(inputProps.value == null && inputProps.onChange == null) ? "production" !== 'production' ? invariant(false, 'Cannot provide a valueLink and a value or onChange event. If you want ' + 'to use value or onChange, you probably don\'t want to use valueLink.') : invariant(false) : undefined;
}

function _assertCheckedLink(inputProps) {
  _assertSingleLink(inputProps);
  !(inputProps.checked == null && inputProps.onChange == null) ? "production" !== 'production' ? invariant(false, 'Cannot provide a checkedLink and a checked property or onChange event. ' + 'If you want to use checked or onChange, you probably don\'t want to ' + 'use checkedLink') : invariant(false) : undefined;
}

var propTypes = {
  value: function (props, propName, componentName) {
    if (!props[propName] || hasReadOnlyValue[props.type] || props.onChange || props.readOnly || props.disabled) {
      return null;
    }
    return new Error('You provided a `value` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultValue`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
  },
  checked: function (props, propName, componentName) {
    if (!props[propName] || props.onChange || props.readOnly || props.disabled) {
      return null;
    }
    return new Error('You provided a `checked` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultChecked`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
  },
  onChange: ReactPropTypes.func
};

var loggedTypeFailures = {};
function getDeclarationErrorAddendum(owner) {
  if (owner) {
    var name = owner.getName();
    if (name) {
      return ' Check the render method of `' + name + '`.';
    }
  }
  return '';
}

/**
 * Provide a linked `value` attribute for controlled forms. You should not use
 * this outside of the ReactDOM controlled form components.
 */
var LinkedValueUtils = {
  checkPropTypes: function (tagName, props, owner) {
    for (var propName in propTypes) {
      if (propTypes.hasOwnProperty(propName)) {
        var error = propTypes[propName](props, propName, tagName, ReactPropTypeLocations.prop);
      }
      if (error instanceof Error && !(error.message in loggedTypeFailures)) {
        // Only monitor this failure once because there tends to be a lot of the
        // same error.
        loggedTypeFailures[error.message] = true;

        var addendum = getDeclarationErrorAddendum(owner);
        "production" !== 'production' ? warning(false, 'Failed form propType: %s%s', error.message, addendum) : undefined;
      }
    }
  },

  /**
   * @param {object} inputProps Props for form component
   * @return {*} current value of the input either from value prop or link.
   */
  getValue: function (inputProps) {
    if (inputProps.valueLink) {
      _assertValueLink(inputProps);
      return inputProps.valueLink.value;
    }
    return inputProps.value;
  },

  /**
   * @param {object} inputProps Props for form component
   * @return {*} current checked status of the input either from checked prop
   *             or link.
   */
  getChecked: function (inputProps) {
    if (inputProps.checkedLink) {
      _assertCheckedLink(inputProps);
      return inputProps.checkedLink.value;
    }
    return inputProps.checked;
  },

  /**
   * @param {object} inputProps Props for form component
   * @param {SyntheticEvent} event change event to handle
   */
  executeOnChange: function (inputProps, event) {
    if (inputProps.valueLink) {
      _assertValueLink(inputProps);
      return inputProps.valueLink.requestChange(event.target.value);
    } else if (inputProps.checkedLink) {
      _assertCheckedLink(inputProps);
      return inputProps.checkedLink.requestChange(event.target.checked);
    } else if (inputProps.onChange) {
      return inputProps.onChange.call(undefined, event);
    }
  }
};

module.exports = LinkedValueUtils;
},{"./ReactPropTypeLocations":12,"./ReactPropTypes":13,"fbjs/lib/invariant":17,"fbjs/lib/warning":19}],8:[function(_dereq_,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Object.assign
 */

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign

'use strict';

function assign(target, sources) {
  if (target == null) {
    throw new TypeError('Object.assign target cannot be null or undefined');
  }

  var to = Object(target);
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
    var nextSource = arguments[nextIndex];
    if (nextSource == null) {
      continue;
    }

    var from = Object(nextSource);

    // We don't currently support accessors nor proxies. Therefore this
    // copy cannot throw. If we ever supported this then we must handle
    // exceptions and side-effects. We don't support symbols so they won't
    // be transferred.

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
  }

  return to;
}

module.exports = assign;
},{}],9:[function(_dereq_,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactCurrentOwner
 */

'use strict';

/**
 * Keeps track of the current owner.
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 */
var ReactCurrentOwner = {

  /**
   * @internal
   * @type {ReactComponent}
   */
  current: null

};

module.exports = ReactCurrentOwner;
},{}],10:[function(_dereq_,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactElement
 */

'use strict';

var ReactCurrentOwner = _dereq_('./ReactCurrentOwner');

var assign = _dereq_('./Object.assign');
var canDefineProperty = _dereq_('./canDefineProperty');

// The Symbol used to tag the ReactElement type. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol['for'] && Symbol['for']('react.element') || 0xeac7;

var RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
};

/**
 * Base constructor for all React elements. This is only used to make this
 * work with a dynamic instanceof check. Nothing should live on this prototype.
 *
 * @param {*} type
 * @param {*} key
 * @param {string|object} ref
 * @param {*} self A *temporary* helper to detect places where `this` is
 * different from the `owner` when React.createElement is called, so that we
 * can warn. We want to get rid of owner and replace string `ref`s with arrow
 * functions, and as long as `this` and owner are the same, there will be no
 * change in behavior.
 * @param {*} source An annotation object (added by a transpiler or otherwise)
 * indicating filename, line number, and/or other information.
 * @param {*} owner
 * @param {*} props
 * @internal
 */
var ReactElement = function (type, key, ref, self, source, owner, props) {
  var element = {
    // This tag allow us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner
  };

  if ("production" !== 'production') {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    element._store = {};

    // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.
    if (canDefineProperty) {
      Object.defineProperty(element._store, 'validated', {
        configurable: false,
        enumerable: false,
        writable: true,
        value: false
      });
      // self and source are DEV only properties.
      Object.defineProperty(element, '_self', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: self
      });
      // Two elements created in two different places should be considered
      // equal for testing purposes and therefore we hide it from enumeration.
      Object.defineProperty(element, '_source', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: source
      });
    } else {
      element._store.validated = false;
      element._self = self;
      element._source = source;
    }
    Object.freeze(element.props);
    Object.freeze(element);
  }

  return element;
};

ReactElement.createElement = function (type, config, children) {
  var propName;

  // Reserved names are extracted
  var props = {};

  var key = null;
  var ref = null;
  var self = null;
  var source = null;

  if (config != null) {
    ref = config.ref === undefined ? null : config.ref;
    key = config.key === undefined ? null : '' + config.key;
    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // Remaining properties are added to a new props object
    for (propName in config) {
      if (config.hasOwnProperty(propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  // Resolve default props
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (typeof props[propName] === 'undefined') {
        props[propName] = defaultProps[propName];
      }
    }
  }

  return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
};

ReactElement.createFactory = function (type) {
  var factory = ReactElement.createElement.bind(null, type);
  // Expose the type on the factory and the prototype so that it can be
  // easily accessed on elements. E.g. `<Foo />.type === Foo`.
  // This should not be named `constructor` since this may not be the function
  // that created the element, and it may not even be a constructor.
  // Legacy hook TODO: Warn if this is accessed
  factory.type = type;
  return factory;
};

ReactElement.cloneAndReplaceKey = function (oldElement, newKey) {
  var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);

  return newElement;
};

ReactElement.cloneAndReplaceProps = function (oldElement, newProps) {
  var newElement = ReactElement(oldElement.type, oldElement.key, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, newProps);

  if ("production" !== 'production') {
    // If the key on the original is valid, then the clone is valid
    newElement._store.validated = oldElement._store.validated;
  }

  return newElement;
};

ReactElement.cloneElement = function (element, config, children) {
  var propName;

  // Original props are copied
  var props = assign({}, element.props);

  // Reserved names are extracted
  var key = element.key;
  var ref = element.ref;
  // Self is preserved since the owner is preserved.
  var self = element._self;
  // Source is preserved since cloneElement is unlikely to be targeted by a
  // transpiler, and the original source is probably a better indicator of the
  // true owner.
  var source = element._source;

  // Owner will be preserved, unless ref is overridden
  var owner = element._owner;

  if (config != null) {
    if (config.ref !== undefined) {
      // Silently steal the ref from the parent.
      ref = config.ref;
      owner = ReactCurrentOwner.current;
    }
    if (config.key !== undefined) {
      key = '' + config.key;
    }
    // Remaining properties override existing props
    for (propName in config) {
      if (config.hasOwnProperty(propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return ReactElement(element.type, key, ref, self, source, owner, props);
};

/**
 * @param {?object} object
 * @return {boolean} True if `object` is a valid component.
 * @final
 */
ReactElement.isValidElement = function (object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
};

module.exports = ReactElement;
},{"./Object.assign":8,"./ReactCurrentOwner":9,"./canDefineProperty":14}],11:[function(_dereq_,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPropTypeLocationNames
 */

'use strict';

var ReactPropTypeLocationNames = {};

if ("production" !== 'production') {
  ReactPropTypeLocationNames = {
    prop: 'prop',
    context: 'context',
    childContext: 'child context'
  };
}

module.exports = ReactPropTypeLocationNames;
},{}],12:[function(_dereq_,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPropTypeLocations
 */

'use strict';

var keyMirror = _dereq_('fbjs/lib/keyMirror');

var ReactPropTypeLocations = keyMirror({
  prop: null,
  context: null,
  childContext: null
});

module.exports = ReactPropTypeLocations;
},{"fbjs/lib/keyMirror":18}],13:[function(_dereq_,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPropTypes
 */

'use strict';

var ReactElement = _dereq_('./ReactElement');
var ReactPropTypeLocationNames = _dereq_('./ReactPropTypeLocationNames');

var emptyFunction = _dereq_('fbjs/lib/emptyFunction');
var getIteratorFn = _dereq_('./getIteratorFn');

/**
 * Collection of methods that allow declaration and validation of props that are
 * supplied to React components. Example usage:
 *
 *   var Props = require('ReactPropTypes');
 *   var MyArticle = React.createClass({
 *     propTypes: {
 *       // An optional string prop named "description".
 *       description: Props.string,
 *
 *       // A required enum prop named "category".
 *       category: Props.oneOf(['News','Photos']).isRequired,
 *
 *       // A prop named "dialog" that requires an instance of Dialog.
 *       dialog: Props.instanceOf(Dialog).isRequired
 *     },
 *     render: function() { ... }
 *   });
 *
 * A more formal specification of how these methods are used:
 *
 *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
 *   decl := ReactPropTypes.{type}(.isRequired)?
 *
 * Each and every declaration produces a function with the same signature. This
 * allows the creation of custom validation functions. For example:
 *
 *  var MyLink = React.createClass({
 *    propTypes: {
 *      // An optional string or URI prop named "href".
 *      href: function(props, propName, componentName) {
 *        var propValue = props[propName];
 *        if (propValue != null && typeof propValue !== 'string' &&
 *            !(propValue instanceof URI)) {
 *          return new Error(
 *            'Expected a string or an URI for ' + propName + ' in ' +
 *            componentName
 *          );
 *        }
 *      }
 *    },
 *    render: function() {...}
 *  });
 *
 * @internal
 */

var ANONYMOUS = '<<anonymous>>';

var ReactPropTypes = {
  array: createPrimitiveTypeChecker('array'),
  bool: createPrimitiveTypeChecker('boolean'),
  func: createPrimitiveTypeChecker('function'),
  number: createPrimitiveTypeChecker('number'),
  object: createPrimitiveTypeChecker('object'),
  string: createPrimitiveTypeChecker('string'),

  any: createAnyTypeChecker(),
  arrayOf: createArrayOfTypeChecker,
  element: createElementTypeChecker(),
  instanceOf: createInstanceTypeChecker,
  node: createNodeChecker(),
  objectOf: createObjectOfTypeChecker,
  oneOf: createEnumTypeChecker,
  oneOfType: createUnionTypeChecker,
  shape: createShapeTypeChecker
};

function createChainableTypeChecker(validate) {
  function checkType(isRequired, props, propName, componentName, location, propFullName) {
    componentName = componentName || ANONYMOUS;
    propFullName = propFullName || propName;
    if (props[propName] == null) {
      var locationName = ReactPropTypeLocationNames[location];
      if (isRequired) {
        return new Error('Required ' + locationName + ' `' + propFullName + '` was not specified in ' + ('`' + componentName + '`.'));
      }
      return null;
    } else {
      return validate(props, propName, componentName, location, propFullName);
    }
  }

  var chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}

function createPrimitiveTypeChecker(expectedType) {
  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== expectedType) {
      var locationName = ReactPropTypeLocationNames[location];
      // `propValue` being instance of, say, date/regexp, pass the 'object'
      // check, but we can offer a more precise error message here rather than
      // 'of type `object`'.
      var preciseType = getPreciseType(propValue);

      return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createAnyTypeChecker() {
  return createChainableTypeChecker(emptyFunction.thatReturns(null));
}

function createArrayOfTypeChecker(typeChecker) {
  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    if (!Array.isArray(propValue)) {
      var locationName = ReactPropTypeLocationNames[location];
      var propType = getPropType(propValue);
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
    }
    for (var i = 0; i < propValue.length; i++) {
      var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']');
      if (error instanceof Error) {
        return error;
      }
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createElementTypeChecker() {
  function validate(props, propName, componentName, location, propFullName) {
    if (!ReactElement.isValidElement(props[propName])) {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a single ReactElement.'));
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createInstanceTypeChecker(expectedClass) {
  function validate(props, propName, componentName, location, propFullName) {
    if (!(props[propName] instanceof expectedClass)) {
      var locationName = ReactPropTypeLocationNames[location];
      var expectedClassName = expectedClass.name || ANONYMOUS;
      var actualClassName = getClassName(props[propName]);
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createEnumTypeChecker(expectedValues) {
  if (!Array.isArray(expectedValues)) {
    return createChainableTypeChecker(function () {
      return new Error('Invalid argument supplied to oneOf, expected an instance of array.');
    });
  }

  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    for (var i = 0; i < expectedValues.length; i++) {
      if (propValue === expectedValues[i]) {
        return null;
      }
    }

    var locationName = ReactPropTypeLocationNames[location];
    var valuesString = JSON.stringify(expectedValues);
    return new Error('Invalid ' + locationName + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
  }
  return createChainableTypeChecker(validate);
}

function createObjectOfTypeChecker(typeChecker) {
  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== 'object') {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
    }
    for (var key in propValue) {
      if (propValue.hasOwnProperty(key)) {
        var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key);
        if (error instanceof Error) {
          return error;
        }
      }
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createUnionTypeChecker(arrayOfTypeCheckers) {
  if (!Array.isArray(arrayOfTypeCheckers)) {
    return createChainableTypeChecker(function () {
      return new Error('Invalid argument supplied to oneOfType, expected an instance of array.');
    });
  }

  function validate(props, propName, componentName, location, propFullName) {
    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (checker(props, propName, componentName, location, propFullName) == null) {
        return null;
      }
    }

    var locationName = ReactPropTypeLocationNames[location];
    return new Error('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
  }
  return createChainableTypeChecker(validate);
}

function createNodeChecker() {
  function validate(props, propName, componentName, location, propFullName) {
    if (!isNode(props[propName])) {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createShapeTypeChecker(shapeTypes) {
  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== 'object') {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
    }
    for (var key in shapeTypes) {
      var checker = shapeTypes[key];
      if (!checker) {
        continue;
      }
      var error = checker(propValue, key, componentName, location, propFullName + '.' + key);
      if (error) {
        return error;
      }
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function isNode(propValue) {
  switch (typeof propValue) {
    case 'number':
    case 'string':
    case 'undefined':
      return true;
    case 'boolean':
      return !propValue;
    case 'object':
      if (Array.isArray(propValue)) {
        return propValue.every(isNode);
      }
      if (propValue === null || ReactElement.isValidElement(propValue)) {
        return true;
      }

      var iteratorFn = getIteratorFn(propValue);
      if (iteratorFn) {
        var iterator = iteratorFn.call(propValue);
        var step;
        if (iteratorFn !== propValue.entries) {
          while (!(step = iterator.next()).done) {
            if (!isNode(step.value)) {
              return false;
            }
          }
        } else {
          // Iterator will provide entry [k,v] tuples rather than values.
          while (!(step = iterator.next()).done) {
            var entry = step.value;
            if (entry) {
              if (!isNode(entry[1])) {
                return false;
              }
            }
          }
        }
      } else {
        return false;
      }

      return true;
    default:
      return false;
  }
}

// Equivalent of `typeof` but with special handling for array and regexp.
function getPropType(propValue) {
  var propType = typeof propValue;
  if (Array.isArray(propValue)) {
    return 'array';
  }
  if (propValue instanceof RegExp) {
    // Old webkits (at least until Android 4.0) return 'function' rather than
    // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
    // passes PropTypes.object.
    return 'object';
  }
  return propType;
}

// This handles more types than `getPropType`. Only used for error messages.
// See `createPrimitiveTypeChecker`.
function getPreciseType(propValue) {
  var propType = getPropType(propValue);
  if (propType === 'object') {
    if (propValue instanceof Date) {
      return 'date';
    } else if (propValue instanceof RegExp) {
      return 'regexp';
    }
  }
  return propType;
}

// Returns class name of the object, if any.
function getClassName(propValue) {
  if (!propValue.constructor || !propValue.constructor.name) {
    return '<<anonymous>>';
  }
  return propValue.constructor.name;
}

module.exports = ReactPropTypes;
},{"./ReactElement":10,"./ReactPropTypeLocationNames":11,"./getIteratorFn":15,"fbjs/lib/emptyFunction":16}],14:[function(_dereq_,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule canDefineProperty
 */

'use strict';

var canDefineProperty = false;
if ("production" !== 'production') {
  try {
    Object.defineProperty({}, 'x', { get: function () {} });
    canDefineProperty = true;
  } catch (x) {
    // IE will fail on defineProperty
  }
}

module.exports = canDefineProperty;
},{}],15:[function(_dereq_,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getIteratorFn
 * @typechecks static-only
 */

'use strict';

/* global Symbol */
var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

/**
 * Returns the iterator method function contained on the iterable object.
 *
 * Be sure to invoke the function with the iterable as context:
 *
 *     var iteratorFn = getIteratorFn(myIterable);
 *     if (iteratorFn) {
 *       var iterator = iteratorFn.call(myIterable);
 *       ...
 *     }
 *
 * @param {?object} maybeIterable
 * @return {?function}
 */
function getIteratorFn(maybeIterable) {
  var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
}

module.exports = getIteratorFn;
},{}],16:[function(_dereq_,module,exports){
module.exports=_dereq_(6)
},{}],17:[function(_dereq_,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

function invariant(condition, format, a, b, c, d, e, f) {
  if ("production" !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
},{}],18:[function(_dereq_,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule keyMirror
 * @typechecks static-only
 */

'use strict';

var invariant = _dereq_('./invariant');

/**
 * Constructs an enumeration with keys equal to their value.
 *
 * For example:
 *
 *   var COLORS = keyMirror({blue: null, red: null});
 *   var myColor = COLORS.blue;
 *   var isColorValid = !!COLORS[myColor];
 *
 * The last line could not be performed if the values of the generated enum were
 * not equal to their keys.
 *
 *   Input:  {key1: val1, key2: val2}
 *   Output: {key1: key1, key2: key2}
 *
 * @param {object} obj
 * @return {object}
 */
var keyMirror = function (obj) {
  var ret = {};
  var key;
  !(obj instanceof Object && !Array.isArray(obj)) ? "production" !== 'production' ? invariant(false, 'keyMirror(...): Argument must be an object.') : invariant(false) : undefined;
  for (key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = key;
  }
  return ret;
};

module.exports = keyMirror;
},{"./invariant":17}],19:[function(_dereq_,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule warning
 */

'use strict';

var emptyFunction = _dereq_('./emptyFunction');

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if ("production" !== 'production') {
  warning = function (condition, format) {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    if (format === undefined) {
      throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
    }

    if (format.indexOf('Failed Composite propType: ') === 0) {
      return; // Ignore CompositeComponent proptype check.
    }

    if (!condition) {
      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    }
  };
}

module.exports = warning;
},{"./emptyFunction":16}]},{},[4])
(4)
});