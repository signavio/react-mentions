import React from 'react'

import { Mention, MentionsInput } from '../../../src'

import { provideExampleValue } from './higher-order'
import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'

const CustomRenderer = React.forwardRef((props, ref) => (
  <label>
    I am a custom input!
    <input type="text" {...props} ref={ref} />
  </label>
))

function RenderInput({ value, data, onChange, onAdd }) {
  return (
    <div className="single-line">
      <h3>Single line input</h3>

      <MentionsInput
        renderInput={CustomRenderer}
        value={value}
        onChange={onChange}
        style={defaultStyle}
        placeholder={"Mention people using '@'"}
        a11ySuggestionsListLabel={'Suggested mentions'}
      >
        <Mention data={data} onAdd={onAdd} style={defaultMentionStyle} />
      </MentionsInput>
    </div>
  )
}

const asExample = provideExampleValue('')

export default asExample(RenderInput)
