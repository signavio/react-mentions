/** @jsx React.DOM */
var React = require('react');
var emptyFunction = require('react/lib/emptyFunction');
var utils = require('./utils');






module.exports = React.createClass({

  displayName: 'SuggestionsOverlay',

  getDefaultProps: function () {
    return {
      suggestions: {}
    };
  },

  render: function() {
    var suggestions = this.renderSuggestions();

    // for the moment being, do not show suggestions until there is some data
    // later we might show a loading spinner / empty message
    if(suggestions.length === 0) return null;

    return (
      <div className="suggestions">
        <ul>{ suggestions }</ul>
      </div>
    );
  },

  renderSuggestions: function() {
    var listItems = [];
    for(var mentionType in this.props.suggestions) {
      if(!this.props.suggestions.hasOwnProperty(mentionType)) return;
      var suggestions = this.props.suggestions[mentionType];

      for(var i=0, l=suggestions.results.length; i < l; ++i) {
        listItems.push(
          this.renderSuggestion(suggestions.results[i], suggestions.query, suggestions.mentionDescriptor)
        );
      }
    }
    return listItems;
  },

  renderSuggestion: function(suggestion, query, mentionDescriptor) {
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

    return (
      <li key={id} onClick={this.select.bind(null, suggestion)}>
        { this.renderHighlightedDisplay(display, query) }
      </li>
    );
  },

  renderHighlightedDisplay: function(display, query) {
    var i = display.toLowerCase().indexOf(query.toLowerCase());
    if(i === -1) return <span>{ display }</span>;

    return (
      <span>
        { display.substring(0, i) }
        <b>{ query }</b>
        { display.substring(i+query.length) }
      </span>
    );
  },

  select: function(suggestion) {
    console.log("selected", suggestion.display);
  }
    
});
