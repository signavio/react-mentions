define([
  "react"
], function(
  React
) {

  return React.createClass({

    displayName: "Header",

    render: function() {
      return (
        <div className="header">
          <div className="navbar navbar-fixed-top">
            <div className="container">

              { this.renderNavigation() }

              <h1>
                React Mentions
              </h1>
            </div>
          </div>
        </div>
      );
    },

    renderNavigation: function() {

    }
  });

});
