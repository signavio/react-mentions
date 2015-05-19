var React = require("react");

var Router = require("react-router");

var Application = require("./views/Application");
var Examples = require("./views/ExamplesView");
var License = require("./views/LicenseView");

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;

module.exports = (
    <Route handler={ Application } path="/">
        <Route handler={ Examples } name="examples" path="examples" />
        <Route handler={ License } name="license" path="license" />
        <DefaultRoute handler={ Examples } />
    </Route>
);