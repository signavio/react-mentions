/** @jsx React.DOM */
var React = require('react');
var emptyFunction = require('react/lib/emptyFunction');


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

  },

  contextTypes: {
    markup: React.PropTypes.string.isRequired
  },

  getDefaultProps: function () {
    return {
      trigger: "@",
      onAdd: emptyFunction,
      onRemove: emptyFunction
    };
  },

  render: function() {
    return (
      <b>{ this.props.display }</b>
    );
  },

  onComponentDidMount: function() {
    if(this.props.onAdd) {
      this.props.onAdd();
    }
  },

  onComponentWillUnmount: function() {
    if(this.props.onRemove) {
      this.props.onRemove();
    }
  }

    
});
