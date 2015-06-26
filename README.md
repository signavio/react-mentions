#[React Mentions](http://effektif.github.io/react-mentions)

[![Build Status](https://travis-ci.org/effektif/react-mentions.svg?branch=master)](https://travis-ci.org/effektif/react-mentions)
[![Dependency Status](https://david-dm.org/effektif/react-mentions.svg)](https://david-dm.org/effektif/react-mentions)
[![npm version](https://badge.fury.io/js/react-mentions.svg)](http://badge.fury.io/js/react-mentions)
[![Bower version](https://badge.fury.io/bo/react-mentions.svg)](http://badge.fury.io/bo/react-mentions)


A React component that let's you mention people in a textarea like you are used to on Facebook or Twitter.



## Getting started

Install the react-mentions package via NPM:

```
npm install react-mentions
```


Require the react-mentions package, which exports the two relevant React components for rendering the mentions textarea:

```
var mentions = require("react-mentions");

var MentionsInput = mentions.MentionsInput;
var Mention = mentions.Mention;
```

`MentionsInput` is the main component rendering the textarea control. It takes one or multiple `Mention` components as its children. Each `Mention` component represents a data source for a specific class of mentionable objects, such as users, template variables, issues, etc.


Example:

```
<MentionsInput value={this.state.value} onChange={this.handleChange}>
    <Mention trigger="@"
        data={this.props.users}
        renderSuggestion={this.renderUserSuggestion} />
    <Mention trigger="#"
        data={this.requestTag}
        renderSuggestion={this.renderTagSuggestion} />
</MentionsInput>
```

You can find more examples here: [gh-pages/views/examples](https://github.com/effektif/react-mentions/tree/master/gh-pages/views/examples)


## Configuration

The `MentionsInput` supports the following props for configuring the widget:

| Prop name        | Type                                                    | Default value              | Description                                                                              |
|------------------|---------------------------------------------------------|----------------------------|------------------------------------------------------------------------------------------|
| value            | string                                                  | `''`                       | The value containing markup for mentions                                                 |
| onChange         | function (event, newValue, newPlainTextValue, mentions) | empty function             | A callback that is invoked when the user changes the value in the mentions input         |
| markup           | string                                                  | `'@[__display__](__id__)'` | A template string for the markup to use for mentions                                     |
| singleLine       | boolean                                                 | `false`                    | Renders a single line text input instead of a textarea, if set to `true`                 |
| displayTransform | function (id, display, type)                            | returns `display`          | Accepts a function for customizing the string that is displayed for a mention (optional) |


Each data source is configured using a `Mention` component, which has the following props:

| Prop name        | Type                   | Default value   | Description                                                                 |
|------------------|------------------------|-----------------|-----------------------------------------------------------------------------|
| trigger          | regexp or string       | `'@'`           | Defines the char sequence upon which to trigger querying the data source    |
| type             | string                 | `null`          | Identifier for the data source, when using multiple data sources (optional) |
| data             | array or function      | `null`          | An array of the mentionable data entries, or a filtering function that returns an array based on a query parameter |
| renderSuggestion | function               | `null`          | Allows customizing how mention suggestions are rendered (optional)          |
| onAdd            | function (id, display) | empty function  | Callback invoked when a suggestion has been added (optional)                |


## Contributing

Only modify the JSX sources in the `/src` directory, the contents of the `/lib` directory will be overwritten during the build process. Spawn a development server with an example page and module hot loading all set up:

```
npm run start
```

To transpile the JSX sources, run the following command:

```
npm run transpile
```

To update the combined and minified browser build, use the "dist" script:

```
npm run dist
```
