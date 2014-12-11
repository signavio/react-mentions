/** @jsx React.DOM */
var React = require('react');
var LinkedValueUtils = require('react/lib/LinkedValueUtils');
var emptyFunction = require('react/lib/emptyFunction');


var utils = require('./utils');
var Mention = require('./Mention');
var SuggestionsOverlay = require('./SuggestionsOverlay');


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
    return new RegExp("\\s" + escapedTriggerChar + "([^\\s" + escapedTriggerChar + "]*)$");
  }
};

var _getDataProvider = function(data) {
  if(data instanceof Array) {
    // if data is an array, create a function to query that
    return function(query, callback) {
      var results = [];
      for(var i=0, l=data.length; i < l; ++i) {
        var display = data[i].display || data[i].id;
        if(display.indexOf(query) >= 0) {
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


module.exports = React.createClass({

  displayName: 'MentionsInput',

  mixins: [
    LinkedValueUtils.Mixin
  ],

  propTypes: {

    /**
     * If set to `false` a single line input will be rendered
     *
     */
    multiLine: React.PropTypes.bool,

    markup: React.PropTypes.string

  },

  childContextTypes: {
    markup: React.PropTypes.string.isRequired
  },

  getDefaultProps: function () {
    return {
      multiLine: true,
      markup: "@[__display__](__id__)"
    };
  },

  getInitialState: function () {
    return {
      selectionStart: null,
      selectionEnd: null,

      showSuggestions: false,
      suggestions: {}
    };
  },

  getChildContext: function() {
    return {
      markup: this.props.markup
    };
  },

  render: function() {
    return (
      <div className="react-mentions">
        <div className="highlighter">
          { this.renderHighlighter() }
        </div>
        { this.renderInput() }
        { this.renderSuggestionsOverlay() }
      </div>
    );
  },

  renderInput: function() {
    return (
      <textarea ref="input"
        value={this.getPlainText()} 
        onChange={this.handleChange}
        onSelect={this.handleSelect} />
    );
  },

  renderSuggestionsOverlay: function() {
    if(!this.state.showSuggestions) return null;
    return (
      <SuggestionsOverlay 
        suggestions={this.state.suggestions} />
    );
  },

  // Returns an array of strings and Mention components to be inserted in the highlighter
  // element
  renderHighlighter: function() {
    var value = LinkedValueUtils.getValue(this);
    var resultComponents = [];

    var regex = utils.markupToRegex(this.props.markup);

    var idPos = utils.getPositionOfCapturingGroup(this.props.markup, "id");
    var displayPos = utils.getPositionOfCapturingGroup(this.props.markup, "display");
    var typePos = utils.getPositionOfCapturingGroup(this.props.markup, "type");

    var match, substr;
    var start = 0;

    var componentKeys = {};

    // detect all mention markup occurences in the value and iterate the matches
    while((match = regex.exec(value)) !== null) {

      // extract attribute values from the capturing groups
      // (+1 is required because the first item is the match as a whole)
      var id = match[idPos+1];
      var display = match[displayPos+1];
      var type = typePos && match[typePos+1];

      // generate a component key based on the id
      var key = _generateComponentKey(componentKeys, id);

      // append plain substring between last and current mention
      if(match.index > 0) {
        substr = value.substring(start, match.index);
        resultComponents.push(substr);
      }

      // append the Mention component for the current match
      resultComponents.push(
        this.getMentionComponentForMatch(id, display, type, key)
      );
      start = regex.lastIndex;
    }

    // append rest of the string after the last mention 
    if(start < value.length) {
      substr = value.substring(start);
      resultComponents.push(substr);
    }

    return resultComponents;
  },

  // Renders an component to be inserted in the highlighter at the current caret position
  renderHighlighterCaret: function() {
    return (

    );
  },

  // Returns a clone of the Mention child applicable for the specified type to be rendered inside the highlighter
  getMentionComponentForMatch: function(id, display, type, key) {
    var childrenCount = React.Children.count(this.props.children);

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
      return React.addons.cloneWithProps(foundChild, { id: id, display: display, key: key });
    } else if(childrenCount === 1) {
      // clone single Mention child
      return React.addons.cloneWithProps(this.props.children, { id: id, display: display, key: key });
    } else {
      // no children, use default configuration
      return Mention({ id: id, display: display, key: key });
    }
  },

  // Returns the text to set as the value of the textarea with all markups removed
  getPlainText: function() {
    var value = LinkedValueUtils.getValue(this);
    var regex = utils.markupToRegex(this.props.markup);
    var displayPos = utils.getPositionOfCapturingGroup(this.props.markup, "display");
    return value.replace(regex, function() {
      // first argument is the whole match, capturing groups are following
      return arguments[displayPos+1];
    });
  },

  // Handle input element's change event
  handleChange: function(ev) {
    var value = LinkedValueUtils.getValue(this);
    var newPlainTextValue = ev.target.value;

    // Derive the new value to set by applying the local change in the textarea's plain text
    var newValue = utils.applyChangeToValue(
      value, this.props.markup,
      newPlainTextValue,
      this._selectionStart, this._selectionEnd, 
      ev.target.selectionEnd
    );

    // Save current selection after change to be able to restore caret position after rerendering
    this._selectionStart = ev.target.selectionStart;
    this._selectionEnd = ev.target.selectionEnd;

    // Assert that there's no range selection after a change
    if(this._selectionStart !== this._selectionEnd) {
      throw new Error("Unexpected range selection after a change");
    }

    // Adjust selection range in case a mention will be deleted
    this._selectionStart = utils.findStartOfMentionInPlainText(value, this.props.markup, this._selectionStart);
    this._selectionEnd = this._selectionStart;

    // Show, hide, or update suggestions overlay
    this.updateMentionsQueries(newPlainTextValue);

    // Propagate change
    var handleChange = LinkedValueUtils.getOnChange(this);
    handleChange(ev, newValue);
  },

  // Handle input element's select event
  handleSelect: function(ev) {
    // keep track of selection range / caret position
    this._selectionStart = ev.target.selectionStart;
    this._selectionEnd = ev.target.selectionEnd;
  },

  autogrowTextarea: function() {
    var el = this.refs.input.getDOMNode();
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  },

  componentDidMount: function() {
    this.autogrowTextarea();
  },

  componentDidUpdate: function() {
    this.autogrowTextarea();

    // maintain selection in case a mention is added/removed causing
    // the cursor to jump to the end
    this.setSelection(this._selectionStart, this._selectionEnd);
  },

  setSelection: function(selectionStart, selectionEnd) {
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

  updateMentionsQueries: function(plainTextValue) {
    // Invalidate previous queries. Async results for previous queries will be neglected.
    this._queryId++;
    this.setState({
      suggestions: {}
    });
    
    // Check if suggestions have to be shown:
    // Match the trigger patterns of all Mention children the new plain text substring up to the current caret position
    var substring = plainTextValue.substring(0, this._selectionStart);
    var showSuggestions = false;
    var that = this;
    React.Children.forEach(this.props.children, function(child) {
      var regex = _getTriggerRegex(child.props.trigger);
      var match = substring.match(regex);
      if(match) {
        that.queryData(match[1], child);
        showSuggestions = true;
      }
    });

    // If any mentions queries have been started, show suggestions overlay
    this.setState({
      showSuggestions: showSuggestions
    });
  },

  queryData: function(query, mentionDescriptor) {
    var provideData = _getDataProvider(mentionDescriptor.props.data);
    var snycResult = provideData(query, this.updateSuggestions.bind(null, this._queryId, mentionDescriptor, query));
    if(snycResult instanceof Array) {
      this.updateSuggestions(this._queryId, mentionDescriptor, query, snycResult);
    }
  },

  updateSuggestions: function(queryId, mentionDescriptor, query, suggestions) {
    // neglect async results from previous queries
    if(queryId !== this._queryId) return;

    var update = {};
    update[mentionDescriptor.type] = {
      query: query,
      mentionDescriptor: mentionDescriptor,
      results: suggestions
    };

    this.setState({
      suggestions: utils.extend({}, this.state.suggestions, update)
    });
  },

  _queryId: 0

    
});
