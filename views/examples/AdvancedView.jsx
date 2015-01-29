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
            displayTransform={this.transformDisplay}>

            <Mention data={ this.props.data } />
          </MentionsInput>
        </div>
      );
    },

    transformDisplay: function(id) {
      return "<-- " + id + " -->";
    }
  });

});
