define([
    "react",

    "react-router",

    "jsx!views/Application",
    "jsx!views/ExamplesView"
], function(
    React,

    ReactRouter,

    Application,
    Examples
) {

    var Route = ReactRouter.Rout;
    var DefaultRoute = ReactRouter.DefaultRoute;

    return (
        <Route handler={ Application } path="/">
            <DefaultRoute handler={ Examples } />
            <Route handler={ Examples } path="examples" />
        </Route>
    );
});
