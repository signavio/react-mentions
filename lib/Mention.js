/** @jsx React.DOM */
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
      <strong>{ this.props.display }</strong>
    );
  },

  //componentDidMount: function() {
  //  this.props.onAdd(this.props.id, this.props.display, this.props.type);
  //},
//
  //componentWillUnmount: function() {
  //  this.props.onRemove(this.props.id, this.props.display, this.props.type);
  //}
//
    
});
