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
        <Route handler={ Application } path="react-mentions/">
            <DefaultRoute handler={ Examples } />
            <Route handler={ Examples } path="examples" />
        </Route>
    );
});
