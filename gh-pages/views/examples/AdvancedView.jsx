var React = require("react");
var ReactMentions = require("react-mentions");

var MentionsMixin = require("../mixins/MentionsMixin");


var MentionsInput = ReactMentions.MentionsInput;
var Mention = ReactMentions.Mention;


var regex = /@(\w+)/g;

module.exports = React.createClass({

  displayName: "Advanced",

  mixins: [ MentionsMixin ],

  getInitialState: function() {
    return {
      value: "Hi @johndoe!"
    };
  },

  render: function() {
    return (
      <div className="advanced">
        <h3>Advanced options</h3>

        <MentionsInput
          value={this.state.value}
          onChange={this.handleChange}
          markup="@__id__"
          //regexp={regex}
          displayTransform={this.transformDisplay}>

          <Mention data={ this.props.data } />
        </MentionsInput>
      </div>
    );
  },

  transformDisplay: function(id) {
    return "@" + id;
  }

});
