# [React Mentions](http://effektif.github.io/react-mentions)

feram test

[![Build Status](https://travis-ci.org/effektif/react-mentions.svg?branch=master)](https://travis-ci.org/effektif/react-mentions)
[![Dependency Status](https://david-dm.org/effektif/react-mentions.svg)](https://david-dm.org/effektif/react-mentions)
[![npm version](https://badge.fury.io/js/react-mentions.svg)](http://badge.fury.io/js/react-mentions)


A React component that let's you mention people in a textarea like you are used to on Facebook or Twitter.

##### Used in production at:
- [Signavio](https://signavio.com)
- [State](https://state.com)
- [Snips](https://snips.ai)
- [Swat.io](https://swat.io)
- [GotDone](https://www.gotdone.me)
- [Volinspire](https://volinspire.com)
- [Marvin](https://amazingmarvin.com)
- [Timely](https://timelyapp.com)
- [GuideFitter](https://www.guidefitter.com/)

Please [let us know](mailto:wolf.pack@signavio.com?subject=we're%20using%20react-mentions%20at%20...) if you are using react-mentions, we'd love to add you to this list.


## Getting started

Install the _react-mentions_ package via npm:

```
npm install react-mentions --save
```


Require the _react-mentions_ package, which exports the two relevant React components for rendering the mentions textarea:

```javascript
import { MentionsInput, Mention } from 'react-mentions'
```

`MentionsInput` is the main component rendering the textarea control. It takes one or multiple `Mention` components as its children. Each `Mention` component represents a data source for a specific class of mentionable objects, such as users, template variables, issues, etc.


Example:

```jsx
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
| displayTransform | function (id, display, type)                            | returns `display`          | Accepts a function for customizing the string that is displayed for a mention            |
| onBlur           | function (event, clickedSuggestion)          | empty function             | Passes `true` as second argument if the blur was caused by a mousedown on a suggestion       |
| allowSpaceInQuery | boolean               | false           | Keep suggestions open even if the user separates keywords with spaces. |

Each data source is configured using a `Mention` component, which has the following props:

| Prop name        | Type                   | Default value   | Description                                                                 |
|------------------|------------------------|-----------------|-----------------------------------------------------------------------------|
| trigger          | regexp or string       | `'@'`           | Defines the char sequence upon which to trigger querying the data source    |
| type             | string                 | `null`          | Identifier for the data source, when using multiple data sources (optional) |
| data             | array or function (search, callback) | `null`          | An array of the mentionable data entries (objects with `id` & `display` keys, or a filtering function that returns an array based on a query parameter |
| renderSuggestion | function (entry, search, highlightedDisplay, index)              | `null`          | Allows customizing how mention suggestions are rendered (optional)         |
| onAdd            | function (id, display) | empty function  | Callback invoked when a suggestion has been added (optional)                |
| appendSpaceOnAdd | boolean                | false           | Append a space when a suggestion has been added (optional)                  |

If a function is passed as the `data` prop, that function will be called with the current search query as first, and a callback function as second argument. The callback can be used to provide results asynchronously, e.g., after fetch requests. (It can even be called multiple times to update the list of suggestions.)


## Styling

_react-mentions_ supports css, css modules, and inline styles. It is shipped with only some essential inline style definitions and without any css. Some example inline styles demonstrating how to customize the appearance of the `MentionsInput` can be found at [gh-pages/views/examples/defaultStyle.js](https://github.com/effektif/react-mentions/tree/gh-pages/views/examples/defaultStyle.js).

If you want to use css, simply assign a `className` prop to `MentionsInput`. All DOM nodes rendered by the component will then receive class name attributes that are derived from the base class name you provided.

If you want to avoid global class names and use css modules instead, you can provide the automatically generated class names as `classNames` to the `MentionsInput`. See [gh-pages/views/examples/CssModules.js](https://github.com/effektif/react-mentions/tree/gh-pages/views/examples/CssModules.js) for an example of using _react-mentions_ with css modules.

You can also assign `className` and `style` props to the `Mention` elements to define how to highlight the mentioned words.


## Contributing

Spawn a development server with an example page and module hot loading all set up:

```
npm start
```

Update the examples page on Github Pages:

```
npm run pages-publish
```
