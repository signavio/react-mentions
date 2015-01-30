define([
  "react",

  "jsx!views/HeaderView"
], function(
  React,

  Header
) {

  return React.createClass({

    displayName: "ReactMentions",

    render: function() {
      return (
        <div className="react-mentions">
          <Header />

          <div className="container">
            { this.props.page }
          </div>
        </div>
      );
    }
  });

});
