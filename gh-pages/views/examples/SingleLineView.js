import React from "react";
import { Mention, MentionsInput } from "react-mentions";

import MentionsMixin from "../mixins/MentionsMixin";

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
          placeholder={"Mention people using '@'"}>

          <Mention data={ this.props.data } />
        </MentionsInput>
      </div>
    );
  }

});
