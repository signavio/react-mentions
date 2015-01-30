define([
    "react",

    "react-router",

    "jsx!views/Application",
    "jsx!views/ExamplesView",
    "jsx!views/LicenseView"
], function(
    React,

    Router,

    Application,
    Examples,
    License
) {

    var Route = Router.Route;
    var DefaultRoute = Router.DefaultRoute;

    return (
        <Route handler={ Application } path="react-mentions/">
            <Route handler={ Examples } path="examples" />
            <Route handler={ License } path="License" />
            <DefaultRoute handler={ Examples } />
        </Route>
    );
});
