/** @jsx React.DOM */
var React = require('react/addons');
var emptyFunction = require('react/lib/emptyFunction');
var utils = require('utils');



module.exports = React.createClass({

  displayName: 'MentionsInput',

  propTypes: {

    /**
     * If set to `false` a single line input will be rendered
     *
     */
    multiLine: React.PropTypes.bool,

    markup: React.PropTypes.string

  },

  getDefaultProps: function () {
    return {
      multiLine: true,
      markup: "@[__display__](__id__)",
    };
  },

  getInitialState: function () {
    return {
      highlighterValue: ""
    };
  },

  getChildContext: function() {
    return {
      value: this.getValue()
    };
  },

  render: function() {
    return (
      <div>
        <div className="highlighter">
          { this.renderHighlighter() }
        </div>
        <textarea></textarea>
      </div>
    );
  },

  renderHighlighter: function() {
    var value = this.getValue();
    var resultComponents = [];

    var regex = utils.markupToRegex(this.props.markup);
    var displayPos = utils.getPositionOfCapturingGroup(this.props.markup, "display");
    var idPos = utils.getPositionOfCapturingGroup(this.props.markup, "id");

    var match, substr;
    var start = 0;

    // detect all mention markup occurences in the value and iterate the matches
    while((match = regex.exec(value)) !== null) {
        var display = match[displayPos];
        var id = match[idPos];

        // append plain substring between last and current mention
        if(match.index > 0) {
            substr = value.substring(start, match.index);
            resultComponents.push(substr);
        }

        // append the Mentions component for the current match

        resultComponents.push(
            React.addons.cloneWithProps(components[key])
        );
        start = placeholderRegex.lastIndex;
    }

    // append rest of the string after the last mention 
    if(start < value.length) {
        substr = value.substring(start);
        resultComponents.push(substr);
    }

    return resultComponents;
  }



    
});
