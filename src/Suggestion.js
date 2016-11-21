import React, { Component, PropTypes } from 'react';
import Radium from './OptionalRadium';
import omit from 'lodash/omit';
import keys from 'lodash/keys';

import defaultStyle from "substyle";

class Suggestion extends Component {

  static propTypes = {
    id: PropTypes.string.isRequired,
    query: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,

    suggestion: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        display: PropTypes.string
      }),
    ]).isRequired,
    descriptor: PropTypes.object.isRequired,

    focused: PropTypes.bool,
  };

  render() {
    let rest = omit(this.props, keys(Suggestion.propTypes));

    return (
      <li
        { ...rest }
        { ...substyle(this.props, { "&focused": this.props.focused}) }>

        { this.renderContent() }
      </li>
    );
  }

  renderContent() {
    let { id, query, descriptor, suggestion, index } = this.props;

    let display = this.getDisplay();
    let highlightedDisplay = this.renderHighlightedDisplay(display, query);

    if(descriptor.props.renderSuggestion) {
      return descriptor.props.renderSuggestion(suggestion, query, highlightedDisplay, index);
    }

    return highlightedDisplay;
  }

  getDisplay() {
    let { suggestion } = this.props;

    if(suggestion instanceof String) {
      return suggestion;
    }

    let { id, display } = suggestion;

    if(!id || !display) {
      return id;
    }

    return display;
  }

  renderHighlightedDisplay(display) {
    let { query } = this.props;

    let i = display.toLowerCase().indexOf(query.toLowerCase());

    if(i === -1) {
      return <span { ...substyle(this.props, "display") }>{ display }</span>;
    }

    return (
      <span { ...substyle(this.props, "display") }>
        { display.substring(0, i) }
        <b { ...substyle(this.props, "highlight") }>
          { display.substring(i, i+query.length) }
        </b>
        { display.substring(i+query.length) }
      </span>
    );
  }

}

export default Radium(Suggestion);

const substyle = defaultStyle({
  style: {
    cursor: "pointer"
  }
})
