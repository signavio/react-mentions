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
        React.render(MainView, document.body);
    });
});
