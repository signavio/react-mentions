var React = require("react");
var ReactMentions = require("react-mentions");

var MentionsMixin = require("../mixins/MentionsMixin");


var MentionsInput = ReactMentions.MentionsInput;
var Mention = ReactMentions.Mention;

// use first/outer capture group to extract the full entered sequence to be replaced
// and second/inner capture group to extract search string from the match
var emailRegex = /(([^\s@]+@[^\s@]+\.[^\s@]+))$/;

module.exports = React.createClass({

  displayName: "MultipleTriggers",

  mixins: [ MentionsMixin ],

  getInitialState: function() {
    return {
      value: "Hi @[John Doe](user:johndoe), \n\nlet's add @[joe@smoe.com](email:joe@smoe.com) and @[John Doe](user:johndoe) to this conversation... "
    };
  },

  render: function() {
    return (
      <div className="multiple-triggers">
        <h3>Multiple trigger patterns</h3>
        <p>Mention people using '@' + username or type an email address</p>

        <MentionsInput
          value={this.state.value}
          onChange={this.handleChange}
          markup="@[__display__](__type__:__id__)"
          placeholder={"Mention people using '@'"}>

          <Mention
            type="user"
            trigger="@"
            data={ this.props.data }
            renderSuggestion={this.renderSuggestion}
            onAdd={this.handleAdd}
            onRemove={this.handleRemove} />
          <Mention
            type="email"
            trigger={emailRegex}
            data={this.requestEmail}
            onAdd={this.handleEmailAdd} />
        </MentionsInput>
      </div>
    );
  },

  handleRemove: function() {
    console.log("removed a mention", arguments);
  },

  handleAdd: function() {
    console.log("added a new mention", arguments);
  },

  renderSuggestion: function(id, display, search, highlightedDisplay) {
    return (
      <div className="user">
        { highlightedDisplay }
      </div>
    );
  },

  requestEmail: function(search) {
    return [
      { id: search, display: search }
    ];
  }

});