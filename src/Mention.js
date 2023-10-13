import React from 'react';
import PropTypes from 'prop-types';
import useStyles from 'substyle';

const defaultStyle = {
	fontWeight: 'inherit',
};

const Mention = ({ display, style, className, classNames, render }) => {
	if (render) {
		render(display);
	}
	const styles = useStyles(defaultStyle, { style, className, classNames });
	return <strong {...styles}>{display}</strong>;
};

Mention.propTypes = {
	onAdd: PropTypes.func,
	onRemove: PropTypes.func,
	renderSuggestion: PropTypes.func,
	trigger: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(RegExp)]),
	markup: PropTypes.string,
	displayTransform: PropTypes.func,
	allowSpaceInQuery: PropTypes.bool,
	isLoading: PropTypes.bool,
	render: PropTypes.func,
};

Mention.defaultProps = {
	trigger: '@',
	markup: '@[__display__](__id__)',
	displayTransform: function (id, display) {
		return display || id;
	},
	onAdd: () => null,
	onRemove: () => null,
	renderSuggestion: null,
	isLoading: false,
	appendSpaceOnAdd: false,
	render: null,
};

export default Mention;
