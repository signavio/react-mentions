import React from 'react'

import { Mention, MentionsInput } from '../../../src'

import { provideExampleValue } from './higher-order'

import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'

function AutoDirection({ value, data, onChange, onAdd }) {
  return (
    <div className="multiple-triggers">
      <h3>Auto direction</h3>

      <MentionsInput
        value={value}
        onChange={onChange}
        style={defaultStyle}
        placeholder={"Mention people using '@'"}
        dir="auto"
        a11ySuggestionsListLabel={"Suggested mentions"}
        _unstableAutoDirection
      >
        <Mention
          markup="@[__display__](__id__)"
          displayTransform={(username, displayname) => `@${displayname || username}`}
          trigger="@"
          data={data}
          onAdd={onAdd}
          style={defaultMentionStyle}
        />
      </MentionsInput>
    </div>
  )
}

const asExample = provideExampleValue(
  "Hi @[John Doe](johndoe), \nסעיף א. כל בני אדם נולדו בני חורין ושווים בערכם ובזכויותיהם. כולם חוננו בתבונה ובמצפון, לפיכך @[John Doe](johndoe) חובה עליהם לנהוג איש ברעהו ברוח של אחוה."
)

export default asExample(AutoDirection)
