define([
    "react",

    "react-router",

    "jsx!views/Application",
    "jsx!views/ExamplesView"
], function(
    React,

    Router,

    Application,
    Examples
) {

    var Route = Router.Route;
    var DefaultRoute = Router.DefaultRoute;

    return (
        <Route handler={ Application } path="/">
            <Route handler={ Examples } path="examples" />
            <DefaultRoute handler={ Examples } />
        </Route>
    );
});
