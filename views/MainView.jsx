define([
  "react",

  "react-mentions",

  "jsx!views/HeaderView",

  "jsx!views/examples/MultipleTriggerView",
  "jsx!views/examples/SingleLineView",
  "jsx!views/examples/AdvancedView"
], function(
  React,

  ReactMentions,

  Header,

  MultipleTrigger,
  SingleLine,
  Advanced
) {
  var users = [
    {
      id: "johndoe",
      display: "John Doe"
    },
    {
      id: "joesmoe",
      display: "Joe Smoe"
    }
  ];

  return React.createClass({

    displayName: "ReactMentions",

    render: function() {
      return (
        <div className="react-mentions">
          <Header />

          <div className="container">
            <MultipleTrigger data={ users } />
            <SingleLine data={ users } />
            <Advanced data={ users } />
          </div>
        </div>
      );
    }

  });
});
