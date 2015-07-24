var React = require("react");
var ReactMentions = require("react-mentions");

var MentionsMixin = require("../mixins/MentionsMixin");


var MentionsInput = ReactMentions.MentionsInput;
var Mention = ReactMentions.Mention;

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
          singleLine={true}
          value={this.state.value}
          onChange={this.handleChange}
          placeholder={"Mention people using '@'"}>

          <Mention data={ this.props.data }/>
        </MentionsInput>
      </div>
    );
  }

});
