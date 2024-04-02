import React from 'react'

import { Mention, MentionsInput } from '../../../src'

import { provideExampleValue } from './higher-order'
import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'

// eslint-disable-next-line no-unused-vars
import classNames from './example.module.css' // uses global css selector

const  CustomInput = React.forwardRef((props, ref) => {
  return <textarea ref={ref} {...props} className="custom-textarea" />
})

function CustomInputComponent({ value, data, onChange, onAdd }) {
  return (
    <div className="custom-input">
      <h3>Custom input component</h3>

      <MentionsInput
        value={value}
        onChange={onChange}
        style={defaultStyle}
        placeholder={"Mention people using '@'"}
        a11ySuggestionsListLabel={"Suggested mentions"}
        inputComponent={CustomInput}
      >
        <Mention data={data} onAdd={onAdd} style={defaultMentionStyle} />
      </MentionsInput>
    </div>
  )
}

const asExample = provideExampleValue('')

export default asExample(CustomInputComponent)
