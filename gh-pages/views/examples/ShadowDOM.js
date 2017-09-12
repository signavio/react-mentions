import React from 'react'

import { Mention, MentionsInput } from '../../../src'

import { provideExampleValue } from './higher-order'

import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'

function ShadowDOM({ value, data, onChange, onAdd }) {
  return (
    <div>
      <h3>Shadow DOM</h3>

      <MentionsInput
        value={value}
        onChange={onChange}
        style={defaultStyle}
        placeholder="Mention people using '@'"
      >
        <Mention data={data} onAdd={onAdd} style={defaultMentionStyle} />
      </MentionsInput>
    </div>
  )
}

const asExample = provideExampleValue('')

export default asExample(ShadowDOM)
