import React, { PropTypes } from 'react';

import utils from './utils';

export default function Mention({ display, className, style }) {
  return (
    <strong 
      className={className}
      style={{ ...defaultStyle, ...style}}
    >
      { display }
    </strong>
  );
};

Mention.propTypes = {
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
  onAdd: PropTypes.func,
  onRemove: PropTypes.func,

  renderSuggestion: PropTypes.func,

  trigger: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(RegExp)
  ]),

  isLoading: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

Mention.defaultProps = {
  trigger: "@",

  onAdd: () => null,
  onRemove: () => null,
  renderSuggestion: null,
  isLoading: false,
};

const defaultStyle = {
  fontWeight: "inherit"
}
