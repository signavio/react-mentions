import React from 'react';
import Radium from './OptionalRadium';
import substyle from 'substyle';

function Spinner(props) {
  return (
    <div { ...substyle(props) }>
      <div { ...substyle(props, ["element", "element1"]) } />
      <div { ...substyle(props, ["element", "element2"]) } />
      <div { ...substyle(props, ["element", "element3"]) } />
      <div { ...substyle(props, ["element", "element4"]) } />
      <div { ...substyle(props, ["element", "element5"]) } />
    </div>
  );
};

function LoadingIndicator(props) {
  return (
    <div { ...substyle(props) }>
      <Spinner { ...substyle(props, "spinner") } />
    </div>
  );
};

export default Radium(LoadingIndicator);
