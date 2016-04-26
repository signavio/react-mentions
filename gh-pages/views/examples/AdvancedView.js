import React from "react";
import { MentionsInput, Mention } from "react-mentions";
import merge from 'lodash/merge';

import MentionsMixin from "../mixins/MentionsMixin";

import defaultStyle from "./defaultStyle";
import defaultMentionStyle from "./defaultMentionStyle";

const style = merge({}, defaultStyle(), {
  suggestions: {
    list: {
      maxHeight: 100,
      overflow: 'auto',
    },
  }
})

module.exports = React.createClass({

  displayName: "Advanced",

  mixins: [ MentionsMixin ],

  getInitialState: function() {
    return {
      value: "Hi {{johndoe}}!"
    };
  },

  render: function() {
    return (
      <div className="advanced">
        <h3>Advanced options</h3>

        <MentionsInput
          value={this.state.value}
          onChange={this.handleChange}
          markup="{{__id__}}"
          style={style}
          displayTransform={this.transformDisplay}>

          <Mention data={ this.props.data } onAdd={this.handleAddMention} style={defaultMentionStyle} />
        </MentionsInput>
      </div>
    );
  },

  transformDisplay: function(id) {
    return "<-- " + id + " -->";
  },

  handleAddMention: function (id, display) {
    console.log("Added mention of " + id);
  }

});
