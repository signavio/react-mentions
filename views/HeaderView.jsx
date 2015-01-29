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
          <div className="navbar-fixed-top">
            <div className="container">

              { this.renderNavigation() }

              <h3 className="text-muted">
                React Mentions
              </h3>
            </div>
          </div>
        </div>
      );
    },

    renderNavigation: function() {

    }
  });

});
