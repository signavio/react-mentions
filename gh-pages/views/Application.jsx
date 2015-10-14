var React = require("react");

var Header = require("./HeaderView");
var Examples = require("./ExamplesView");
var License = require("./LicenseView");
require("../less/react-mentions.less");

module.exports = React.createClass({

  displayName: "ReactMentions",

  render: function() {
    return (
      <div className="react-mentions">
        <Header />

        <div className="container">
          <h2 id="examples">Examples</h2>
          <Examples />

          <h2 id="license">License</h2>
          <License />
        </div>
      </div>
    );
  }
});
