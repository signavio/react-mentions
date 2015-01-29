require([
    "config"
], function() {

    require([
        "react",

        "jsx!views/MainView"
    ], function(
        React,

        MainView
    ) {
        window.React = React;

        React.render(MainView, document.body);
    });
});
