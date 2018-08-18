import React from 'react'

import { Mention, MentionsInput } from '../../../src'

import { provideExampleValue } from './higher-order'
import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'

function SuggestionPortal({ value, data, onChange, onAdd }) {
  return (
    <div id="suggestionPortal"
      style={{
        height: "400px",
        border: "1px dotted gray",
        marginLeft: "60px"
      }}>
      <h3>Suggestion portal example</h3>
      <p>
        Note that the suggestions menu is outside of the its parent element (in green) which is absolutely positioned and scrollable.
      </p>
      <div style={{
        position: "absolute",
        height: "100px",
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
          suggestionsPortalSelector={'#suggestionPortal'}
        >
          <Mention data={data} onAdd={onAdd} style={defaultMentionStyle} />
        </MentionsInput>
      </div>
    </div>
  )
}

const asExample = provideExampleValue('hi @')

export default asExample(SuggestionPortal)
