import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

import keys from 'lodash/keys'
import values from 'lodash/values'
import omit from 'lodash/omit'
import isEqual from 'lodash/isEqual'
import isNumber from 'lodash/isNumber'

import { defaultStyle } from 'substyle'

import {
  escapeRegex,
  getPlainText,
  applyChangeToValue,
  findStartOfMentionInPlainText,
  getComputedStyleLengthProp,
  getMentions,
  countSuggestions,
  getSuggestion,
  getEndOfLastMention,
  mapPlainTextIndex,
  spliceString,
  makeMentionsMarkup,
} from './utils'
import SuggestionsOverlay from './SuggestionsOverlay'
import Highlighter from './Highlighter'

export const _getTriggerRegex = function(trigger, options = {}) {
  if (trigger instanceof RegExp) {
    return trigger
  } else {
    const { allowSpaceInQuery } = options
    const escapedTriggerChar = escapeRegex(trigger)

    // first capture group is the part to be replaced on completion
    // second capture group is for extracting the search query
    return new RegExp(
      `(?:^|\\s)(${escapedTriggerChar}([^${
        allowSpaceInQuery ? '' : '\\s'
      }${escapedTriggerChar}]*))$`
    )
  }
}

const _getDataProvider = function(data) {
  if (data instanceof Array) {
    // if data is an array, create a function to query that
    return function(query, callback) {
      const results = []
      for (let i = 0, l = data.length; i < l; ++i) {
        const display = data[i].display || data[i].id
        if (display.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
          results.push(data[i])
        }
      }
      return results
    }
  } else {
    // expect data to be a query function
    return data
  }
}

const KEY = { TAB: 9, RETURN: 13, ESC: 27, UP: 38, DOWN: 40 }

let isComposing = false

const propTypes = {
  /**
   * If set to `true` a regular text input element will be rendered
   * instead of a textarea
   */
  singleLine: PropTypes.bool,

  /**
   * If set to `true` spaces will not interrupt matching suggestions
   */
  allowSpaceInQuery: PropTypes.bool,

  markup: PropTypes.string,
  value: PropTypes.string,

  displayTransform: PropTypes.func,
  onKeyDown: PropTypes.func,
  onSelect: PropTypes.func,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onRemove: PropTypes.func,
  suggestionsPortalHost: typeof Element === 'undefined' ? PropTypes.any : PropTypes.PropTypes.instanceOf(Element),
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: typeof Element === 'undefined' ? PropTypes.any : PropTypes.instanceOf(Element) }),
  ]),

  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
}

class MentionsInput extends React.Component {
  static propTypes = propTypes

  static defaultProps = {
    markup: '@[__display__](__id__)',
    singleLine: false,
    displayTransform: function(id, display, type) {
      return display
    },
    onKeyDown: () => null,
    onSelect: () => null,
    onBlur: () => null,
    onRemove: (mentions) => null,
  }

  constructor(props) {
    super(props)
    this.suggestions = {}

    this.state = {
      focusIndex: 0,

      selectionStart: null,
      selectionEnd: null,

      suggestions: {},

      caretPosition: null,
      suggestionsPosition: null,
    }
  }

  render() {
    return (
      <div
        ref={el => {
          this.containerRef = el
        }}
        {...this.props.style}
      >
        {this.renderControl()}
        {this.renderSuggestionsOverlay()}
      </div>
    )
  }

  getInputProps = isTextarea => {
    let { readOnly, disabled, style } = this.props

    // pass all props that we don't use through to the input control
    let props = omit(this.props, 'style', keys(propTypes))

    return {
      ...props,
      ...style('input'),

      value: this.getPlainText(),

      ...(!readOnly &&
        !disabled && {
          onChange: this.handleChange,
          onSelect: this.handleSelect,
          onKeyDown: this.handleKeyDown,
          onBlur: this.handleBlur,
          onCompositionStart: this.handleCompositionStart,
          onCompositionEnd: this.handleCompositionEnd,
          onScroll: this.updateHighlighterScroll,
        }),
    }
  }

  renderControl = () => {
    let { singleLine, style } = this.props
    let inputProps = this.getInputProps(!singleLine)

    return (
      <div {...style('control')}>
        {this.renderHighlighter(inputProps.style)}
        {singleLine
          ? this.renderInput(inputProps)
          : this.renderTextarea(inputProps)}
      </div>
    )
  }

  renderInput = props => {
    return <input type="text" ref={this.setInputRef} {...props} />
  }

  renderTextarea = props => {
    return <textarea ref={this.setInputRef} {...props} />
  }

  setInputRef = el => {
    this.inputRef = el
    const { inputRef } = this.props
    if (typeof inputRef === 'function') {
      inputRef(el)
    } else if (inputRef) {
      inputRef.current = el
    }
  }

  renderSuggestionsOverlay = () => {
    if (!isNumber(this.state.selectionStart)) {
      // do not show suggestions when the input does not have the focus
      return null
    }
    const suggestionsNode = (
      <SuggestionsOverlay
        style={this.props.style('suggestions')}
        position={this.state.suggestionsPosition}
        focusIndex={this.state.focusIndex}
        scrollFocusedIntoView={this.state.scrollFocusedIntoView}
        ref={el => {
          this.suggestionsRef = el
        }}
        suggestions={this.state.suggestions}
        onSelect={this.addMention}
        onMouseDown={this.handleSuggestionsMouseDown}
        onMouseEnter={focusIndex =>
          this.setState({
            focusIndex,
            scrollFocusedIntoView: false,
          })
        }
        isLoading={this.isLoading()}
      />
    )
    if (this.props.suggestionsPortalHost) {
      return ReactDOM.createPortal(
        suggestionsNode,
        this.props.suggestionsPortalHost
      )
    } else {
      return suggestionsNode
    }
  }

  renderHighlighter = inputStyle => {
    const { selectionStart, selectionEnd } = this.state
    const {
      markup,
      displayTransform,
      singleLine,
      children,
      value,
      style,
      regex,
    } = this.props

    return (
      <Highlighter
        ref={el => {
          this.highlighterRef = el
        }}
        style={style('highlighter')}
        inputStyle={inputStyle}
        value={value}
        markup={markup}
        displayTransform={displayTransform}
        singleLine={singleLine}
        selection={{
          start: selectionStart,
          end: selectionEnd,
        }}
        onCaretPositionChange={position =>
          this.setState({ caretPosition: position })
        }
        regex={regex}
      >
        {children}
      </Highlighter>
    )
  }

  // Returns the text to set as the value of the textarea with all markups removed
  getPlainText = () => {
    return getPlainText(
      this.props.value || '',
      this.props.markup,
      this.props.displayTransform,
      this.props.regex
    )
  }

  executeOnChange = (event, ...args) => {
    if (this.props.onChange) {
      return this.props.onChange(event, ...args)
    }

    if (this.props.valueLink) {
      return this.props.valueLink.requestChange(event.target.value, ...args)
    }
  }

  // Handle input element's change event
  handleChange = ev => {
    // if we are inside iframe, we need to find activeElement within its contentDocument
    const currentDocument =
      (document.activeElement && document.activeElement.contentDocument) ||
      document
    if (currentDocument.activeElement !== ev.target) {
      // fix an IE bug (blur from empty input element with placeholder attribute trigger "input" event)
      return
    }

    const value = this.props.value || ''
    const { markup, displayTransform, regex } = this.props

    let newPlainTextValue = ev.target.value

    // Derive the new value to set by applying the local change in the textarea's plain text
    let newValue = applyChangeToValue(
      value,
      markup,
      newPlainTextValue,
      this.state.selectionStart,
      this.state.selectionEnd,
      ev.target.selectionEnd,
      displayTransform,
      regex
    )

    // In case a mention is deleted, also adjust the new plain text value
    newPlainTextValue = getPlainText(newValue, markup, displayTransform, regex)

    // Save current selection after change to be able to restore caret position after rerendering
    let selectionStart = ev.target.selectionStart
    let selectionEnd = ev.target.selectionEnd
    let setSelectionAfterMentionChange = false

    // Adjust selection range in case a mention will be deleted by the characters outside of the
    // selection range that are automatically deleted
    let startOfMention = findStartOfMentionInPlainText(
      value,
      markup,
      selectionStart,
      displayTransform,
      regex
    )

    if (
      startOfMention !== undefined &&
      this.state.selectionEnd > startOfMention
    ) {
      // only if a deletion has taken place
      selectionStart = startOfMention
      selectionEnd = selectionStart
      setSelectionAfterMentionChange = true
    }

    this.setState({
      selectionStart,
      selectionEnd,
      setSelectionAfterMentionChange: setSelectionAfterMentionChange,
    })

    let prevMentions = getMentions(this.props.value, markup, displayTransform, regex)
    let mentions = getMentions(newValue, markup, displayTransform, regex)

    // Check for removed mentions
    var removed = prevMentions.filter(mention => {
      return !Boolean(mentions.find(newMention => newMention.id === mention.id && newMention.display === mention.display))
    }).map(mention => {
      return {id: mention.id, display: mention.display}
    })

    // Call onRemove
    if (removed.length > 0 && this.props.onRemove) {
      this.props.onRemove(removed)
    }

    // Propagate change
    // let handleChange = this.getOnChange(this.props) || emptyFunction;
    let eventMock = { target: { value: newValue } }
    // this.props.onChange.call(this, eventMock, newValue, newPlainTextValue, mentions);
    this.executeOnChange(eventMock, newValue, newPlainTextValue, mentions)
  }

  // Handle input element's select event
  handleSelect = ev => {
    // keep track of selection range / caret position
    this.setState({
      selectionStart: ev.target.selectionStart,
      selectionEnd: ev.target.selectionEnd,
    })

    // do nothing while a IME composition session is active
    if (isComposing) return

    // refresh suggestions queries
    const el = this.inputRef
    if (ev.target.selectionStart === ev.target.selectionEnd) {
      this.updateMentionsQueries(el.value, ev.target.selectionStart)
    } else {
      this.clearSuggestions()
    }

    // sync highlighters scroll position
    this.updateHighlighterScroll()

    this.props.onSelect(ev)
  }

  handleKeyDown = ev => {
    // do not intercept key events if the suggestions overlay is not shown
    const suggestionsCount = countSuggestions(this.state.suggestions)

    const suggestionsComp = this.suggestionsRef
    if (suggestionsCount === 0 || !suggestionsComp) {
      this.props.onKeyDown(ev)

      return
    }

    if (values(KEY).indexOf(ev.keyCode) >= 0) {
      ev.preventDefault()
    }

    switch (ev.keyCode) {
      case KEY.ESC: {
        this.clearSuggestions()
        return
      }
      case KEY.DOWN: {
        this.shiftFocus(+1)
        return
      }
      case KEY.UP: {
        this.shiftFocus(-1)
        return
      }
      case KEY.RETURN: {
        this.selectFocused()
        return
      }
      case KEY.TAB: {
        this.selectFocused()
        return
      }
      default: {
        return
      }
    }
  }

  shiftFocus = delta => {
    let suggestionsCount = countSuggestions(this.state.suggestions)

    this.setState({
      focusIndex:
        (suggestionsCount + this.state.focusIndex + delta) % suggestionsCount,
      scrollFocusedIntoView: true,
    })
  }

  selectFocused = () => {
    let { suggestions, focusIndex } = this.state
    let { suggestion, descriptor } = getSuggestion(suggestions, focusIndex)

    this.addMention(suggestion, descriptor)

    this.setState({
      focusIndex: 0,
    })
  }

  handleBlur = ev => {
    const clickedSuggestion = this._suggestionsMouseDown
    this._suggestionsMouseDown = false

    // only reset selection if the mousedown happened on an element
    // other than the suggestions overlay
    if (!clickedSuggestion) {
      this.setState({
        selectionStart: null,
        selectionEnd: null,
      })
    }

    window.setTimeout(() => {
      this.updateHighlighterScroll()
    }, 1)

    this.props.onBlur(ev, clickedSuggestion)
  }

  handleSuggestionsMouseDown = ev => {
    this._suggestionsMouseDown = true
  }

  updateSuggestionsPosition = () => {
    let { caretPosition } = this.state

    if (!caretPosition || !this.suggestionsRef) {
      return
    }

    let suggestions = ReactDOM.findDOMNode(this.suggestionsRef)
    let highlighter = ReactDOM.findDOMNode(this.highlighterRef)

    if (!suggestions) {
      return
    }

    let position = {}

    // if suggestions menu is in a portal, update position to be releative to its portal node
    if (this.props.suggestionsPortalHost) {
      // first get viewport-relative position (highlighter is offsetParent of caret):
      const caretOffsetParentRect = highlighter.getBoundingClientRect()
      const caretHeight = getComputedStyleLengthProp(highlighter, 'font-size')
      const viewportRelative = {
        left: caretOffsetParentRect.left + caretPosition.left,
        top: caretOffsetParentRect.top + caretPosition.top + caretHeight,
      }
      position.position = 'fixed'
      let left = viewportRelative.left
      position.top = viewportRelative.top
      // absolute/fixed positioned elements are positioned according to their entire box including margins; so we remove margins here:
      left -= getComputedStyleLengthProp(suggestions, 'margin-left')
      position.top -= getComputedStyleLengthProp(suggestions, 'margin-top')
      // take into account highlighter/textinput scrolling:
      left -= highlighter.scrollLeft
      position.top -= highlighter.scrollTop
      // guard for mentions suggestions list clipped by right edge of window
      const viewportWidth = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      )
      if (left + suggestions.offsetWidth > viewportWidth) {
        position.left = Math.max(0, viewportWidth - suggestions.offsetWidth)
      } else {
        position.left = left
      }
    } else {
      let left = caretPosition.left - highlighter.scrollLeft
      // guard for mentions suggestions list clipped by right edge of window
      if (left + suggestions.offsetWidth > this.containerRef.offsetWidth) {
        position.right = 0
      } else {
        position.left = left
      }
      position.top = caretPosition.top - highlighter.scrollTop
    }

    if (isEqual(position, this.state.suggestionsPosition)) {
      return
    }

    this.setState({
      suggestionsPosition: position,
    })
  }

  updateHighlighterScroll = () => {
    if (!this.inputRef || !this.highlighterRef) {
      // since the invocation of this function is deferred,
      // the whole component may have been unmounted in the meanwhile
      return
    }
    const input = this.inputRef
    const highlighter = ReactDOM.findDOMNode(this.highlighterRef)
    highlighter.scrollLeft = input.scrollLeft
    highlighter.scrollTop = input.scrollTop
    highlighter.height = input.height
  }

  handleCompositionStart = () => {
    isComposing = true
  }

  handleCompositionEnd = () => {
    isComposing = false
  }

  componentDidMount() {
    this.updateSuggestionsPosition()
  }

  componentDidUpdate(prevProps) {
    this.updateSuggestionsPosition()

    // maintain selection in case a mention is added/removed causing
    // the cursor to jump to the end
    if (this.state.setSelectionAfterMentionChange) {
      this.setState({ setSelectionAfterMentionChange: false })
      this.setSelection(this.state.selectionStart, this.state.selectionEnd)
    }
  }

  setSelection = (selectionStart, selectionEnd) => {
    if (selectionStart === null || selectionEnd === null) return

    const el = this.inputRef
    if (el.setSelectionRange) {
      el.setSelectionRange(selectionStart, selectionEnd)
    } else if (el.createTextRange) {
      const range = el.createTextRange()
      range.collapse(true)
      range.moveEnd('character', selectionEnd)
      range.moveStart('character', selectionStart)
      range.select()
    }
  }

  updateMentionsQueries = (plainTextValue, caretPosition) => {
    // Invalidate previous queries. Async results for previous queries will be neglected.
    this._queryId++
    this.suggestions = {}
    this.setState({
      suggestions: {},
    })

    const value = this.props.value || ''
    const { markup, displayTransform, children, regex } = this.props
    const positionInValue = mapPlainTextIndex(
      value,
      markup,
      caretPosition,
      'NULL',
      displayTransform,
      regex
    )

    // If caret is inside of mention, do not query
    if (positionInValue === null) {
      return
    }

    // Extract substring in between the end of the previous mention and the caret
    const substringStartIndex = getEndOfLastMention(
      value.substring(0, positionInValue),
      markup,
      displayTransform,
      regex
    )
    const substring = plainTextValue.substring(
      substringStartIndex,
      caretPosition
    )

    // Check if suggestions have to be shown:
    // Match the trigger patterns of all Mention children on the extracted substring
    React.Children.forEach(children, child => {
      if (!child) {
        return
      }

      const regex = _getTriggerRegex(child.props.trigger, this.props)
      const match = substring.match(regex)
      if (match) {
        const querySequenceStart =
          substringStartIndex + substring.indexOf(match[1], match.index)
        this.queryData(
          match[2],
          child,
          querySequenceStart,
          querySequenceStart + match[1].length,
          plainTextValue
        )
      }
    })
  }

  clearSuggestions = () => {
    // Invalidate previous queries. Async results for previous queries will be neglected.
    this._queryId++
    this.suggestions = {}
    this.setState({
      suggestions: {},
      focusIndex: 0,
    })
  }

  queryData = (
    query,
    mentionDescriptor,
    querySequenceStart,
    querySequenceEnd,
    plainTextValue
  ) => {
    const provideData = _getDataProvider(mentionDescriptor.props.data)
    const snycResult = provideData(
      query,
      this.updateSuggestions.bind(
        null,
        this._queryId,
        mentionDescriptor,
        query,
        querySequenceStart,
        querySequenceEnd,
        plainTextValue
      )
    )
    if (snycResult instanceof Array) {
      this.updateSuggestions(
        this._queryId,
        mentionDescriptor,
        query,
        querySequenceStart,
        querySequenceEnd,
        plainTextValue,
        snycResult
      )
    }
  }

  updateSuggestions = (
    queryId,
    mentionDescriptor,
    query,
    querySequenceStart,
    querySequenceEnd,
    plainTextValue,
    suggestions
  ) => {
    // neglect async results from previous queries
    if (queryId !== this._queryId) return

    // save in property so that multiple sync state updates from different mentions sources
    // won't overwrite each other
    this.suggestions = {
      ...this.suggestions,
      [mentionDescriptor.props.type]: {
        query: query,
        mentionDescriptor: mentionDescriptor,
        querySequenceStart: querySequenceStart,
        querySequenceEnd: querySequenceEnd,
        results: suggestions,
        plainTextValue: plainTextValue,
      },
    }

    const { focusIndex } = this.state
    const suggestionsCount = countSuggestions(this.suggestions)
    this.setState({
      suggestions: this.suggestions,
      focusIndex:
        focusIndex >= suggestionsCount
          ? Math.max(suggestionsCount - 1, 0)
          : focusIndex,
    })
  }

  addMention = (
    suggestion,
    { mentionDescriptor, querySequenceStart, querySequenceEnd, plainTextValue }
  ) => {
    // Insert mention in the marked up value at the correct position
    const value = this.props.value || ''
    const { markup, displayTransform, regex } = this.props
    const start = mapPlainTextIndex(
      value,
      markup,
      querySequenceStart,
      'START',
      displayTransform,
      regex
    )
    const end = start + querySequenceEnd - querySequenceStart
    let insert = makeMentionsMarkup(
      markup,
      suggestion.id,
      suggestion.display,
      mentionDescriptor.props.type
    )
    if (mentionDescriptor.props.appendSpaceOnAdd) {
      insert = insert + ' '
    }
    const newValue = spliceString(value, start, end, insert)

    // Refocus input and set caret position to end of mention
    this.inputRef.focus()

    let displayValue = displayTransform(
      suggestion.id,
      suggestion.display,
      mentionDescriptor.props.type
    )
    if (mentionDescriptor.props.appendSpaceOnAdd) {
      displayValue = displayValue + ' '
    }
    const newCaretPosition = querySequenceStart + displayValue.length
    this.setState({
      selectionStart: newCaretPosition,
      selectionEnd: newCaretPosition,
      setSelectionAfterMentionChange: true,
    })

    // Propagate change
    const eventMock = { target: { value: newValue } }
    const mentions = getMentions(newValue, markup, displayTransform, regex)
    const newPlainTextValue = spliceString(
      plainTextValue,
      querySequenceStart,
      querySequenceEnd,
      displayValue
    )

    this.executeOnChange(eventMock, newValue, newPlainTextValue, mentions)

    const onAdd = mentionDescriptor.props.onAdd
    if (onAdd) {
      onAdd(suggestion.id, suggestion.display)
    }

    // Make sure the suggestions overlay is closed
    this.clearSuggestions()
  }

  isLoading = () => {
    let isLoading = false
    React.Children.forEach(this.props.children, function(child) {
      isLoading = isLoading || (child && child.props.isLoading)
    })
    return isLoading
  }

  _queryId = 0
}

const isMobileSafari =
  typeof navigator !== 'undefined' &&
  /iPhone|iPad|iPod/i.test(navigator.userAgent)

const styled = defaultStyle(
  {
    position: 'relative',
    overflowY: 'visible',

    input: {
      display: 'block',
      position: 'absolute',
      top: 0,
      boxSizing: 'border-box',
      backgroundColor: 'transparent',
      width: 'inherit',
      fontFamily: 'inherit',
      fontSize: 'inherit',
    },

    '&multiLine': {
      input: {
        width: '100%',
        height: '100%',
        bottom: 0,
        overflow: 'hidden',
        resize: 'none',

        // fix weird textarea padding in mobile Safari (see: http://stackoverflow.com/questions/6890149/remove-3-pixels-in-ios-webkit-textarea)
        ...(isMobileSafari
          ? {
              marginTop: 1,
              marginLeft: -3,
            }
          : null),
      },
    },
  },
  ({ singleLine }) => ({
    '&singleLine': singleLine,
    '&multiLine': !singleLine,
  })
)

export default styled(MentionsInput)
