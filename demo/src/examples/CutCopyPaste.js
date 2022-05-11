import React, { useState } from 'react'

import { Mention, MentionsInput } from '../../../src'
import defaultMentionStyle from './defaultMentionStyle'
import defaultStyle from './defaultStyle'
import { useExampleValue } from './hooks'

// use first/outer capture group to extract the full entered sequence to be replaced
// and second/inner capture group to extract search string from the match
const emailRegex = /(([^\s@]+@[^\s@]+\.[^\s@]+))$/
const defaultValue =
  "Hi @[John Doe](user:johndoe), \n\nlet's add @[joe@smoe.com](email:joe@smoe.com) and @[John Doe](user:johndoe) to this conversation... "

function CutCopyPaste({ data, disabledSource }) {
  const [sourceValue, onSourceChange, onSourceAdd] = useExampleValue(
    defaultValue
  )
  const [targetValue, onTargetChange, onTargetAdd] = useExampleValue('')
  const [plainTextValue, setPlainTextValue] = useState('')

  return (
    <div className="multiple-triggers">
      <h3>Copy and paste mentions between mention components{disabledSource && " from a disabled field"}</h3>
      <p>This functionality is not supported in Internet Explorer.</p>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, paddingRight: 8 }}>
          Copy from here...
          <MultiMention
            value={sourceValue}
            data={data}
            onChange={onSourceChange}
            onAdd={onSourceAdd}
            disabled={disabledSource}
          />
        </div>

        <div style={{ flex: 1, paddingLeft: 8 }}>
          ...and paste over here...
          <MultiMention
            value={targetValue}
            data={data}
            onChange={onTargetChange}
            onAdd={onTargetAdd}
          />
        </div>

        <div style={{ flex: 1, paddingLeft: 8 }}>
          ...or paste plain text here
          <div>
            <textarea
              style={{ width: '100%', height: 80 }}
              value={plainTextValue}
              onChange={(event) => setPlainTextValue(event.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const MultiMention = ({ value, data, onChange, onAdd, disabled }) => (
  <MentionsInput
    value={value}
    onChange={onChange}
    style={defaultStyle}
    placeholder={"Mention people using '@'"}
    a11ySuggestionsListLabel={"Suggested mentions"}
    disabled={disabled}
  >
    <Mention
      markup="@[__display__](user:__id__)"
      trigger="@"
      data={data}
      renderSuggestion={(
        suggestion,
        search,
        highlightedDisplay,
        index,
        focused
      ) => (
        <div className={`user ${focused ? 'focused' : ''}`}>
          {highlightedDisplay}
        </div>
      )}
      onAdd={onAdd}
      style={defaultMentionStyle}
    />

    <Mention
      markup="@[__display__](email:__id__)"
      trigger={emailRegex}
      data={(search) => [{ id: search, display: search }]}
      onAdd={onAdd}
      style={{ backgroundColor: '#d1c4e9' }}
    />
  </MentionsInput>
)

export default CutCopyPaste
