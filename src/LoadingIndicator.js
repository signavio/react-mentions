import React from 'react';

function Spinner(props) {
  return (
    <div className="spinner">
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  );
};

function LoadingIndicator(props) {
  return (
    <div className="loading-indicator">
      <Spinner />
    </div>
  );
};

export default LoadingIndicator;
