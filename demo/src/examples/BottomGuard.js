import React from 'react'
import { Mention, MentionsInput } from '../../../src'

import { provideExampleValue } from './higher-order'
import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'
let container

function BottomGuard({ value, data, onChange, onAdd }) {
  return (
    <div
      id="suggestionPortal"
      style={{
        height: '400px',
      }}
      ref={el => {
        container = el
      }}
    >
      <h3>Bottom guard example</h3>
      <p>
        Note that the bottom input will open the suggestions list above the
        cursor
      </p>
      <div
        style={{
          position: 'absolute',
          height: '300px',
          width: '400px',
          overflow: 'auto',
          border: '1px solid green',
          padding: '8px',
        }}
      >
        <MentionsInput
          value={value}
          onChange={onChange}
          style={defaultStyle}
          placeholder={"Mention people using '@'"}
          suggestionsPortalHost={container}
          allowSuggestionsAboveCursor={true}
        >
          <Mention data={data} onAdd={onAdd} style={defaultMentionStyle} />
        </MentionsInput>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <MentionsInput
          value={value}
          onChange={onChange}
          style={defaultStyle}
          placeholder={"Mention people using '@'"}
          suggestionsPortalHost={container}
          allowSuggestionsAboveCursor={true}
        >
          <Mention data={data} onAdd={onAdd} style={defaultMentionStyle} />
        </MentionsInput>
      </div>
    </div>
  )
}

const asExample = provideExampleValue('')

export default asExample(BottomGuard)
