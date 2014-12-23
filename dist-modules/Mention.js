var React = require('react');
var emptyFunction = require('react/lib/emptyFunction');
var utils = require('./utils');




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

  contextTypes: {
    markup: React.PropTypes.string.isRequired
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
