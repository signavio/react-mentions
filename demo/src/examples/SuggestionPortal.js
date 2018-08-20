import React from 'react'
import { merge } from 'lodash'
import { Mention, MentionsInput } from '../../../src'

import { provideExampleValue } from './higher-order'
import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'
let container

function SuggestionPortal({ value, data, onChange, onAdd }) {
  let scrollableStyle = merge({}, defaultStyle, {
    input: {
      overflow: 'auto',
      height: 70,
    },
  })
  return (
    <div id="suggestionPortal"
      style={{
        height: "400px",
      }}
      ref={el => {
        container = el
      }}>
      >
      <h3>Suggestion portal example</h3>
      <p>
        Note that the suggestions menu is outside of the its parent element (in green) which is absolutely positioned and scrollable.
      </p>
      <div style={{
        position: "absolute",
        height: "150px",
        width: "400px",
        overflow: "auto",
        border: "1px solid green",
        padding: "8px",
      }}>
        <MentionsInput
          value={value}
          onChange={onChange}
          style={defaultStyle}
          placeholder={"Mention people using '@'"}
          suggestionsPortalNode={container}
        >
          <Mention data={data} onAdd={onAdd} style={defaultMentionStyle} />
        </MentionsInput>

        <p>
          The input below is also scrollable.
        </p>
        <MentionsInput
          value={value}
          onChange={onChange}
          style={scrollableStyle}
          placeholder={"Mention people using '@'"}
          suggestionsPortalNode={container}
        >
          <Mention data={data} onAdd={onAdd} style={defaultMentionStyle} />
        </MentionsInput>
      </div>
    </div>
  )
}

const asExample = provideExampleValue('')

export default asExample(SuggestionPortal)
