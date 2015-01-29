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
      "jsx!views/MainView"
    ], function(
      MainView
    ) {
      React.render(MainView(), document.body);
    });
  });
});
