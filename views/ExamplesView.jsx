define([
  "react",

  "react-mentions",

  "jsx!views/examples/MultipleTriggerView",
  "jsx!views/examples/SingleLineView",
  "jsx!views/examples/AdvancedView"
], function(
  React,

  ReactMentions,

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

    displayName: "Examples",

    render: function() {
      return (
        <div className="examples">
          <div className="row">
            <div className="col-lg-12">
              <MultipleTrigger readOnly={ true } data={ users } />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <SingleLine readOnly={ true } data={ users } />
            </div>
            <div className="col-md-6">
              <Advanced readOnly={ true } data={ users } />
            </div>
          </div>
        </div>
      );
    }

  });
});
