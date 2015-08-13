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
     * function(id, display) {
     *   console.log("user " + display + " was mentioned!");
     * }
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
      renderSuggestion: null,
      isLoading: false
    };
  },

  render: function() {
    return (
      <strong>{ this.props.display }</strong>
    );
  }

});
