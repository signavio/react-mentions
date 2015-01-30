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
            <Route handler={ Examples } name="examples" path="examples" />
            <Route handler={ License } name="license" path="license" />
            <DefaultRoute handler={ Examples } />
        </Route>
    );
});
