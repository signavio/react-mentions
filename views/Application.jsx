define([
  "react",
  "react-router",

  "jsx!views/HeaderView"
], function(
  React,
  Router,

  Header
) {

  var RouteHandler = Router.RouteHandler;

  return React.createClass({

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

});
