var React = require("react");
var ReactDOM = require("react-dom");
var Application = require("./views/Application");
require("./less/react-mentions.less");

ReactDOM.render(React.createElement(Application, null), document.getElementById('app'));
