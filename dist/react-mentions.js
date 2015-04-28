!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.ReactMentions=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var emptyFunction = _dereq_('react/lib/emptyFunction');
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
     *  function (event, ui) {}
     * ```
     *
     * `event` is the Event that was triggered.
     * `ui` is an object:
     *
     * ```js
     *  {
     *      position: {top: 0, left: 0}
     *  }
     * ```
     */
    onAdd: React.PropTypes.func,

    renderSuggestion: React.PropTypes.func,

  },

  getDefaultProps: function () {
    return {
      trigger: "@",
      onAdd: emptyFunction,
      onRemove: emptyFunction,
      renderSuggestion: null
    };
  },

  render: function() {
    return (
      React.createElement("strong", null,  this.props.display)
    );
  }

});

},{"./utils":5,"react/lib/emptyFunction":14}],2:[function(_dereq_,module,exports){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var LinkedValueUtils = _dereq_('react/lib/LinkedValueUtils');
var emptyFunction = _dereq_('react/lib/emptyFunction');


var utils = _dereq_('./utils');
var Mention = _dereq_('./Mention');
var SuggestionsOverlay = _dereq_('./SuggestionsOverlay');


var _generateComponentKey = function(usedKeys, id) {
  if(!usedKeys.hasOwnProperty(id)) {
    usedKeys[id] = 0;
  } else {
    usedKeys[id]++;
  }
  return id + "_" + usedKeys[id];
};

var _getTriggerRegex = function(trigger) {
  if(trigger instanceof RegExp) {
    return trigger;
  } else {
    var escapedTriggerChar = utils.escapeRegex(trigger);

    // first capture group is the part to be replaced on completion
    // second capture group is for extracting the search query
    return new RegExp("(?:^|\\s)(" + escapedTriggerChar + "([^\\s" + escapedTriggerChar + "]*))$");
  }
};

var _getDataProvider = function(data) {
  if(data instanceof Array) {
    // if data is an array, create a function to query that
    return function(query, callback) {
      var results = [];
      for(var i=0, l=data.length; i < l; ++i) {
        var display = data[i].display || data[i].id;
        if(display.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
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

var displayIdentity = function (id, display, type) {
  return display;
};

var KEY = { TAB : 9, RETURN : 13, ESC : 27, UP : 38, DOWN : 40 };

module.exports = React.createClass({

  displayName: 'MentionsInput',

  mixins: [
    LinkedValueUtils.Mixin
  ],

  propTypes: {

    /**
     * If set to `true` a regular text input element will be rendered
     * instead of a textarea
     */
    singleLine: React.PropTypes.bool,

    markup: React.PropTypes.string,

    displayTransform: React.PropTypes.func

  },

  getDefaultProps: function () {
    return {
      markup: "@[__display__](__id__)",
      singleLine: false,
      displayTransform: displayIdentity,

      onKeyDown: emptyFunction,
      onSelect: emptyFunction,
      onBlur: emptyFunction
    };
  },

  getInitialState: function () {
    return {
      selectionStart: null,
      selectionEnd: null,

      suggestions: {}
    };
  },

  render: function() {
    return (
      React.createElement("div", {className: "react-mentions"}, 
        React.createElement("div", {className: "control " + (this.props.singleLine ? "input" : "textarea")}, 
          React.createElement("div", {className: "highlighter", ref: "highlighter"}, 
             this.renderHighlighter() 
          ), 
           this.renderInput() 
        ), 
         this.renderSuggestionsOverlay() 
      )
    );
  },

  renderInput: function() {
    var props = this.getInputProps();

    if(this.props.singleLine) {
      return (
        React.createElement("input", React.__spread({type: "text"},   props ))
      );
    }

    return (
      React.createElement("textarea", React.__spread({},   props ))
    );
  },

  getInputProps: function() {
    var props = {
      ref: "input",
      readOnly: this.props.readOnly,
      disabled: this.props.disabled,
      value: this.getPlainText(),
      placeholder: this.props.placeholder
    };

    if(!this.props.readOnly && !this.props.disabled) {
      props.onChange = this.handleChange;
      props.onSelect = this.handleSelect;
      props.onKeyDown = this.handleKeyDown;
      props.onBlur = this.handleBlur;

      props.onFocus = this.props.onFocus;
    }

    return props;
  },

  renderSuggestionsOverlay: function() {
    if(!utils.isNumber(this.state.selectionStart)) {
      // do not show suggestions when the input does not have the focus
      return null;
    }
    return (
      React.createElement(SuggestionsOverlay, {
        ref: "suggestions", 
        suggestions: this.state.suggestions, 
        onSelect: this.addMention, 
        onMouseDown: this.handleSuggestionsMouseDown})
    );
  },

  renderHighlighter: function() {
    var value = LinkedValueUtils.getValue(this) || "";

    var resultComponents = [];
    var components = resultComponents;
    var componentKeys = {};

    // If there's a caret (i.e. no range selection), get the position of the
    var caretPositionInMarkup;
    if(this.state.selectionStart === this.state.selectionEnd) {
      caretPositionInMarkup = utils.mapPlainTextIndex(value, this.props.markup, this.state.selectionStart, false, this.props.displayTransform);
    }

    var textIteratee = function(substr, index, indexInPlainText) {
      // check whether the caret element has to be inserted inside the current plain substring
      if(utils.isNumber(caretPositionInMarkup) && caretPositionInMarkup >= index && caretPositionInMarkup <= index + substr.length) {
        // if yes, split substr at the caret position and insert the caret component
        var splitIndex = caretPositionInMarkup - index;
        components.push(substr.substring(0, splitIndex));
        var caretComponent = this.renderHighlighterCaret();
        resultComponents.push(caretComponent);

        // add all following substrings and mention components as children of the caret component
        components = caretComponent.props.children = [ substr.substring(splitIndex) ];
      } else {
        // otherwise just push the plain text substring
        components.push(substr);
      }
    }.bind(this);

    var mentionIteratee = function(markup, index, indexInPlainText, id, display, type, lastMentionEndIndex) {
      // generate a component key based on the id
      var key = _generateComponentKey(componentKeys, id);
      components.push(
        this.getMentionComponentForMatch(id, display, type, key)
      );
    }.bind(this);
    utils.iterateMentionsMarkup(value, this.props.markup, textIteratee, mentionIteratee, this.props.displayTransform, this.props.regexp);

    return resultComponents;
  },

  // Renders an component to be inserted in the highlighter at the current caret position
  renderHighlighterCaret: function() {
    return (
      React.createElement("span", {className: "caret-marker", ref: "caret", key: "caret"}, 
         this.renderSuggestionsOverlay() 
      )
    );
  },

  // Returns a clone of the Mention child applicable for the specified type to be rendered inside the highlighter
  getMentionComponentForMatch: function(id, display, type, key) {
    var childrenCount = React.Children.count(this.props.children);
    var props = { id: id, display: display, key: key };

    if(childrenCount > 1) {
      if(!type) {
        throw new Error(
          "Since multiple Mention components have been passed as children, the markup has to define the __type__ placeholder"
        );
      }

      // detect the Mention child to be cloned
      var foundChild = null;
      React.Children.forEach(this.props.children, function(child) {
        if(child.props.type === type) {
          foundChild = child;
        }
      });

      // clone the Mention child that is applicable for the given type
      return React.addons.cloneWithProps(foundChild, props);
    } else if(childrenCount === 1) {
      // clone single Mention child
      var child = this.props.children.length ? this.props.children[0] : React.Children.only(this.props.children);
      return React.addons.cloneWithProps(child, props );
    } else {
      // no children, use default configuration
      return Mention(props);
    }
  },

  // Returns the text to set as the value of the textarea with all markups removed
  getPlainText: function() {
    var value = LinkedValueUtils.getValue(this) || "";
    return utils.getPlainText(value, this.props.markup, this.props.displayTransform, this.props.regexp);
  },

  // Handle input element's change event
  handleChange: function(ev) {

    if(document.activeElement !== ev.target) {
      // fix an IE bug (blur from empty input element with placeholder attribute trigger "input" event)
      return;
    }

    var value = LinkedValueUtils.getValue(this) || "";
    var newPlainTextValue = ev.target.value;

    // Derive the new value to set by applying the local change in the textarea's plain text
    var newValue = utils.applyChangeToValue(
      value, this.props.markup,
      newPlainTextValue,
      this.state.selectionStart, this.state.selectionEnd,
      ev.target.selectionEnd,
      this.props.displayTransform
    );

    // Save current selection after change to be able to restore caret position after rerendering
    var selectionStart = ev.target.selectionStart;
    var selectionEnd = ev.target.selectionEnd;

    // Adjust selection range in case a mention will be deleted by the characters outside of the
    // selection range that are automatically deleted
    var startOfMention = utils.findStartOfMentionInPlainText(value, this.props.markup, selectionStart, this.props.displayTransform);
    if(this.state.selectionEnd > startOfMention) {
      // only if a deletion has taken place
      selectionStart = startOfMention;
      selectionEnd = selectionStart;
    }

    this.setState({
      selectionStart: selectionStart,
      selectionEnd: selectionEnd
    });

    // Propagate change
    var handleChange = LinkedValueUtils.getOnChange(this) || emptyFunction;
    var eventMock = { target: { value: newValue } };
    handleChange.call(this, eventMock, newValue);
  },

  // Handle input element's select event
  handleSelect: function(ev) {
    // keep track of selection range / caret position
    this.setState({
      selectionStart: ev.target.selectionStart,
      selectionEnd: ev.target.selectionEnd
    });

    // refresh suggestions queries
    var el = this.refs.input.getDOMNode();
    if(ev.target.selectionStart === ev.target.selectionEnd) {
      this.updateMentionsQueries(el.value, ev.target.selectionStart);
    } else {
      this.clearSuggestions();
    }

    // sync highlighters scroll position
    this.updateHighlighterScroll();

    this.props.onSelect(ev);
  },

  handleKeyDown: function(ev) {
    var keyHandlers = {};

    // do not intercept key events if the suggestions overlay is not shown
    var suggestionsCount = 0;
    for(var prop in this.state.suggestions) {
      if(this.state.suggestions.hasOwnProperty(prop)) {
        suggestionsCount += this.state.suggestions[prop].results.length;
      }
    }

    var suggestionsComp = this.refs.suggestions;
    if(suggestionsCount > 0 && suggestionsComp) {
      keyHandlers[KEY.ESC] = this.clearSuggestions;
      keyHandlers[KEY.DOWN] = suggestionsComp.shiftFocus.bind(null, +1);
      keyHandlers[KEY.UP] = suggestionsComp.shiftFocus.bind(null, -1);
      keyHandlers[KEY.RETURN] = suggestionsComp.selectFocused;
      keyHandlers[KEY.TAB] = suggestionsComp.selectFocused;
    }

    if(keyHandlers[ev.keyCode]) {
      keyHandlers[ev.keyCode]();
      ev.preventDefault();
    } else {
      this.props.onKeyDown(ev);
    }
  },

  handleBlur: function(ev) {
    // only reset selection if the mousdown happened on an element
    // other than the suggestions overlay
    if(!this._suggestionsMouseDown) {
      this.setState({
        selectionStart: null,
        selectionEnd: null
      });
    };
    this._suggestionsMouseDown = false;

    var that = this;
    window.setTimeout(function() {
      that.updateHighlighterScroll();
    }, 1);

    this.props.onBlur(ev);
  },

  handleSuggestionsMouseDown: function(ev) {
    this._suggestionsMouseDown = true;
  },

  autogrowTextarea: function() {
    var el = this.refs.input.getDOMNode();
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  },

  updateSuggestionsPosition: function() {
    if(!this.refs.caret || !this.refs.suggestions) return;

    var caretEl = this.refs.caret.getDOMNode();
    var suggestionsEl = this.refs.suggestions.getDOMNode();
    var highligherEl = this.refs.highlighter.getDOMNode();
    if(!suggestionsEl) return;

    suggestionsEl.style.left = caretEl.offsetLeft - highligherEl.scrollLeft + "px";
    suggestionsEl.style.top = caretEl.offsetTop - highligherEl.scrollTop + "px";
  },

  updateHighlighterScroll: function() {
    if(!this.refs.input || !this.refs.highlighter) {
      // since the invocation of this function is deferred,
      // the whole component may have been unmounted in the meanwhile
      return;
    }
    var input = this.refs.input.getDOMNode();
    var highlighter = this.refs.highlighter.getDOMNode();
    highlighter.scrollLeft = input.scrollLeft;
  },

  componentDidMount: function() {
    this.autogrowTextarea();
    this.updateSuggestionsPosition();
  },

  componentDidUpdate: function() {
    this.autogrowTextarea();
    this.updateSuggestionsPosition();

    // maintain selection in case a mention is added/removed causing
    // the cursor to jump to the end
    this.setSelection(this.state.selectionStart, this.state.selectionEnd);
  },

  setSelection: function(selectionStart, selectionEnd) {
    if(selectionStart === null || selectionEnd === null) return;

    var el = this.refs.input.getDOMNode();
    if(el.setSelectionRange) {
      el.setSelectionRange(selectionStart, selectionEnd);
    }
    else if(el.createTextRange) {
      var range = el.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      range.select();
    }
  },

  updateMentionsQueries: function(plainTextValue, caretPosition) {
    // Invalidate previous queries. Async results for previous queries will be neglected.
    this._queryId++;
    this.setState({
      suggestions: {}
    });

    // If caret is inside of or directly behind of mention, do not query
    var value = LinkedValueUtils.getValue(this) || "";
    if( utils.isInsideOfMention(value, this.props.markup, caretPosition, this.props.displayTransform) ||
        utils.isInsideOfMention(value, this.props.markup, caretPosition-1, this.props.displayTransform) ) {
      return;
    }

    // Check if suggestions have to be shown:
    // Match the trigger patterns of all Mention children the new plain text substring up to the current caret position
    var substring = plainTextValue.substring(0, caretPosition);

    var that = this;
    React.Children.forEach(this.props.children, function(child) {
      var regex = _getTriggerRegex(child.props.trigger);
      var match = substring.match(regex);
      if(match) {
        var querySequenceStart = substring.indexOf(match[1], match.index);
        that.queryData(match[2], child, querySequenceStart, querySequenceStart+match[1].length);
      }
    });
  },

  clearSuggestions: function() {
    // Invalidate previous queries. Async results for previous queries will be neglected.
    this._queryId++;
    this.setState({
      suggestions: {}
    });
  },

  queryData: function(query, mentionDescriptor, querySequenceStart, querySequenceEnd) {
    var provideData = _getDataProvider(mentionDescriptor.props.data);
    var snycResult = provideData(query, this.updateSuggestions.bind(null, this._queryId, mentionDescriptor, query, querySequenceStart, querySequenceEnd));
    if(snycResult instanceof Array) {
      this.updateSuggestions(this._queryId, mentionDescriptor, query, querySequenceStart, querySequenceEnd, snycResult);
    }
  },

  updateSuggestions: function(queryId, mentionDescriptor, query, querySequenceStart, querySequenceEnd, suggestions) {
    // neglect async results from previous queries
    if(queryId !== this._queryId) return;

    var update = {};
    update[mentionDescriptor.type] = {
      query: query,
      mentionDescriptor: mentionDescriptor,
      querySequenceStart: querySequenceStart,
      querySequenceEnd: querySequenceEnd,
      results: suggestions
    };

    this.setState({
      suggestions: utils.extend({}, this.state.suggestions, update)
    });
  },

  addMention: function(suggestion, mentionDescriptor, querySequenceStart, querySequenceEnd) {
    // Insert mention in the marked up value at the correct position
    var value = LinkedValueUtils.getValue(this) || "";
    var start = utils.mapPlainTextIndex(value, this.props.markup, querySequenceStart, false, this.props.displayTransform);
    var end = start + querySequenceEnd - querySequenceStart;
    var insert = utils.makeMentionsMarkup(this.props.markup, suggestion.id, suggestion.display, mentionDescriptor.props.type);
    var newValue = utils.spliceString(value, start, end, insert);

    // Refocus input and set caret position to end of mention
    this.refs.input.getDOMNode().focus();
    
    var displayValue = this.props.displayTransform(suggestion.id, suggestion.display, mentionDescriptor.props.type);
    var newCaretPosition = querySequenceStart + displayValue.length;
    this.setState({
      selectionStart: newCaretPosition,
      selectionEnd: newCaretPosition
    });

    // Propagate change
    var handleChange = LinkedValueUtils.getOnChange(this) || emptyFunction;
    var eventMock = { target: { value: newValue }};
    handleChange.call(this, eventMock, newValue);

    // Make sure the suggestions overlay is closed
    this.clearSuggestions();
  },

  _queryId: 0


});

},{"./Mention":1,"./SuggestionsOverlay":3,"./utils":5,"react/lib/LinkedValueUtils":6,"react/lib/emptyFunction":14}],3:[function(_dereq_,module,exports){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var emptyFunction = _dereq_('react/lib/emptyFunction');
var utils = _dereq_('./utils');






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
      React.createElement("li", {key: id, ref: isFocused && "focused", className: cls, onClick: handleClick, onMouseEnter: this.handleMouseEnter.bind(null, index)}, 
        content 
      )
    );
  },

  renderHighlightedDisplay: function(display, query) {
    var i = display.toLowerCase().indexOf(query.toLowerCase());
    if(i === -1) return React.createElement("span", null, display );

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

  select: function(suggestion, mentionDescriptor, querySequenceStart, querySequenceEnd) {
    this.props.onSelect(suggestion, mentionDescriptor, querySequenceStart, querySequenceEnd);
  },

  selectFocused: function() {
    // call click handler of the focused element
    this.refs.focused.props.onClick();
  },

  shiftFocus: function(delta) {
    var suggestionsCount = this.countSuggestions();
    var newIndex = this.state.focusIndex + delta;
    if(newIndex < 0) newIndex = suggestionsCount - newIndex;
    this.setState({
      focusIndex: newIndex % suggestionsCount
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

},{"./utils":5,"react/lib/emptyFunction":14}],4:[function(_dereq_,module,exports){
module.exports = {
  MentionsInput: _dereq_('./MentionsInput'),
  Mention: _dereq_('./Mention')
};

},{"./Mention":1,"./MentionsInput":2}],5:[function(_dereq_,module,exports){
var PLACEHOLDERS = {
  id: "__id__",
  display: "__display__",
  type: "__type__"
}

var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};
var createEscaper = function(map) {
  var escaper = function(match) {
    return map[match];
  };
  var keys = [];
  for(var key in map) {
    if(map.hasOwnProperty(key)) keys.push(key);
  }
  var source = '(?:' + keys.join('|') + ')';
  var testRegexp = RegExp(source);
  var replaceRegexp = RegExp(source, 'g');
  return function(string) {
    string = string == null ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
};

var numericComparator = function(a, b) {
  a = a === null ? Number.MAX_VALUE : a;
  b = b === null ? Number.MAX_VALUE : b;
  return a - b;
};

module.exports = {

  escapeHtml: createEscaper(escapeMap),

  escapeRegex: function(str) {
      return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  },

  countCapturingGroups: function (regex) {
    return (new RegExp(regex.toString() + '|')).exec('').length - 1;
  },

  markupToRegex: function(markup) {
    var markupPattern = this.escapeRegex(markup);
    markupPattern = markupPattern.replace(PLACEHOLDERS.display, "(.+?)");
    markupPattern = markupPattern.replace(PLACEHOLDERS.id, "(.+?)");
    markupPattern = markupPattern.replace(PLACEHOLDERS.type, "(.+?)");
    return new RegExp(markupPattern, "g");
  },

  spliceString: function(str, start, end, insert) {
    return str.substring(0, start) + insert + str.substring(end);
  },

  extend: function(obj) {
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

  isNumber: function(obj) {
    return Object.prototype.toString.call(obj) === "[object Number]";
  },

  /**
   * parameterName: "id", "display", or "type"
   */
  getPositionOfCapturingGroup: function(markup, parameterName, regex) {
    if(parameterName !== "id" && parameterName !== "display" && parameterName !== "type") {
      throw new Error("parameterName must be 'id', 'display', or 'type'");
    }

    // calculate positions of placeholders in the markup
    var indexDisplay = markup.indexOf(PLACEHOLDERS.display);
    var indexId = markup.indexOf(PLACEHOLDERS.id);
    var indexType = markup.indexOf(PLACEHOLDERS.type);

    // set indices to null if not found
    if(indexDisplay < 0) indexDisplay = null;
    if(indexId < 0) indexId = null;
    if(indexType < 0) indexType = null;

    if(indexDisplay === null && indexId === null) {
      // markup contains none of the mandatory placeholders
      throw new Error("The markup `" + markup + "` must contain at least one of the placeholders `__id__` or `__display__`");
    }

    if(indexType === null && parameterName === "type") {
      // markup does not contain optional __type__ placeholder
      return null; 
    }

    // sort indices in ascending order (null values will always be at the end)
    var sortedIndices = [indexDisplay, indexId, indexType].sort(numericComparator);

    // If only one the placeholders __id__ and __display__ is present, 
    // use the captured string for both parameters, id and display
    if(indexDisplay === null) indexDisplay = indexId;
    if(indexId === null) indexId = indexDisplay;

    if(regex && this.countCapturingGroups(regex) === 0) {
      // custom regex does not use any capturing groups, so use the full match for ID and display
      return parameterName === "type" ? null : 0;
    }

    var argOffset = 1; // first argument always is the full match
    if(parameterName === "id") return sortedIndices.indexOf(indexId) + argOffset;
    if(parameterName === "display") return sortedIndices.indexOf(indexDisplay) + argOffset;
    if(parameterName === "type") return indexType === null ? null : sortedIndices.indexOf(indexType) + argOffset;

  },

  // Finds all occurences of the markup in the value and iterates the plain text sub strings
  // in between those markups using `textIteratee` and the markup occurrences using the
  // `markupIteratee`.
  iterateMentionsMarkup: function(value, markup, textIteratee, markupIteratee, displayTransform, regex) {
    regex = regex || this.markupToRegex(markup);

    var displayPos = this.getPositionOfCapturingGroup(markup, "display", regex);
    var idPos = this.getPositionOfCapturingGroup(markup, "id", regex);
    var typePos = this.getPositionOfCapturingGroup(markup, "type", regex);

    var match;
    var start = 0;
    var currentPlainTextIndex = 0;

    // detect all mention markup occurences in the value and iterate the matches
    while((match = regex.exec(value)) !== null) {

      var id = match[idPos];
      var display = match[displayPos];
      var type = typePos ? match[typePos] : null;

      if(displayTransform) display = displayTransform(id, display, type);

      var substr = value.substring(start, match.index);
      textIteratee( substr, start, currentPlainTextIndex );
      currentPlainTextIndex += substr.length;

      markupIteratee( match[0], match.index, currentPlainTextIndex, id, display, type, start );
      currentPlainTextIndex += display.length;

      start = regex.lastIndex;
    }

    if(start < value.length) {
      textIteratee( value.substring(start), start, currentPlainTextIndex );
    }
  },

  // For the passed character index in the plain text string, returns the corresponding index
  // in the marked up value string.
  // If the passed character index lies inside a mention, returns the index of the mention 
  // markup's first char, or respectively tho one after its last char, if the flag `toEndOfMarkup` is set.
  mapPlainTextIndex: function(value, markup, indexInPlainText, toEndOfMarkup, displayTransform) {
    if(!this.isNumber(indexInPlainText)) {
      return indexInPlainText;
    }

    var result;
    var textIteratee = function(substr, index, substrPlainTextIndex) {
      if(result !== undefined) return;

      if(substrPlainTextIndex + substr.length >= indexInPlainText) {
        // found the corresponding position in the current plain text range
        result = index + indexInPlainText - substrPlainTextIndex;
      }
    };
    var markupIteratee = function(markup, index, mentionPlainTextIndex, id, display, type, lastMentionEndIndex) {
      if(result !== undefined) return;

      if(mentionPlainTextIndex + display.length > indexInPlainText) {
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
  findStartOfMentionInPlainText: function(value, markup, indexInPlainText, displayTransform) {
    var result = indexInPlainText;
    var markupIteratee = function(markup, index, mentionPlainTextIndex, id, display, type, lastMentionEndIndex) {
      if(mentionPlainTextIndex < indexInPlainText && mentionPlainTextIndex + display.length > indexInPlainText) {
        result = mentionPlainTextIndex;
      }
    };
    this.iterateMentionsMarkup(value, markup, function(){}, markupIteratee, displayTransform);
    return result;
  },

  // Returns whether the given plain text index lies inside a mention
  isInsideOfMention: function(value, markup, indexInPlainText, displayTransform) {
    return this.findStartOfMentionInPlainText(value, markup, indexInPlainText, displayTransform) !== indexInPlainText;
  },

  // Applies a change from the plain text textarea to the underlying marked up value
  // guided by the textarea text selection ranges before and after the change 
  applyChangeToValue: function(value, markup, plainTextValue, selectionStartBeforeChange, selectionEndBeforeChange, selectionEndAfterChange, displayTransform) {
    // extract the insertion from the new plain text value
    var insert = plainTextValue.slice(selectionStartBeforeChange, selectionEndAfterChange);

    // handling for Backspace key with no range selection
    var spliceStart = Math.min(selectionStartBeforeChange, selectionEndAfterChange);

    var spliceEnd = selectionEndBeforeChange;
    if(selectionStartBeforeChange === selectionEndAfterChange) {
      var oldPlainTextValue = this.getPlainText(value, markup, displayTransform);
      var lengthDelta = oldPlainTextValue.length - plainTextValue.length;
      // handling for Delete key with no range selection
      spliceEnd = Math.max(selectionEndBeforeChange, selectionStartBeforeChange + lengthDelta);
    }
    
    // splice the current marked up value and insert new chars
    return this.spliceString(
      value,
      this.mapPlainTextIndex(value, markup, spliceStart, false, displayTransform),
      this.mapPlainTextIndex(value, markup, spliceEnd, true, displayTransform),
      insert
    );
  },

  getPlainText: function(value, markup, displayTransform, regex) {
    regex = regex || this.markupToRegex(markup);

    var idPos = this.getPositionOfCapturingGroup(markup, "id", regex);
    var displayPos = this.getPositionOfCapturingGroup(markup, "display", regex);
    var typePos = this.getPositionOfCapturingGroup(markup, "type", regex);
    return value.replace(regex, function() {
      // first argument is the whole match, capturing groups are following
      var id = arguments[idPos];
      var display = arguments[displayPos];
      var type = arguments[typePos];
      if(displayTransform) display = displayTransform(id, display, type);
      return display;
    });
  },

  makeMentionsMarkup: function(markup, id, display, type) {
    var result = markup.replace(PLACEHOLDERS.id, id);
    result = result.replace(PLACEHOLDERS.display, display);
    result = result.replace(PLACEHOLDERS.type, type);
    return result;
  }

}
},{}],6:[function(_dereq_,module,exports){
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

var ReactPropTypes = _dereq_("./ReactPropTypes");

var invariant = _dereq_("./invariant");

var hasReadOnlyValue = {
  'button': true,
  'checkbox': true,
  'image': true,
  'hidden': true,
  'radio': true,
  'reset': true,
  'submit': true
};

function _assertSingleLink(input) {
  ("production" !== "production" ? invariant(
    input.props.checkedLink == null || input.props.valueLink == null,
    'Cannot provide a checkedLink and a valueLink. If you want to use ' +
    'checkedLink, you probably don\'t want to use valueLink and vice versa.'
  ) : invariant(input.props.checkedLink == null || input.props.valueLink == null));
}
function _assertValueLink(input) {
  _assertSingleLink(input);
  ("production" !== "production" ? invariant(
    input.props.value == null && input.props.onChange == null,
    'Cannot provide a valueLink and a value or onChange event. If you want ' +
    'to use value or onChange, you probably don\'t want to use valueLink.'
  ) : invariant(input.props.value == null && input.props.onChange == null));
}

function _assertCheckedLink(input) {
  _assertSingleLink(input);
  ("production" !== "production" ? invariant(
    input.props.checked == null && input.props.onChange == null,
    'Cannot provide a checkedLink and a checked property or onChange event. ' +
    'If you want to use checked or onChange, you probably don\'t want to ' +
    'use checkedLink'
  ) : invariant(input.props.checked == null && input.props.onChange == null));
}

/**
 * @param {SyntheticEvent} e change event to handle
 */
function _handleLinkedValueChange(e) {
  /*jshint validthis:true */
  this.props.valueLink.requestChange(e.target.value);
}

/**
  * @param {SyntheticEvent} e change event to handle
  */
function _handleLinkedCheckChange(e) {
  /*jshint validthis:true */
  this.props.checkedLink.requestChange(e.target.checked);
}

/**
 * Provide a linked `value` attribute for controlled forms. You should not use
 * this outside of the ReactDOM controlled form components.
 */
var LinkedValueUtils = {
  Mixin: {
    propTypes: {
      value: function(props, propName, componentName) {
        if (!props[propName] ||
            hasReadOnlyValue[props.type] ||
            props.onChange ||
            props.readOnly ||
            props.disabled) {
          return null;
        }
        return new Error(
          'You provided a `value` prop to a form field without an ' +
          '`onChange` handler. This will render a read-only field. If ' +
          'the field should be mutable use `defaultValue`. Otherwise, ' +
          'set either `onChange` or `readOnly`.'
        );
      },
      checked: function(props, propName, componentName) {
        if (!props[propName] ||
            props.onChange ||
            props.readOnly ||
            props.disabled) {
          return null;
        }
        return new Error(
          'You provided a `checked` prop to a form field without an ' +
          '`onChange` handler. This will render a read-only field. If ' +
          'the field should be mutable use `defaultChecked`. Otherwise, ' +
          'set either `onChange` or `readOnly`.'
        );
      },
      onChange: ReactPropTypes.func
    }
  },

  /**
   * @param {ReactComponent} input Form component
   * @return {*} current value of the input either from value prop or link.
   */
  getValue: function(input) {
    if (input.props.valueLink) {
      _assertValueLink(input);
      return input.props.valueLink.value;
    }
    return input.props.value;
  },

  /**
   * @param {ReactComponent} input Form component
   * @return {*} current checked status of the input either from checked prop
   *             or link.
   */
  getChecked: function(input) {
    if (input.props.checkedLink) {
      _assertCheckedLink(input);
      return input.props.checkedLink.value;
    }
    return input.props.checked;
  },

  /**
   * @param {ReactComponent} input Form component
   * @return {function} change callback either from onChange prop or link.
   */
  getOnChange: function(input) {
    if (input.props.valueLink) {
      _assertValueLink(input);
      return _handleLinkedValueChange;
    } else if (input.props.checkedLink) {
      _assertCheckedLink(input);
      return _handleLinkedCheckChange;
    }
    return input.props.onChange;
  }
};

module.exports = LinkedValueUtils;

},{"./ReactPropTypes":13,"./invariant":16}],7:[function(_dereq_,module,exports){
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

},{}],8:[function(_dereq_,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactContext
 */

'use strict';

var assign = _dereq_("./Object.assign");
var emptyObject = _dereq_("./emptyObject");
var warning = _dereq_("./warning");

var didWarn = false;

/**
 * Keeps track of the current context.
 *
 * The context is automatically passed down the component ownership hierarchy
 * and is accessible via `this.context` on ReactCompositeComponents.
 */
var ReactContext = {

  /**
   * @internal
   * @type {object}
   */
  current: emptyObject,

  /**
   * Temporarily extends the current context while executing scopedCallback.
   *
   * A typical use case might look like
   *
   *  render: function() {
   *    var children = ReactContext.withContext({foo: 'foo'}, () => (
   *
   *    ));
   *    return <div>{children}</div>;
   *  }
   *
   * @param {object} newContext New context to merge into the existing context
   * @param {function} scopedCallback Callback to run with the new context
   * @return {ReactComponent|array<ReactComponent>}
   */
  withContext: function(newContext, scopedCallback) {
    if ("production" !== "production") {
      ("production" !== "production" ? warning(
        didWarn,
        'withContext is deprecated and will be removed in a future version. ' +
        'Use a wrapper component with getChildContext instead.'
      ) : null);

      didWarn = true;
    }

    var result;
    var previousContext = ReactContext.current;
    ReactContext.current = assign({}, previousContext, newContext);
    try {
      result = scopedCallback();
    } finally {
      ReactContext.current = previousContext;
    }
    return result;
  }

};

module.exports = ReactContext;

},{"./Object.assign":7,"./emptyObject":15,"./warning":17}],9:[function(_dereq_,module,exports){
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
 *
 * The depth indicate how many composite components are above this render level.
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

var ReactContext = _dereq_("./ReactContext");
var ReactCurrentOwner = _dereq_("./ReactCurrentOwner");

var assign = _dereq_("./Object.assign");
var warning = _dereq_("./warning");

var RESERVED_PROPS = {
  key: true,
  ref: true
};

/**
 * Warn for mutations.
 *
 * @internal
 * @param {object} object
 * @param {string} key
 */
function defineWarningProperty(object, key) {
  Object.defineProperty(object, key, {

    configurable: false,
    enumerable: true,

    get: function() {
      if (!this._store) {
        return null;
      }
      return this._store[key];
    },

    set: function(value) {
      ("production" !== "production" ? warning(
        false,
        'Don\'t set the %s property of the React element. Instead, ' +
        'specify the correct value when initially creating the element.',
        key
      ) : null);
      this._store[key] = value;
    }

  });
}

/**
 * This is updated to true if the membrane is successfully created.
 */
var useMutationMembrane = false;

/**
 * Warn for mutations.
 *
 * @internal
 * @param {object} element
 */
function defineMutationMembrane(prototype) {
  try {
    var pseudoFrozenProperties = {
      props: true
    };
    for (var key in pseudoFrozenProperties) {
      defineWarningProperty(prototype, key);
    }
    useMutationMembrane = true;
  } catch (x) {
    // IE will fail on defineProperty
  }
}

/**
 * Base constructor for all React elements. This is only used to make this
 * work with a dynamic instanceof check. Nothing should live on this prototype.
 *
 * @param {*} type
 * @param {string|object} ref
 * @param {*} key
 * @param {*} props
 * @internal
 */
var ReactElement = function(type, key, ref, owner, context, props) {
  // Built-in properties that belong on the element
  this.type = type;
  this.key = key;
  this.ref = ref;

  // Record the component responsible for creating this element.
  this._owner = owner;

  // TODO: Deprecate withContext, and then the context becomes accessible
  // through the owner.
  this._context = context;

  if ("production" !== "production") {
    // The validation flag and props are currently mutative. We put them on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    this._store = {props: props, originalProps: assign({}, props)};

    // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.
    try {
      Object.defineProperty(this._store, 'validated', {
        configurable: false,
        enumerable: false,
        writable: true
      });
    } catch (x) {
    }
    this._store.validated = false;

    // We're not allowed to set props directly on the object so we early
    // return and rely on the prototype membrane to forward to the backing
    // store.
    if (useMutationMembrane) {
      Object.freeze(this);
      return;
    }
  }

  this.props = props;
};

// We intentionally don't expose the function on the constructor property.
// ReactElement should be indistinguishable from a plain object.
ReactElement.prototype = {
  _isReactElement: true
};

if ("production" !== "production") {
  defineMutationMembrane(ReactElement.prototype);
}

ReactElement.createElement = function(type, config, children) {
  var propName;

  // Reserved names are extracted
  var props = {};

  var key = null;
  var ref = null;

  if (config != null) {
    ref = config.ref === undefined ? null : config.ref;
    key = config.key === undefined ? null : '' + config.key;
    // Remaining properties are added to a new props object
    for (propName in config) {
      if (config.hasOwnProperty(propName) &&
          !RESERVED_PROPS.hasOwnProperty(propName)) {
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

  return new ReactElement(
    type,
    key,
    ref,
    ReactCurrentOwner.current,
    ReactContext.current,
    props
  );
};

ReactElement.createFactory = function(type) {
  var factory = ReactElement.createElement.bind(null, type);
  // Expose the type on the factory and the prototype so that it can be
  // easily accessed on elements. E.g. <Foo />.type === Foo.type.
  // This should not be named `constructor` since this may not be the function
  // that created the element, and it may not even be a constructor.
  // Legacy hook TODO: Warn if this is accessed
  factory.type = type;
  return factory;
};

ReactElement.cloneAndReplaceProps = function(oldElement, newProps) {
  var newElement = new ReactElement(
    oldElement.type,
    oldElement.key,
    oldElement.ref,
    oldElement._owner,
    oldElement._context,
    newProps
  );

  if ("production" !== "production") {
    // If the key on the original is valid, then the clone is valid
    newElement._store.validated = oldElement._store.validated;
  }
  return newElement;
};

ReactElement.cloneElement = function(element, config, children) {
  var propName;

  // Original props are copied
  var props = assign({}, element.props);

  // Reserved names are extracted
  var key = element.key;
  var ref = element.ref;

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
      if (config.hasOwnProperty(propName) &&
          !RESERVED_PROPS.hasOwnProperty(propName)) {
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

  return new ReactElement(
    element.type,
    key,
    ref,
    owner,
    element._context,
    props
  );
};

/**
 * @param {?object} object
 * @return {boolean} True if `object` is a valid component.
 * @final
 */
ReactElement.isValidElement = function(object) {
  // ReactTestUtils is often used outside of beforeEach where as React is
  // within it. This leads to two different instances of React on the same
  // page. To identify a element from a different React instance we use
  // a flag instead of an instanceof check.
  var isElement = !!(object && object._isReactElement);
  // if (isElement && !(object instanceof ReactElement)) {
  // This is an indicator that you're using multiple versions of React at the
  // same time. This will screw with ownership and stuff. Fix it, please.
  // TODO: We could possibly warn here.
  // }
  return isElement;
};

module.exports = ReactElement;

},{"./Object.assign":7,"./ReactContext":8,"./ReactCurrentOwner":9,"./warning":17}],11:[function(_dereq_,module,exports){
/**
 * Copyright 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
* @providesModule ReactFragment
*/

'use strict';

var ReactElement = _dereq_("./ReactElement");

var warning = _dereq_("./warning");

/**
 * We used to allow keyed objects to serve as a collection of ReactElements,
 * or nested sets. This allowed us a way to explicitly key a set a fragment of
 * components. This is now being replaced with an opaque data structure.
 * The upgrade path is to call React.addons.createFragment({ key: value }) to
 * create a keyed fragment. The resulting data structure is opaque, for now.
 */

if ("production" !== "production") {
  var fragmentKey = '_reactFragment';
  var didWarnKey = '_reactDidWarn';
  var canWarnForReactFragment = false;

  try {
    // Feature test. Don't even try to issue this warning if we can't use
    // enumerable: false.

    var dummy = function() {
      return 1;
    };

    Object.defineProperty(
      {},
      fragmentKey,
      {enumerable: false, value: true}
    );

    Object.defineProperty(
      {},
      'key',
      {enumerable: true, get: dummy}
    );

    canWarnForReactFragment = true;
  } catch (x) { }

  var proxyPropertyAccessWithWarning = function(obj, key) {
    Object.defineProperty(obj, key, {
      enumerable: true,
      get: function() {
        ("production" !== "production" ? warning(
          this[didWarnKey],
          'A ReactFragment is an opaque type. Accessing any of its ' +
          'properties is deprecated. Pass it to one of the React.Children ' +
          'helpers.'
        ) : null);
        this[didWarnKey] = true;
        return this[fragmentKey][key];
      },
      set: function(value) {
        ("production" !== "production" ? warning(
          this[didWarnKey],
          'A ReactFragment is an immutable opaque type. Mutating its ' +
          'properties is deprecated.'
        ) : null);
        this[didWarnKey] = true;
        this[fragmentKey][key] = value;
      }
    });
  };

  var issuedWarnings = {};

  var didWarnForFragment = function(fragment) {
    // We use the keys and the type of the value as a heuristic to dedupe the
    // warning to avoid spamming too much.
    var fragmentCacheKey = '';
    for (var key in fragment) {
      fragmentCacheKey += key + ':' + (typeof fragment[key]) + ',';
    }
    var alreadyWarnedOnce = !!issuedWarnings[fragmentCacheKey];
    issuedWarnings[fragmentCacheKey] = true;
    return alreadyWarnedOnce;
  };
}

var ReactFragment = {
  // Wrap a keyed object in an opaque proxy that warns you if you access any
  // of its properties.
  create: function(object) {
    if ("production" !== "production") {
      if (typeof object !== 'object' || !object || Array.isArray(object)) {
        ("production" !== "production" ? warning(
          false,
          'React.addons.createFragment only accepts a single object.',
          object
        ) : null);
        return object;
      }
      if (ReactElement.isValidElement(object)) {
        ("production" !== "production" ? warning(
          false,
          'React.addons.createFragment does not accept a ReactElement ' +
          'without a wrapper object.'
        ) : null);
        return object;
      }
      if (canWarnForReactFragment) {
        var proxy = {};
        Object.defineProperty(proxy, fragmentKey, {
          enumerable: false,
          value: object
        });
        Object.defineProperty(proxy, didWarnKey, {
          writable: true,
          enumerable: false,
          value: false
        });
        for (var key in object) {
          proxyPropertyAccessWithWarning(proxy, key);
        }
        Object.preventExtensions(proxy);
        return proxy;
      }
    }
    return object;
  },
  // Extract the original keyed object from the fragment opaque type. Warn if
  // a plain object is passed here.
  extract: function(fragment) {
    if ("production" !== "production") {
      if (canWarnForReactFragment) {
        if (!fragment[fragmentKey]) {
          ("production" !== "production" ? warning(
            didWarnForFragment(fragment),
            'Any use of a keyed object should be wrapped in ' +
            'React.addons.createFragment(object) before being passed as a ' +
            'child.'
          ) : null);
          return fragment;
        }
        return fragment[fragmentKey];
      }
    }
    return fragment;
  },
  // Check if this is a fragment and if so, extract the keyed object. If it
  // is a fragment-like object, warn that it should be wrapped. Ignore if we
  // can't determine what kind of object this is.
  extractIfFragment: function(fragment) {
    if ("production" !== "production") {
      if (canWarnForReactFragment) {
        // If it is the opaque type, return the keyed object.
        if (fragment[fragmentKey]) {
          return fragment[fragmentKey];
        }
        // Otherwise, check each property if it has an element, if it does
        // it is probably meant as a fragment, so we can warn early. Defer,
        // the warning to extract.
        for (var key in fragment) {
          if (fragment.hasOwnProperty(key) &&
              ReactElement.isValidElement(fragment[key])) {
            // This looks like a fragment object, we should provide an
            // early warning.
            return ReactFragment.extract(fragment);
          }
        }
      }
    }
    return fragment;
  }
};

module.exports = ReactFragment;

},{"./ReactElement":10,"./warning":17}],12:[function(_dereq_,module,exports){
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

if ("production" !== "production") {
  ReactPropTypeLocationNames = {
    prop: 'prop',
    context: 'context',
    childContext: 'child context'
  };
}

module.exports = ReactPropTypeLocationNames;

},{}],13:[function(_dereq_,module,exports){
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

var ReactElement = _dereq_("./ReactElement");
var ReactFragment = _dereq_("./ReactFragment");
var ReactPropTypeLocationNames = _dereq_("./ReactPropTypeLocationNames");

var emptyFunction = _dereq_("./emptyFunction");

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

var elementTypeChecker = createElementTypeChecker();
var nodeTypeChecker = createNodeChecker();

var ReactPropTypes = {
  array: createPrimitiveTypeChecker('array'),
  bool: createPrimitiveTypeChecker('boolean'),
  func: createPrimitiveTypeChecker('function'),
  number: createPrimitiveTypeChecker('number'),
  object: createPrimitiveTypeChecker('object'),
  string: createPrimitiveTypeChecker('string'),

  any: createAnyTypeChecker(),
  arrayOf: createArrayOfTypeChecker,
  element: elementTypeChecker,
  instanceOf: createInstanceTypeChecker,
  node: nodeTypeChecker,
  objectOf: createObjectOfTypeChecker,
  oneOf: createEnumTypeChecker,
  oneOfType: createUnionTypeChecker,
  shape: createShapeTypeChecker
};

function createChainableTypeChecker(validate) {
  function checkType(isRequired, props, propName, componentName, location) {
    componentName = componentName || ANONYMOUS;
    if (props[propName] == null) {
      var locationName = ReactPropTypeLocationNames[location];
      if (isRequired) {
        return new Error(
          ("Required " + locationName + " `" + propName + "` was not specified in ") +
          ("`" + componentName + "`.")
        );
      }
      return null;
    } else {
      return validate(props, propName, componentName, location);
    }
  }

  var chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}

function createPrimitiveTypeChecker(expectedType) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== expectedType) {
      var locationName = ReactPropTypeLocationNames[location];
      // `propValue` being instance of, say, date/regexp, pass the 'object'
      // check, but we can offer a more precise error message here rather than
      // 'of type `object`'.
      var preciseType = getPreciseType(propValue);

      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type `" + preciseType + "` ") +
        ("supplied to `" + componentName + "`, expected `" + expectedType + "`.")
      );
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createAnyTypeChecker() {
  return createChainableTypeChecker(emptyFunction.thatReturns(null));
}

function createArrayOfTypeChecker(typeChecker) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    if (!Array.isArray(propValue)) {
      var locationName = ReactPropTypeLocationNames[location];
      var propType = getPropType(propValue);
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type ") +
        ("`" + propType + "` supplied to `" + componentName + "`, expected an array.")
      );
    }
    for (var i = 0; i < propValue.length; i++) {
      var error = typeChecker(propValue, i, componentName, location);
      if (error instanceof Error) {
        return error;
      }
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createElementTypeChecker() {
  function validate(props, propName, componentName, location) {
    if (!ReactElement.isValidElement(props[propName])) {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` supplied to ") +
        ("`" + componentName + "`, expected a ReactElement.")
      );
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createInstanceTypeChecker(expectedClass) {
  function validate(props, propName, componentName, location) {
    if (!(props[propName] instanceof expectedClass)) {
      var locationName = ReactPropTypeLocationNames[location];
      var expectedClassName = expectedClass.name || ANONYMOUS;
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` supplied to ") +
        ("`" + componentName + "`, expected instance of `" + expectedClassName + "`.")
      );
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createEnumTypeChecker(expectedValues) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    for (var i = 0; i < expectedValues.length; i++) {
      if (propValue === expectedValues[i]) {
        return null;
      }
    }

    var locationName = ReactPropTypeLocationNames[location];
    var valuesString = JSON.stringify(expectedValues);
    return new Error(
      ("Invalid " + locationName + " `" + propName + "` of value `" + propValue + "` ") +
      ("supplied to `" + componentName + "`, expected one of " + valuesString + ".")
    );
  }
  return createChainableTypeChecker(validate);
}

function createObjectOfTypeChecker(typeChecker) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== 'object') {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type ") +
        ("`" + propType + "` supplied to `" + componentName + "`, expected an object.")
      );
    }
    for (var key in propValue) {
      if (propValue.hasOwnProperty(key)) {
        var error = typeChecker(propValue, key, componentName, location);
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
  function validate(props, propName, componentName, location) {
    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (checker(props, propName, componentName, location) == null) {
        return null;
      }
    }

    var locationName = ReactPropTypeLocationNames[location];
    return new Error(
      ("Invalid " + locationName + " `" + propName + "` supplied to ") +
      ("`" + componentName + "`.")
    );
  }
  return createChainableTypeChecker(validate);
}

function createNodeChecker() {
  function validate(props, propName, componentName, location) {
    if (!isNode(props[propName])) {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` supplied to ") +
        ("`" + componentName + "`, expected a ReactNode.")
      );
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createShapeTypeChecker(shapeTypes) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== 'object') {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type `" + propType + "` ") +
        ("supplied to `" + componentName + "`, expected `object`.")
      );
    }
    for (var key in shapeTypes) {
      var checker = shapeTypes[key];
      if (!checker) {
        continue;
      }
      var error = checker(propValue, key, componentName, location);
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
      propValue = ReactFragment.extractIfFragment(propValue);
      for (var k in propValue) {
        if (!isNode(propValue[k])) {
          return false;
        }
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

module.exports = ReactPropTypes;

},{"./ReactElement":10,"./ReactFragment":11,"./ReactPropTypeLocationNames":12,"./emptyFunction":14}],14:[function(_dereq_,module,exports){
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

function makeEmptyFunction(arg) {
  return function() {
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
emptyFunction.thatReturnsThis = function() { return this; };
emptyFunction.thatReturnsArgument = function(arg) { return arg; };

module.exports = emptyFunction;

},{}],15:[function(_dereq_,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule emptyObject
 */

"use strict";

var emptyObject = {};

if ("production" !== "production") {
  Object.freeze(emptyObject);
}

module.exports = emptyObject;

},{}],16:[function(_dereq_,module,exports){
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

"use strict";

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

var invariant = function(condition, format, a, b, c, d, e, f) {
  if ("production" !== "production") {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

},{}],17:[function(_dereq_,module,exports){
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

"use strict";

var emptyFunction = _dereq_("./emptyFunction");

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if ("production" !== "production") {
  warning = function(condition, format ) {for (var args=[],$__0=2,$__1=arguments.length;$__0<$__1;$__0++) args.push(arguments[$__0]);
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (format.length < 10 || /^[s\W]*$/.test(format)) {
      throw new Error(
        'The warning format should be able to uniquely identify this ' +
        'warning. Please, use a more descriptive format than: ' + format
      );
    }

    if (format.indexOf('Failed Composite propType: ') === 0) {
      return; // Ignore CompositeComponent proptype check.
    }

    if (!condition) {
      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function()  {return args[argIndex++];});
      console.warn(message);
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch(x) {}
    }
  };
}

module.exports = warning;

},{"./emptyFunction":14}]},{},[4])
(4)
});