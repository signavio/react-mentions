import React from "react";
import { Mention, MentionsInput } from "react-mentions";

import MentionsMixin from "../mixins/MentionsMixin";

import defaultStyle from "./defaultStyle";

module.exports = React.createClass({

  displayName: "SingleLine",

  mixins: [ MentionsMixin ],

  getInitialState: function() {
    return {
      value: ""
    };
  },

  render: function() {
    return (
      <div className="single-line">
        <h3>Single line input</h3>

        <MentionsInput
          singleLine
          value={this.state.value}
          onChange={this.handleChange}
          style={ defaultStyle({ singleLine: true }) }
          placeholder={"Mention people using '@'"}>

          <Mention data={ this.props.data } />
        </MentionsInput>
      </div>
    );
  }

});
