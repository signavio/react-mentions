var React = require("react");
var Router = require("react-router");

var Header = require("./HeaderView");

var RouteHandler = Router.RouteHandler;


module.exports = React.createClass({

  displayName: "ReactMentions",

  render: function() {
    return (
      <div className="react-mentions">
        <Header />

        <div className="container">
          <RouteHandler />
        </div>
      </div>
    );
  }
});
