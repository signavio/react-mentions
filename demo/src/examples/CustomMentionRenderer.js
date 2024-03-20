import React from 'react'

import { Mention, MentionsInput } from '../../../src'

import { provideExampleValue } from './higher-order'
import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'

const style = {
  fontWeight: 'bold',
  backgroundColor: '#cee4e5',
}

function CustomMentionRenderer({ value, data, onChange, onAdd }) {
  return (
    <div className="single-line">
      <h3>Custom mention renderer</h3>

      <MentionsInput
        singleLine
        value={value}
        onChange={onChange}
        style={defaultStyle}
        placeholder={"Mention people using '@'"}
        a11ySuggestionsListLabel={"Suggested mentions"}
      >
        <Mention
          data={data}
          onAdd={onAdd}
          style={defaultMentionStyle}
          render={(display) => (
            <span style={style}>{display}</span>
          )} />
      </MentionsInput>
    </div>
  )
}

const asExample = provideExampleValue('')

export default asExample(CustomMentionRenderer)
