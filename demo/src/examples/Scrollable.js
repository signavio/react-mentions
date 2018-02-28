import React from 'react'
import { merge } from 'lodash'
import { Mention, MentionsInput } from '../../../src'

import { provideExampleValue } from './higher-order'

import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'

function Scrollable({ value, data, onChange, onAdd }) {
  let style = merge({}, defaultStyle, {
    highlighter: {
      overflow: 'auto',
      height: 70,
    },

    input: {
      overflow: 'auto',
      height: 70,
    },
  })

  return (
    <div className="scrollable">
      <h3>Scrollable container</h3>
      <p>
        The highlighter will mimic the scroll of the textarea thus making
        everything aligned.
      </p>

      <MentionsInput
        value={value}
        onChange={onChange}
        style={style}
        markup="@[__display__](__type__:__id__)"
        placeholder={"Mention people using '@'"}
      >
        <Mention
          type="user"
          trigger="@"
          data={data}
          renderSuggestion={(suggestion, search, highlightedDisplay) => (
            <div className="user">{highlightedDisplay}</div>
          )}
          onAdd={onAdd}
          style={defaultMentionStyle}
        />
      </MentionsInput>
    </div>
  )
}

const asExample = provideExampleValue(
  "Hi @[John Doe](user:johndoe), \n\n\nlet's add \n\n@[John Doe](user:johndoe) to this conversation... "
)

export default asExample(Scrollable)
