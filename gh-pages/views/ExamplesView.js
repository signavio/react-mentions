var React = require("react");

var MultipleTrigger = require("./examples/MultipleTriggerView");
var SingleLine = require("./examples/SingleLineView");
var Advanced = require("./examples/AdvancedView");


var users = [
  {
    id: "walter",
    display: "Walter White",
    type: "user"
  },
  {
    id: "jesse",
    display: "Jesse Pinkman",
    type: "user"
  },
  {
    id: "gus",
    display: "Gustavo \"Gus\" Fring",
  },
  {
    id: "saul",
    display: "Saul Goodman",
    type: "admin"
  },
  {
    id: "hank",
    display: "Hank Schrader",
    type: "admin"
  },
  {
    id: "skyler",
    display: "Skyler White",
    type: "admin"
  },
  {
    id: "mike",
    display: "Mike Ehrmantraut",
  }
];

module.exports = React.createClass({

  displayName: "Examples",

  render: function() {
    return (
      <div className="examples">
        <div className="row">
          <div className="col-lg-12">
            <MultipleTrigger data={ users } />
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