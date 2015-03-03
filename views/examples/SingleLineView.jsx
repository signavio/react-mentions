define([
  "react",

  "react-mentions",

  "views/mixins/MentionsMixin"
], function(
  React,

  ReactMentions,

  MentionsMixin
) {

  var MentionsInput = ReactMentions.MentionsInput;
  var Mention = ReactMentions.Mention;

  return React.createClass({

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
            readOnly={ true }
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

});
