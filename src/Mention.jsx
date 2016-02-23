import React, { PropTypes } from 'react';
import substyle from 'substyle';

import utils from './utils';

export default function Mention(props={}) {
  let { display } = props;

  return (
    <strong { ...substyle(props) }>
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
};

Mention.defaultProps = {
  trigger: "@",

  onAdd: () => null,
  onRemove: () => null,

  renderSuggestion: null,

  isLoading: false,
};
