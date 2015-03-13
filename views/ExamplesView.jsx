define([
  "react",

  "react-mentions",

  "jsx!views/components/CodeExample",

  "jsx!views/examples/MultipleTriggerView",
  "jsx!views/examples/SingleLineView",
  "jsx!views/examples/AdvancedView"
], function(
  React,

  ReactMentions,

  CodeExample,

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
              <CodeExample code="views/examples/MultipleTriggerView.jsx">
                <MultipleTrigger data={ users } />
              </CodeExample>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <SingleLine data={ users } />
            </div>
            <div className="col-md-6">
              <Advanced data={ users } />
            </div>
          </div>
        </div>
      );
    }

  });
});
