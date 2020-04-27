import React from 'react'

import { MentionsInput, Mention } from '../../../src'

import { provideExampleValue } from './higher-order'

import classNames from './example.module.css'

function CssModules({ value, data, onChange }) {
  return (
    <div className="advanced">
      <h3>Styling with css modules</h3>

      <MentionsInput
        value={value}
        onChange={onChange}
        className="mentions"
        classNames={classNames}
      >
        <Mention data={data} className={classNames.mentions__mention} />
      </MentionsInput>
    </div>
  )
}

export default provideExampleValue('Hi @[John Doe](johndoe)')(CssModules)
