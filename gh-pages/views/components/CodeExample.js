define([
    "react"
], function(
    React
) {

    return React.createClass({

        displayName: "Example",

        getInitialState: function() {
            return {
                code: false,
                live: true,
                loading: true
            };
        },

        componentWillMount: function() {
            require(["text!" + this.props.code], function(code) {
                var match = code.match(/<MentionsInput>(.*)<\/MentionsInput>/i);

                this.setState({
                    loading: false,
                    code: match[1]
                });
            }.bind(this));
        },

        render: function() {
            return (
                <div className="example">
                    { this.renderNav() }
                    { this.renderContent() }
                </div>
            );
        },

        renderNav: function() {
            return (
                <ul className="nav nav-tabs nav-justified">
                    <li className={ this.state.live ? "active" : "" }>
                        <a href="#" onClick={ this.goLive }>
                            Example
                        </a>
                    </li>
                    <li className={ this.state.code ? "active" : "" }>
                        <a href="#" onClick={ this.goCode }>
                            Code
                        </a>
                    </li>
                </ul>
            );
        },

        goLive: function() {
            this.setState({
                code: false,
                live: true
            });
        },

        goCode: function() {
            this.setState({
                code: true,
                live: false
            });
        },

        renderContent: function() {
            if(this.state.live) {
                return this.props.children;
            }

            return this.getCode();
        }
    });

});
