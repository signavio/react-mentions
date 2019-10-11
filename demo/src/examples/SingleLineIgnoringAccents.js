import React from 'react'

import { Mention, MentionsInput } from '../../../src'

import { provideExampleValue } from './higher-order'
import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'

function SingleLineIgnoringAccents({ value, data, onChange, onAdd }) {
  return (
    <div className="single-line">
      <h3>Single line input ignoring accents</h3>

      <MentionsInput
        singleLine
        value={value}
        onChange={onChange}
        style={defaultStyle}
        placeholder={"Mention people using '@'"}
        ignoreAccents
      >
        <Mention data={data} onAdd={onAdd} style={defaultMentionStyle} />
      </MentionsInput>
    </div>
  )
}

const asExample = provideExampleValue('')

export default asExample(SingleLineIgnoringAccents)
