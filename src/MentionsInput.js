import React, { Children } from 'react'
import {
    applyChangeToValue,
    countSuggestions,
    escapeRegex,
    findStartOfMentionInPlainText,
    getEndOfLastMention,
    getMentions,
    getPlainText,
    getSubstringIndex,
    makeMentionsMarkup,
    mapPlainTextIndex,
    readConfigFromChildren,
    spliceString,
    isIE,
    isNumber,
    keys,
    omit,
    getSuggestionHtmlId,
} from './utils'

import Highlighter from './Highlighter'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import SuggestionsOverlay from './SuggestionsOverlay'
import { defaultStyle } from './utils'

export const makeTriggerRegex = function(trigger, options = {}) {
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

const getDataProvider = function(data, ignoreAccents) {
    if (data instanceof Array) {
        // if data is an array, create a function to query that
        return function(query, callback) {
            const results = []
            for (let i = 0, l = data.length; i < l; ++i) {
                const display = data[i].display || data[i].id
                if (getSubstringIndex(display, query, ignoreAccents) >= 0) {
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
    allowSpaceInQuery: PropTypes.bool,
    allowSuggestionsAboveCursor: PropTypes.bool,
    forceSuggestionsAboveCursor: PropTypes.bool,
    ignoreAccents: PropTypes.bool,
    a11ySuggestionsListLabel: PropTypes.string,

    value: PropTypes.string,
    onKeyDown: PropTypes.func,
    customSuggestionsContainer: PropTypes.func,
    onSelect: PropTypes.func,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    suggestionsPortalHost:
        typeof Element === 'undefined'
            ? PropTypes.any
            : PropTypes.PropTypes.instanceOf(Element),
    inputRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({
            current:
                typeof Element === 'undefined'
                    ? PropTypes.any
                    : PropTypes.instanceOf(Element),
        }),
    ]),

    children: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.arrayOf(PropTypes.element),
    ]).isRequired,
}

class MentionsInput extends React.Component {
    static propTypes = propTypes

    static defaultProps = {
        ignoreAccents: false,
        singleLine: false,
        allowSuggestionsAboveCursor: false,
        onKeyDown: () => null,
        onSelect: () => null,
        onBlur: () => null,
    }

    constructor(props) {
        super(props)
        this.suggestions = {}
        this.uuidSuggestionsOverlay = Math.random()
            .toString(16)
            .substring(2)

        this.handleCopy = this.handleCopy.bind(this)
        this.handleCut = this.handleCut.bind(this)
        this.handlePaste = this.handlePaste.bind(this)

        this.state = {
            focusIndex: 0,

            selectionStart: null,
            selectionEnd: null,

            suggestions: {},

            caretPosition: null,
            suggestionsPosition: {},
        }
    }

    componentDidMount() {
        document.addEventListener('copy', this.handleCopy)
        document.addEventListener('cut', this.handleCut)
        document.addEventListener('paste', this.handlePaste)

        this.updateSuggestionsPosition()
    }

    componentDidUpdate(prevProps, prevState) {
        // Update position of suggestions unless this componentDidUpdate was
        // triggered by an update to suggestionsPosition.
        if (prevState.suggestionsPosition === this.state.suggestionsPosition) {
            this.updateSuggestionsPosition()
        }

        // maintain selection in case a mention is added/removed causing
        // the cursor to jump to the end
        if (this.state.setSelectionAfterMentionChange) {
            this.setState({ setSelectionAfterMentionChange: false })
            this.setSelection(
                this.state.selectionStart,
                this.state.selectionEnd
            )
        }
    }

    componentWillUnmount() {
        document.removeEventListener('copy', this.handleCopy)
        document.removeEventListener('cut', this.handleCut)
        document.removeEventListener('paste', this.handlePaste)
    }

    render() {
        return (
            <div ref={this.setContainerElement} {...this.props.style}>
                {this.renderControl()}
                {this.renderSuggestionsOverlay()}
            </div>
        )
    }

    setContainerElement = (el) => {
        this.containerElement = el
    }

    getInputProps = () => {
        let { readOnly, disabled, style } = this.props

        // pass all props that neither we, nor substyle, consume through to the input control
        let props = omit(
            this.props,
            ['style', 'classNames', 'className'], // substyle props
            keys(propTypes)
        )

        return {
            ...props,
            ...style('input'),

            value: this.getPlainText(),
            onScroll: this.updateHighlighterScroll,

            ...(!readOnly &&
                !disabled && {
                    onChange: this.handleChange,
                    onSelect: this.handleSelect,
                    onKeyDown: this.handleKeyDown,
                    onBlur: this.handleBlur,
                    onCompositionStart: this.handleCompositionStart,
                    onCompositionEnd: this.handleCompositionEnd,
                }),

            ...(this.isOpened() && {
                role: 'combobox',
                'aria-controls': this.uuidSuggestionsOverlay,
                'aria-expanded': true,
                'aria-autocomplete': 'list',
                'aria-haspopup': 'listbox',
                'aria-activedescendant': getSuggestionHtmlId(
                    this.uuidSuggestionsOverlay,
                    this.state.focusIndex
                ),
            }),
        }
    }

    renderControl = () => {
        let { singleLine, style } = this.props
        let inputProps = this.getInputProps()

        return (
            <div {...style('control')}>
                {this.renderHighlighter()}
                {singleLine
                    ? this.renderInput(inputProps)
                    : this.renderTextarea(inputProps)}
            </div>
        )
    }

    renderInput = (props) => {
        return <input type="text" ref={this.setInputRef} {...props} />
    }

    renderTextarea = (props) => {
        return <textarea autoFocus ref={this.setInputRef} {...props} />
    }

    setInputRef = (el) => {
        this.inputElement = el
        const { inputRef } = this.props
        if (typeof inputRef === 'function') {
            inputRef(el)
        } else if (inputRef) {
            inputRef.current = el
        }
    }

    setSuggestionsElement = (el) => {
        this.suggestionsElement = el
    }

    renderSuggestionsOverlay = () => {
        if (!isNumber(this.state.selectionStart)) {
            // do not show suggestions when the input does not have the focus
            return null
        }

        const { position, left, top, right } = this.state.suggestionsPosition

        const suggestionsNode = (
            <SuggestionsOverlay
                id={this.uuidSuggestionsOverlay}
                style={this.props.style('suggestions')}
                position={position}
                left={left}
                top={top}
                right={right}
                focusIndex={this.state.focusIndex}
                scrollFocusedIntoView={this.state.scrollFocusedIntoView}
                containerRef={this.setSuggestionsElement}
                suggestions={this.state.suggestions}
                customSuggestionsContainer={
                    this.props.customSuggestionsContainer
                }
                onSelect={this.addMention}
                onMouseDown={this.handleSuggestionsMouseDown}
                onMouseEnter={this.handleSuggestionsMouseEnter}
                isLoading={this.isLoading()}
                isOpened={this.isOpened()}
                ignoreAccents={this.props.ignoreAccents}
                a11ySuggestionsListLabel={this.props.a11ySuggestionsListLabel}
            >
                {this.props.children}
            </SuggestionsOverlay>
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

    renderHighlighter = () => {
        const { selectionStart, selectionEnd } = this.state
        const { singleLine, children, value, style } = this.props

        return (
            <Highlighter
                containerRef={this.setHighlighterElement}
                style={style('highlighter')}
                value={value}
                singleLine={singleLine}
                selectionStart={selectionStart}
                selectionEnd={selectionEnd}
                onCaretPositionChange={this.handleCaretPositionChange}
            >
                {children}
            </Highlighter>
        )
    }

    setHighlighterElement = (el) => {
        this.highlighterElement = el
    }

    handleCaretPositionChange = (position) => {
        this.setState({ caretPosition: position })
    }

    // Returns the text to set as the value of the textarea with all markups removed
    getPlainText = () => {
        return getPlainText(
            this.props.value || '',
            readConfigFromChildren(this.props.children)
        )
    }

    executeOnChange = (event, ...args) => {
        if (this.props.onChange) {
            return this.props.onChange(event, ...args)
        }

        if (this.props.valueLink) {
            return this.props.valueLink.requestChange(
                event.target.value,
                ...args
            )
        }
    }

    handlePaste(event) {
        if (event.target !== this.inputElement) {
            return
        }
        if (!this.supportsClipboardActions(event)) {
            return
        }

        event.preventDefault()

        const { selectionStart, selectionEnd } = this.state
        const { value, children } = this.props

        const config = readConfigFromChildren(children)

        const markupStartIndex = mapPlainTextIndex(
            value,
            config,
            selectionStart,
            'START'
        )
        const markupEndIndex = mapPlainTextIndex(
            value,
            config,
            selectionEnd,
            'END'
        )

        const pastedMentions = event.clipboardData.getData(
            'text/react-mentions'
        )
        const pastedData = event.clipboardData.getData('text/plain')

        const newValue = spliceString(
            value,
            markupStartIndex,
            markupEndIndex,
            pastedMentions || pastedData
        ).replace(/\r/g, '')

        const newPlainTextValue = getPlainText(newValue, config)

        const eventMock = { target: { ...event.target, value: newValue } }

        this.executeOnChange(
            eventMock,
            newValue,
            newPlainTextValue,
            getMentions(newValue, config)
        )

        // Move the cursor position to the end of the pasted data
        const startOfMention = findStartOfMentionInPlainText(
            value,
            config,
            selectionStart
        )
        const nextPos =
            (startOfMention || selectionStart) +
            getPlainText(pastedMentions || pastedData, config).length
        this.setSelection(nextPos, nextPos)
    }

    saveSelectionToClipboard(event) {
        // use the actual selectionStart & selectionEnd instead of the one stored
        // in state to ensure copy & paste also works on disabled inputs & textareas
        const selectionStart = this.inputElement.selectionStart
        const selectionEnd = this.inputElement.selectionEnd
        const { children, value } = this.props

        const config = readConfigFromChildren(children)

        const markupStartIndex = mapPlainTextIndex(
            value,
            config,
            selectionStart,
            'START'
        )
        const markupEndIndex = mapPlainTextIndex(
            value,
            config,
            selectionEnd,
            'END'
        )

        event.clipboardData.setData(
            'text/plain',
            event.target.value.slice(selectionStart, selectionEnd)
        )
        event.clipboardData.setData(
            'text/react-mentions',
            value.slice(markupStartIndex, markupEndIndex)
        )
    }

    supportsClipboardActions(event) {
        return !!event.clipboardData
    }

    handleCopy(event) {
        if (event.target !== this.inputElement) {
            return
        }
        if (!this.supportsClipboardActions(event)) {
            return
        }

        event.preventDefault()

        this.saveSelectionToClipboard(event)
    }

    handleCut(event) {
        if (event.target !== this.inputElement) {
            return
        }
        if (!this.supportsClipboardActions(event)) {
            return
        }

        event.preventDefault()

        this.saveSelectionToClipboard(event)

        const { selectionStart, selectionEnd } = this.state
        const { children, value } = this.props

        const config = readConfigFromChildren(children)

        const markupStartIndex = mapPlainTextIndex(
            value,
            config,
            selectionStart,
            'START'
        )
        const markupEndIndex = mapPlainTextIndex(
            value,
            config,
            selectionEnd,
            'END'
        )

        const newValue = [
            value.slice(0, markupStartIndex),
            value.slice(markupEndIndex),
        ].join('')
        const newPlainTextValue = getPlainText(newValue, config)

        const eventMock = {
            target: { ...event.target, value: newPlainTextValue },
        }

        this.executeOnChange(
            eventMock,
            newValue,
            newPlainTextValue,
            getMentions(value, config)
        )
    }

    // Handle input element's change event
    handleChange = (ev) => {
        isComposing = false
        if (isIE()) {
            // if we are inside iframe, we need to find activeElement within its contentDocument
            const currentDocument =
                (document.activeElement &&
                    document.activeElement.contentDocument) ||
                document
            if (currentDocument.activeElement !== ev.target) {
                // fix an IE bug (blur from empty input element with placeholder attribute trigger "input" event)
                return
            }
        }

        const value = this.props.value || ''
        const config = readConfigFromChildren(this.props.children)

        let newPlainTextValue = ev.target.value

        // Derive the new value to set by applying the local change in the textarea's plain text
        let newValue = applyChangeToValue(
            value,
            newPlainTextValue,
            {
                selectionStartBefore: this.state.selectionStart,
                selectionEndBefore: this.state.selectionEnd,
                selectionEndAfter: ev.target.selectionEnd,
            },
            config
        )

        // In case a mention is deleted, also adjust the new plain text value
        newPlainTextValue = getPlainText(newValue, config)

        // Save current selection after change to be able to restore caret position after rerendering
        let selectionStart = ev.target.selectionStart
        let selectionEnd = ev.target.selectionEnd
        let setSelectionAfterMentionChange = false

        // Adjust selection range in case a mention will be deleted by the characters outside of the
        // selection range that are automatically deleted
        let startOfMention = findStartOfMentionInPlainText(
            value,
            config,
            selectionStart
        )

        if (
            startOfMention !== undefined &&
            this.state.selectionEnd > startOfMention
        ) {
            // only if a deletion has taken place
            selectionStart =
                startOfMention +
                (ev.nativeEvent.data ? ev.nativeEvent.data.length : 0)
            selectionEnd = selectionStart
            setSelectionAfterMentionChange = true
        }

        this.setState({
            selectionStart,
            selectionEnd,
            setSelectionAfterMentionChange: setSelectionAfterMentionChange,
        })

        let mentions = getMentions(newValue, config)

        // Propagate change
        // let handleChange = this.getOnChange(this.props) || emptyFunction;
        let eventMock = { target: { value: newValue } }
        // this.props.onChange.call(this, eventMock, newValue, newPlainTextValue, mentions);
        this.executeOnChange(eventMock, newValue, newPlainTextValue, mentions)
    }

    // Handle input element's select event
    handleSelect = (ev) => {
        // keep track of selection range / caret position
        this.setState({
            selectionStart: ev.target.selectionStart,
            selectionEnd: ev.target.selectionEnd,
        })

        // do nothing while a IME composition session is active
        if (isComposing) return

        // refresh suggestions queries
        const el = this.inputElement
        if (ev.target.selectionStart === ev.target.selectionEnd) {
            this.updateMentionsQueries(el.value, ev.target.selectionStart)
        } else {
            this.clearSuggestions()
        }

        // sync highlighters scroll position
        this.updateHighlighterScroll()

        this.props.onSelect(ev)
    }

    handleKeyDown = (ev) => {
        // do not intercept key events if the suggestions overlay is not shown
        const suggestionsCount = countSuggestions(this.state.suggestions)

        if (suggestionsCount === 0 || !this.suggestionsElement) {
            this.props.onKeyDown(ev)

            return
        }

        if (Object.values(KEY).indexOf(ev.keyCode) >= 0) {
            ev.preventDefault()
            ev.stopPropagation()
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

    shiftFocus = (delta) => {
        const suggestionsCount = countSuggestions(this.state.suggestions)

        this.setState({
            focusIndex:
                (suggestionsCount + this.state.focusIndex + delta) %
                suggestionsCount,
            scrollFocusedIntoView: true,
        })
    }

    selectFocused = () => {
        const { suggestions, focusIndex } = this.state

        const { result, queryInfo } = Object.values(suggestions).reduce(
            (acc, { results, queryInfo }) => [
                ...acc,
                ...results.map((result) => ({ result, queryInfo })),
            ],
            []
        )[focusIndex]

        this.addMention(result, queryInfo)

        this.setState({
            focusIndex: 0,
        })
    }

    handleBlur = (ev) => {
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

    handleSuggestionsMouseDown = (ev) => {
        this._suggestionsMouseDown = true
    }

    handleSuggestionsMouseEnter = (focusIndex) => {
        this.setState({
            focusIndex,
            scrollFocusedIntoView: false,
        })
    }

    updateSuggestionsPosition = () => {
        let { caretPosition } = this.state
        const {
            suggestionsPortalHost,
            allowSuggestionsAboveCursor,
            forceSuggestionsAboveCursor,
        } = this.props

        if (!caretPosition || !this.suggestionsElement) {
            return
        }

        let suggestions = this.suggestionsElement
        let highlighter = this.highlighterElement
        // first get viewport-relative position (highlighter is offsetParent of caret):
        const caretOffsetParentRect = highlighter.getBoundingClientRect()
        const caretHeight = getComputedStyleLengthProp(highlighter, 'font-size')
        const viewportRelative = {
            left: caretOffsetParentRect.left + caretPosition.left,
            top: caretOffsetParentRect.top + caretPosition.top + caretHeight,
        }
        const viewportHeight = Math.max(
            document.documentElement.clientHeight,
            window.innerHeight || 0
        )

        if (!suggestions) {
            return
        }

        let position = {}

        // if suggestions menu is in a portal, update position to be releative to its portal node
        if (suggestionsPortalHost) {
            position.position = 'fixed'
            let left = viewportRelative.left
            let top = viewportRelative.top
            // absolute/fixed positioned elements are positioned according to their entire box including margins; so we remove margins here:
            left -= getComputedStyleLengthProp(suggestions, 'margin-left')
            top -= getComputedStyleLengthProp(suggestions, 'margin-top')
            // take into account highlighter/textinput scrolling:
            left -= highlighter.scrollLeft
            top -= highlighter.scrollTop
            // guard for mentions suggestions list clipped by right edge of window
            const viewportWidth = Math.max(
                document.documentElement.clientWidth,
                window.innerWidth || 0
            )
            if (left + suggestions.offsetWidth > viewportWidth) {
                position.left = Math.max(
                    0,
                    viewportWidth - suggestions.offsetWidth
                )
            } else {
                position.left = left
            }
            // guard for mentions suggestions list clipped by bottom edge of window if allowSuggestionsAboveCursor set to true.
            // Move the list up above the caret if it's getting cut off by the bottom of the window, provided that the list height
            // is small enough to NOT cover up the caret
            if (
                (allowSuggestionsAboveCursor &&
                    top + suggestions.offsetHeight > viewportHeight &&
                    suggestions.offsetHeight < top - caretHeight) ||
                forceSuggestionsAboveCursor
            ) {
                position.top = Math.max(
                    0,
                    top - suggestions.offsetHeight - caretHeight
                )
            } else {
                position.top = top
            }
        } else {
            let left = caretPosition.left - highlighter.scrollLeft
            let top = caretPosition.top - highlighter.scrollTop
            // guard for mentions suggestions list clipped by right edge of window
            if (
                left + suggestions.offsetWidth >
                this.containerElement.offsetWidth
            ) {
                position.right = 0
            } else {
                position.left = left
            }
            // guard for mentions suggestions list clipped by bottom edge of window if allowSuggestionsAboveCursor set to true.
            // move the list up above the caret if it's getting cut off by the bottom of the window, provided that the list height
            // is small enough to NOT cover up the caret
            if (
                (allowSuggestionsAboveCursor &&
                    viewportRelative.top -
                        highlighter.scrollTop +
                        suggestions.offsetHeight >
                        viewportHeight &&
                    suggestions.offsetHeight <
                        caretOffsetParentRect.top -
                            caretHeight -
                            highlighter.scrollTop) ||
                forceSuggestionsAboveCursor
            ) {
                position.top = top - suggestions.offsetHeight - caretHeight
            } else {
                position.top = top
            }
        }

        if (
            position.left === this.state.suggestionsPosition.left &&
            position.top === this.state.suggestionsPosition.top &&
            position.position === this.state.suggestionsPosition.position
        ) {
            return
        }

        this.setState({
            suggestionsPosition: position,
        })
    }

    updateHighlighterScroll = () => {
        const input = this.inputElement
        const highlighter = this.highlighterElement
        if (!input || !highlighter) {
            // since the invocation of this function is deferred,
            // the whole component may have been unmounted in the meanwhile
            return
        }
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

    setSelection = (selectionStart, selectionEnd) => {
        if (selectionStart === null || selectionEnd === null) return

        const el = this.inputElement
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
        const { children } = this.props
        const config = readConfigFromChildren(children)

        const positionInValue = mapPlainTextIndex(
            value,
            config,
            caretPosition,
            'NULL'
        )

        // If caret is inside of mention, do not query
        if (positionInValue === null) {
            return
        }

        // Extract substring in between the end of the previous mention and the caret
        const substringStartIndex = getEndOfLastMention(
            value.substring(0, positionInValue),
            config
        )
        const substring = plainTextValue.substring(
            substringStartIndex,
            caretPosition
        )

        // Check if suggestions have to be shown:
        // Match the trigger patterns of all Mention children on the extracted substring
        React.Children.forEach(children, (child, childIndex) => {
            if (!child) {
                return
            }

            const regex = makeTriggerRegex(child.props.trigger, this.props)
            const match = substring.match(regex)
            if (match) {
                const querySequenceStart =
                    substringStartIndex +
                    substring.indexOf(match[1], match.index)
                this.queryData(
                    match[2],
                    childIndex,
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
        childIndex,
        querySequenceStart,
        querySequenceEnd,
        plainTextValue
    ) => {
        const { children, ignoreAccents } = this.props
        const mentionChild = Children.toArray(children)[childIndex]
        const provideData = getDataProvider(
            mentionChild.props.data,
            ignoreAccents
        )
        const syncResult = provideData(
            query,
            this.updateSuggestions.bind(
                null,
                this._queryId,
                childIndex,
                query,
                querySequenceStart,
                querySequenceEnd,
                plainTextValue
            )
        )
        if (syncResult instanceof Array) {
            this.updateSuggestions(
                this._queryId,
                childIndex,
                query,
                querySequenceStart,
                querySequenceEnd,
                plainTextValue,
                syncResult
            )
        }
    }

    updateSuggestions = (
        queryId,
        childIndex,
        query,
        querySequenceStart,
        querySequenceEnd,
        plainTextValue,
        results
    ) => {
        // neglect async results from previous queries
        if (queryId !== this._queryId) return

        // save in property so that multiple sync state updates from different mentions sources
        // won't overwrite each other
        this.suggestions = {
            ...this.suggestions,
            [childIndex]: {
                queryInfo: {
                    childIndex,
                    query,
                    querySequenceStart,
                    querySequenceEnd,
                    plainTextValue,
                },
                results,
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
        { id, display },
        { childIndex, querySequenceStart, querySequenceEnd, plainTextValue }
    ) => {
        // Insert mention in the marked up value at the correct position
        const value = this.props.value || ''
        const config = readConfigFromChildren(this.props.children)
        const mentionsChild = Children.toArray(this.props.children)[childIndex]
        const {
            markup,
            displayTransform,
            appendSpaceOnAdd,
            onAdd,
        } = mentionsChild.props

        const start = mapPlainTextIndex(
            value,
            config,
            querySequenceStart,
            'START'
        )
        const end = start + querySequenceEnd - querySequenceStart

        let insert = makeMentionsMarkup(markup, id, display)

        if (appendSpaceOnAdd) {
            insert += ' '
        }
        const newValue = spliceString(value, start, end, insert)

        // Refocus input and set caret position to end of mention
        this.inputElement.focus()

        let displayValue = displayTransform(id, display)
        if (appendSpaceOnAdd) {
            displayValue += ' '
        }
        const newCaretPosition = querySequenceStart + displayValue.length
        this.setState({
            selectionStart: newCaretPosition,
            selectionEnd: newCaretPosition,
            setSelectionAfterMentionChange: true,
        })

        // Propagate change
        const eventMock = { target: { value: newValue } }
        const mentions = getMentions(newValue, config)
        const newPlainTextValue = spliceString(
            plainTextValue,
            querySequenceStart,
            querySequenceEnd,
            displayValue
        )

        this.executeOnChange(eventMock, newValue, newPlainTextValue, mentions)

        if (onAdd) {
            onAdd(id, display, start, end)
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

    isOpened = () =>
        isNumber(this.state.selectionStart) &&
        (countSuggestions(this.state.suggestions) !== 0 || this.isLoading())

    _queryId = 0
}

/**
 * Returns the computed length property value for the provided element.
 * Note: According to spec and testing, can count on length values coming back in pixels. See https://developer.mozilla.org/en-US/docs/Web/CSS/used_value#Difference_from_computed_value
 */
const getComputedStyleLengthProp = (forElement, propertyName) => {
    const length = parseFloat(
        window.getComputedStyle(forElement, null).getPropertyValue(propertyName)
    )
    return isFinite(length) ? length : 0
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
            width: '100%',
            position: 'absolute',
            margin: 0,
            top: 0,
            left: 0,
            boxSizing: 'border-box',
            backgroundColor: 'transparent',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            letterSpacing: 'inherit',
        },

        '&multiLine': {
            input: {
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
