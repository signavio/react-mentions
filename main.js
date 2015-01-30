require([
    "config"
], function() {

  require([
    "react"
  ], function(
    React
  ) {
    window.React = React;

    require([
      "react-router",

      "jsx!routes"
    ], function(
      Router,

      routes
    ) {
      Router.run(routes, function(Handler) {
        React.render(React.createElement(Handler, null), document.body);
      });
    });
  });
});
