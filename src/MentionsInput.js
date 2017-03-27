import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import keys from 'lodash/keys';
import values from 'lodash/values';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';

import { defaultStyle } from 'substyle';

import utils from './utils';
import SuggestionsOverlay from './SuggestionsOverlay';
import Highlighter from './Highlighter';

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

var KEY = { TAB : 9, RETURN : 13, ESC : 27, UP : 38, DOWN : 40 };

var isComposing = false;

const MentionsInput = React.createClass({

  displayName: 'MentionsInput',

  propTypes: {

    /**
     * If set to `true` a regular text input element will be rendered
     * instead of a textarea
     */
    singleLine: PropTypes.bool,
    positionSuggestionsAboveCaret: PropTypes.bool,

    markup: PropTypes.string,
    value: PropTypes.string,

    displayTransform: PropTypes.func,
    onKeyDown: PropTypes.func,
    onSelect: PropTypes.func,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,

    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element),
    ]).isRequired
  },

  getDefaultProps: function () {
    return {
      positionSuggestionsAboveCaret: false,
      markup: "@[__display__](__id__)",
      singleLine: false,
      displayTransform: function(id, display, type) {
        return display;
      },
      onKeyDown: () => null,
      onSelect: () => null,
      onBlur: () => null
    };
  },

  getInitialState: function () {
    this.suggestions = {};

    return {
      focusIndex: 0,

      selectionStart: null,
      selectionEnd: null,

      suggestions: {},

      caretPosition: null,
      suggestionsPosition: null
    };
  },

  render: function() {
    return (
      <div ref="container" {...this.props.style}>
        { this.renderControl() }
        { this.renderSuggestionsOverlay() }
      </div>
    );
  },

  getInputProps: function(isTextarea) {
    let { readOnly, disabled, style } = this.props;

    // pass all props that we don't use through to the input control
    let props = omit(this.props, 'style', keys(MentionsInput.propTypes));

    return {
      ...props,
      ...style("input"),

      value: this.getPlainText(),

      ...(!readOnly && !disabled && {
        onChange: this.handleChange,
        onSelect: this.handleSelect,
        onKeyDown: this.handleKeyDown,
        onBlur: this.handleBlur,
        onCompositionStart: this.handleCompositionStart,
        onCompositionEnd: this.handleCompositionEnd,
      })
    };
  },

  renderControl: function() {
    let { singleLine, style } = this.props;
    let inputProps = this.getInputProps(!singleLine);

    return (
      <div { ...style("control") }>
        { this.renderHighlighter(inputProps.style) }
        { singleLine ? this.renderInput(inputProps) : this.renderTextarea(inputProps) }
      </div>
    );
  },

  renderInput: function(props) {
    return (
      <input
        type="text"
        ref="input"
        { ...props } />
    );
  },

  renderTextarea: function(props) {
    return (
      <textarea
        ref="input"
        { ...props } />
    );
  },

  renderSuggestionsOverlay: function() {
    if(!utils.isNumber(this.state.selectionStart)) {
      // do not show suggestions when the input does not have the focus
      return null;
    }
    return (
      <SuggestionsOverlay
        style={ this.props.style("suggestions") }
        position={ this.state.suggestionsPosition }
        focusIndex={ this.state.focusIndex }
        scrollFocusedIntoView={ this.state.scrollFocusedIntoView }
        ref="suggestions"
        suggestions={this.state.suggestions}
        onSelect={this.addMention}
        onMouseDown={this.handleSuggestionsMouseDown}
        onMouseEnter={ (focusIndex) => this.setState({
          focusIndex,
          scrollFocusedIntoView: false
        }) }
        isLoading={this.isLoading()} />
    );
  },

  renderHighlighter: function(inputStyle) {
    const { selectionStart, selectionEnd } = this.state;
    const { markup, displayTransform, singleLine, children, value, style } = this.props;

    return (
      <Highlighter
        ref="highlighter"
        style={ style("highlighter") }
        inputStyle={ inputStyle }
        value={ value }
        markup={ markup }
        displayTransform={ displayTransform }
        singleLine={ singleLine }
        selection={{
          start: selectionStart,
          end: selectionEnd
        }}
        onCaretPositionChange={ (position) => this.setState({ caretPosition: position }) }>

        { children }
      </Highlighter>
    );
  },

  // Returns the text to set as the value of the textarea with all markups removed
  getPlainText: function() {
    return utils.getPlainText(
      this.props.value || "",
      this.props.markup,
      this.props.displayTransform
    );
  },

  executeOnChange: function(event, ...args) {
    if(this.props.onChange) {
      return this.props.onChange(event, ...args);
    }

    if(this.props.valueLink) {
      return this.props.valueLink.requestChange(event.target.value, ...args);
    }
  },

  // Handle input element's change event
  handleChange: function(ev) {

    if(document.activeElement !== ev.target) {
      // fix an IE bug (blur from empty input element with placeholder attribute trigger "input" event)
      return;
    }

    let value = this.props.value || "";
    let newPlainTextValue = ev.target.value;

    // Derive the new value to set by applying the local change in the textarea's plain text
    let newValue = utils.applyChangeToValue(
      value, this.props.markup,
      newPlainTextValue,
      this.state.selectionStart, this.state.selectionEnd,
      ev.target.selectionEnd,
      this.props.displayTransform
    );

    // In case a mention is deleted, also adjust the new plain text value
    newPlainTextValue = utils.getPlainText(newValue, this.props.markup, this.props.displayTransform);

    // Save current selection after change to be able to restore caret position after rerendering
    let selectionStart = ev.target.selectionStart;
    let selectionEnd = ev.target.selectionEnd;
    let setSelectionAfterMentionChange = false;

    // Adjust selection range in case a mention will be deleted by the characters outside of the
    // selection range that are automatically deleted
    let startOfMention = utils.findStartOfMentionInPlainText(value, this.props.markup, selectionStart, this.props.displayTransform);

    if(startOfMention !== undefined && this.state.selectionEnd > startOfMention) {
      // only if a deletion has taken place
      selectionStart = startOfMention;
      selectionEnd = selectionStart;
      setSelectionAfterMentionChange = true;
    }

    this.setState({
      selectionStart: selectionStart,
      selectionEnd: selectionEnd,
      setSelectionAfterMentionChange: setSelectionAfterMentionChange,
    });

    let mentions = utils.getMentions(newValue, this.props.markup);

    // Propagate change
    // let handleChange = this.getOnChange(this.props) || emptyFunction;
    let eventMock = { target: { value: newValue } };
    // this.props.onChange.call(this, eventMock, newValue, newPlainTextValue, mentions);
    this.executeOnChange(eventMock, newValue, newPlainTextValue, mentions);
  },

  // Handle input element's select event
  handleSelect: function(ev) {
    // do nothing while a IME composition session is active
    if (isComposing) return;

    // keep track of selection range / caret position
    this.setState({
      selectionStart: ev.target.selectionStart,
      selectionEnd: ev.target.selectionEnd
    });

    // refresh suggestions queries
    var el = this.refs.input;
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
    // do not intercept key events if the suggestions overlay is not shown
    var suggestionsCount = utils.countSuggestions(this.state.suggestions);

    var suggestionsComp = this.refs.suggestions;
    if(suggestionsCount === 0 || !suggestionsComp) {
      this.props.onKeyDown(ev);

      return;
    }

    if(values(KEY).indexOf(ev.keyCode) >= 0) {
      ev.preventDefault();
    }

    switch(ev.keyCode) {
      case KEY.ESC: {
        this.clearSuggestions();
        return;
      }
      case KEY.DOWN: {
        this.shiftFocus(+1);
        return;
      }
      case KEY.UP: {
        this.shiftFocus(-1);
        return;
      }
      case KEY.RETURN: {
        this.selectFocused();
        return;
      }
      case KEY.TAB: {
        this.selectFocused();
        return;
      }
    }
  },

  shiftFocus: function(delta) {
    let suggestionsCount = utils.countSuggestions(this.state.suggestions);

    this.setState({
      focusIndex: (suggestionsCount + this.state.focusIndex + delta) % suggestionsCount,
      scrollFocusedIntoView: true
    });
  },

  selectFocused: function() {
    let { suggestions, focusIndex } = this.state;
    let { suggestion, descriptor } = utils.getSuggestion(suggestions, focusIndex);

    this.addMention(suggestion, descriptor);

    this.setState({
      focusIndex: 0
    });
  },

  handleBlur: function(ev) {
    const clickedSuggestion = this._suggestionsMouseDown
    this._suggestionsMouseDown = false;

    // only reset selection if the mousedown happened on an element
    // other than the suggestions overlay
    if(!clickedSuggestion) {
      this.setState({
        selectionStart: null,
        selectionEnd: null
      });
    };

    window.setTimeout(() => {
      this.updateHighlighterScroll();
    }, 1);

    this.props.onBlur(ev, clickedSuggestion);
  },

  handleSuggestionsMouseDown: function(ev) {
    this._suggestionsMouseDown = true;
  },

  updateSuggestionsPosition: function() {
    let { caretPosition } = this.state;

    if(!caretPosition || !this.refs.suggestions) {
      return;
    }

    let { container } = this.refs;

    let suggestions = ReactDOM.findDOMNode(this.refs.suggestions);
    let highlighter = ReactDOM.findDOMNode(this.refs.highlighter);
    if(!suggestions) {
      return;
    }

    let left = caretPosition.left - highlighter.scrollLeft;
    let position = {};

    // guard for mentions suggestions list clipped by right edge of window
    if (left + suggestions.offsetWidth > container.offsetWidth) {
      position.right = 0;
    } else {
      position.left = left
    }

    if(this.props.positionSuggestionsAboveCaret) {
      position.top = caretPosition.top - suggestions.scrollHeight;
      position.marginTop = "0px";
      position.marginBottom = "14px";
    } else {
      position.top = caretPosition.top - highlighter.scrollTop;
    }

    if(isEqual(position, this.state.suggestionsPosition)) {
      return;
    }

    this.setState({
      suggestionsPosition: position
    });
  },

  updateHighlighterScroll: function() {
    if(!this.refs.input || !this.refs.highlighter) {
      // since the invocation of this function is deferred,
      // the whole component may have been unmounted in the meanwhile
      return;
    }
    var input = this.refs.input;
    var highlighter = ReactDOM.findDOMNode(this.refs.highlighter);
    highlighter.scrollLeft = input.scrollLeft;
  },

  handleCompositionStart: function() {
    isComposing = true;
  },

  handleCompositionEnd: function() {
    isComposing = false;
  },

  componentDidMount: function() {
    this.updateSuggestionsPosition();
  },

  componentDidUpdate: function() {
    this.updateSuggestionsPosition();

    // maintain selection in case a mention is added/removed causing
    // the cursor to jump to the end
    if (this.state.setSelectionAfterMentionChange) {
      this.setState({setSelectionAfterMentionChange: false});
      this.setSelection(this.state.selectionStart, this.state.selectionEnd);
    }
  },

  setSelection: function(selectionStart, selectionEnd) {
    if(selectionStart === null || selectionEnd === null) return;

    var el = this.refs.input;
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
    this.suggestions = {};
    this.setState({
      suggestions: {}
    });

    // If caret is inside of or directly behind of mention, do not query
    var value = this.props.value || "";
    if( utils.isInsideOfMention(value, this.props.markup, caretPosition, this.props.displayTransform) ||
        utils.isInsideOfMention(value, this.props.markup, caretPosition-1, this.props.displayTransform) ) {
      return;
    }

    // Check if suggestions have to be shown:
    // Match the trigger patterns of all Mention children the new plain text substring up to the current caret position
    var substring = plainTextValue.substring(0, caretPosition);

    var that = this;
    React.Children.forEach(this.props.children, function(child) {
      if(!child) {
        return;
      }

      var regex = _getTriggerRegex(child.props.trigger);
      var match = substring.match(regex);
      if(match) {
        var querySequenceStart = substring.indexOf(match[1], match.index);
        that.queryData(match[2], child, querySequenceStart, querySequenceStart+match[1].length, plainTextValue);
      }
    });
  },

  clearSuggestions: function() {
    // Invalidate previous queries. Async results for previous queries will be neglected.
    this._queryId++;
    this.suggestions = {};
    this.setState({
      suggestions: {},
      focusIndex: 0
    });
  },

  queryData: function(query, mentionDescriptor, querySequenceStart, querySequenceEnd, plainTextValue) {
    var provideData = _getDataProvider(mentionDescriptor.props.data);
    var snycResult = provideData(query, this.updateSuggestions.bind(null, this._queryId, mentionDescriptor, query, querySequenceStart, querySequenceEnd, plainTextValue));
    if(snycResult instanceof Array) {
      this.updateSuggestions(this._queryId, mentionDescriptor, query, querySequenceStart, querySequenceEnd, plainTextValue, snycResult);
    }
  },

  updateSuggestions: function(queryId, mentionDescriptor, query, querySequenceStart, querySequenceEnd, plainTextValue, suggestions) {
    // neglect async results from previous queries
    if(queryId !== this._queryId) return;

    var update = {};
    update[mentionDescriptor.props.type] = {
      query: query,
      mentionDescriptor: mentionDescriptor,
      querySequenceStart: querySequenceStart,
      querySequenceEnd: querySequenceEnd,
      results: suggestions,
      plainTextValue: plainTextValue
    };

    // save in property so that multiple sync state updates from different mentions sources
    // won't overwrite each other
    this.suggestions = utils.extend({}, this.suggestions, update)

    this.setState({
      suggestions: this.suggestions,
    });
  },

  addMention: function(suggestion, {mentionDescriptor, querySequenceStart, querySequenceEnd, plainTextValue}) {
    // Insert mention in the marked up value at the correct position
    var value = this.props.value || "";
    var start = utils.mapPlainTextIndex(value, this.props.markup, querySequenceStart, 'START', this.props.displayTransform);
    var end = start + querySequenceEnd - querySequenceStart;
    var insert = utils.makeMentionsMarkup(this.props.markup, suggestion.id, suggestion.display, mentionDescriptor.props.type);
    if (mentionDescriptor.props.appendSpaceOnAdd) {
      insert = insert + ' '
    }
    var newValue = utils.spliceString(value, start, end, insert);

    // Refocus input and set caret position to end of mention
    this.refs.input.focus();

    var displayValue = this.props.displayTransform(suggestion.id, suggestion.display, mentionDescriptor.props.type);
    if (mentionDescriptor.props.appendSpaceOnAdd) {
      displayValue = displayValue + ' '
    }
    var newCaretPosition = querySequenceStart + displayValue.length;
    this.setState({
      selectionStart: newCaretPosition,
      selectionEnd: newCaretPosition,
      setSelectionAfterMentionChange: true
    });

    // Propagate change
    var eventMock = { target: { value: newValue }};
    var mentions = utils.getMentions(newValue, this.props.markup);
    var newPlainTextValue = utils.spliceString(plainTextValue, querySequenceStart, querySequenceEnd, displayValue);

    this.executeOnChange(eventMock, newValue, newPlainTextValue, mentions);

    var onAdd = mentionDescriptor.props.onAdd;
    if(onAdd) {
      onAdd(suggestion.id, suggestion.display);
    }

    // Make sure the suggestions overlay is closed
    this.clearSuggestions();
  },

  isLoading: function() {
    var isLoading = false;
    React.Children.forEach(this.props.children, function(child) {
      isLoading = isLoading || child && child.props.isLoading;
    });
    return isLoading;
  },

  _queryId: 0

});

const isMobileSafari = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

const styled = defaultStyle({
  position: "relative",
  overflowY: "visible",

  input: {
    display: "block",
    position: "absolute",

    top: 0,

    boxSizing: "border-box",

    backgroundColor: "transparent",

    width: "inherit",
  },

  '&multiLine': {
    input: {
      width: "100%",
      height: "100%",
      bottom: 0,
      overflow: "hidden",
      resize: "none",

      // fix weird textarea padding in mobile Safari (see: http://stackoverflow.com/questions/6890149/remove-3-pixels-in-ios-webkit-textarea)
      ...(isMobileSafari ? {
        marginTop: 1,
        marginLeft: -3,
      } : null)
    }
  }
}, ({ singleLine }) => ({
  "&singleLine": singleLine,
  "&multiLine": !singleLine,
}));

export default styled(MentionsInput);
