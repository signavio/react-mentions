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
                    { this.renderNavigation() }

                    <h3 className="text-muted">
                        React Mentions
                    </h3>
                </div>
            );
        },

        renderNavigation: function() {

        }
    });

});
