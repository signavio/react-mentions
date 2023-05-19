# [React Mentions](https://react-mentions.vercel.app)
[![REUSE status](https://api.reuse.software/badge/github.com/signavio/react-mentions)](https://api.reuse.software/info/github.com/signavio/react-mentions)

A React component that let's you mention people in a textarea like you are used to on Facebook or Twitter.

Used in production at [Signavio](https://signavio.com), [State](https://state.com), [Snips](https://snips.ai), [Swat.io](https://swat.io), [GotDone](https://www.gotdone.me), [Volinspire](https://volinspire.com), [Marvin](https://amazingmarvin.com), [Timely](https://timelyapp.com), [GuideFitter](https://www.guidefitter.com/), [Evite](https://www.evite.com/), [Publer](https://publer.me/), [Kontentino](https://www.kontentino.com/), [Wix.com](https://wix.com), [Highlight](https://highlight.run/) and [you?](https://github.com/signavio/react-mentions/edit/master/README.md)

## Getting started

Install the _react-mentions_ package via npm:

```
npm install react-mentions --save
```

Or yarn:

```
yarn add react-mentions
```

The package exports two React components for rendering the mentions textarea:

```javascript
import { MentionsInput, Mention } from 'react-mentions'
```

`MentionsInput` is the main component rendering the textarea control. It takes one or multiple `Mention` components as its children. Each `Mention` component represents a data source for a specific class of mentionable objects, such as users, template variables, issues, etc.

Example:

```jsx
<MentionsInput value={this.state.value} onChange={this.handleChange}>
  <Mention
    trigger="@"
    data={this.props.users}
    renderSuggestion={this.renderUserSuggestion}
  />
  <Mention
    trigger="#"
    data={this.requestTag}
    renderSuggestion={this.renderTagSuggestion}
  />
</MentionsInput>
```

You can find more examples here: [demo/src/examples](https://github.com/signavio/react-mentions/tree/master/demo/src/examples)

## Configuration

The `MentionsInput` supports the following props for configuring the widget:

| Prop name                   | Type                                                    | Default value  | Description                                                                            |
| --------------------------- | ------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------- |
| value                       | string                                                  | `''`           | The value containing markup for mentions                                               |
| onChange                    | function (event, newValue, newPlainTextValue, mentions) | empty function | A callback that is invoked when the user changes the value in the mentions input       |
| onKeyDown                   | function (event)                                        | empty function | A callback that is invoked when the user presses a key in the mentions input           |
| singleLine                  | boolean                                                 | `false`        | Renders a single line text input instead of a textarea, if set to `true`               |
| onBlur                      | function (event, clickedSuggestion)                     | empty function | Passes `true` as second argument if the blur was caused by a mousedown on a suggestion |
| allowSpaceInQuery           | boolean                                                 | false          | Keep suggestions open even if the user separates keywords with spaces.                 |
| suggestionsPortalHost       | DOM Element                                             | undefined      | Render suggestions into the DOM in the supplied host element.                          |
| inputRef                    | React ref                                               | undefined      | Accepts a React ref to forward to the underlying input element                         |
| allowSuggestionsAboveCursor | boolean                                                 | false          | Renders the SuggestionList above the cursor if there is not enough space below         |
| forceSuggestionsAboveCursor | boolean                                                 | false          | Forces the SuggestionList to be rendered above the cursor                              |
| a11ySuggestionsListLabel    | string                                                  | `''`           | This label would be exposed to screen readers when suggestion popup appears            |
| customSuggestionsContainer  | function(children)                                      | empty function | Allows customizing the container of the suggestions                                    |

Each data source is configured using a `Mention` component, which has the following props:

| Prop name        | Type                                                         | Default value                               | Description                                                                                                                                            |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| trigger          | regexp or string                                             | `'@'`                                       | Defines the char sequence upon which to trigger querying the data source                                                                               |
| data             | array or function (search, callback)                         | `null`                                      | An array of the mentionable data entries (objects with `id` & `display` keys, or a filtering function that returns an array based on a query parameter |
| renderSuggestion | function (entry, search, highlightedDisplay, index, focused) | `null`                                      | Allows customizing how mention suggestions are rendered (optional)                                                                                     |
| markup           | string                                                       | `'@[__display__](__id__)'`                  | A template string for the markup to use for mentions                                                                                                   |
| displayTransform | function (id, display)                                       | returns `display`                           | Accepts a function for customizing the string that is displayed for a mention                                                                          |
| regex            | RegExp                                                       | automatically derived from `markup` pattern | Allows providing a custom regular expression for parsing your markup and extracting the placeholder interpolations (optional)                          |  |
| onAdd            | function (id, display, startPos, endPos)                     | empty function                              | Callback invoked when a suggestion has been added (optional)                                                                                           |
| appendSpaceOnAdd | boolean                                                      | `false`                                     | Append a space when a suggestion has been added (optional)                                                                                             |

If a function is passed as the `data` prop, that function will be called with the current search query as first, and a callback function as second argument. The callback can be used to provide results asynchronously, e.g., after fetch requests. (It can even be called multiple times to update the list of suggestions.)

## Styling

_react-mentions_ supports css, css modules, and inline styles. It is shipped with only some essential inline style definitions and without any css. Some example inline styles demonstrating how to customize the appearance of the `MentionsInput` can be found at [demo/src/examples/defaultStyle.js](https://github.com/signavio/react-mentions/blob/master/demo/src/examples/defaultStyle.js).

If you want to use css, simply assign a `className` prop to `MentionsInput`. All DOM nodes rendered by the component will then receive class name attributes that are derived from the base class name you provided.

If you want to avoid global class names and use css modules instead, you can provide the automatically generated class names as `classNames` to the `MentionsInput`. See [demo/src/examples/CssModules.js](https://github.com/signavio/react-mentions/blob/master/demo/src/examples/CssModules.js) for an example of using _react-mentions_ with css modules.

You can also assign `className` and `style` props to the `Mention` elements to define how to highlight the mentioned words.

## Testing

Due to react-mentions' internal cursor tracking it is not good enough to simulate the editing of the textarea value using `ReactTestUtils.Simulate.change`.
We recommend using [@testing-library/user-event](https://github.com/testing-library/user-event) for a realistic simulation of events as they would happen in the browser as the user interacts the textarea.

---

If you want to contribute, first of all: thank you ❤️.
Please check [CONTRIBUTING.md](/CONTRIBUTING.md) and/or create an issue.
