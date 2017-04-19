import React from 'react';
import PropTypes from 'prop-types';
import { defaultStyle } from 'substyle';

const styled = defaultStyle({
  fontWeight: "inherit"
});

const Mention = styled(({ display, style }) => (
  <strong {...style}>
    { display }
  </strong>
));

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
  appendSpaceOnAdd: false
};

export default Mention;
