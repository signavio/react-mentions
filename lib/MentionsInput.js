/** @jsx React.DOM */
var React = require('react');
var LinkedValueUtils = require('react/lib/LinkedValueUtils');
var emptyFunction = require('react/lib/emptyFunction');

var Mention = require('./Mention');
var utils = require('./utils');

var _generateComponentKey = function(usedKeys, id) {
  if(!usedKeys.hasOwnProperty(id)) {
    usedKeys[id] = 0;
  } else {
    usedKeys[id]++;
  }
  return id + "_" + usedKeys[id];
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
      selectionEnd: null
    };
  },

  getChildContext: function() {
    return {
      markup: this.props.markup
    };
  },

  render: function() {
    return (
      <div>
        <div className="highlighter">
          { this.renderHighlighter() }
        </div>
        { this.renderInput() }
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

  handleChange: function(ev) {
    var value = LinkedValueUtils.getValue(this);
    var newPlainTextValue = ev.target.value;

    // Derive the new value to set by applying the local change in the textarea's plain text
    var newValue = utils.applyChangeToValue(
      value, this.props.markup,
      value,
      this._selectionStart, this._selectionEnd, 
      ev.target.selectionEnd
    );

    //var handleChange = LinkedValueUtils.getOnChange(this);
    //handleChange(ev, newValue);
    
    // TODO match the trigger patterns of all Mention children to the end of the string so see whether to show suggestions

    
  },

  handleSelect: function(ev) {
    // keep track of selection range / caret position
    this._selectionStart = ev.target.selectionStart;
    this._selectionEnd = ev.target.selectionEnd;
  },

  
  applyChangeToValue: function(ev) {
    

    var changedSubstr = newPlainTextValue.

    
    console.log(ev);
    console.log(ev.target.selectionStart, ev.target.selectionEnd);
  }



    
});
