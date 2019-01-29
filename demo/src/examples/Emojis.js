import React from 'react'
import emojisUnicode from 'emojis-unicode'
import emojisKeywords from 'emojis-keywords'

import { Mention, MentionsInput } from '../../../src'

import { provideExampleValue } from './higher-order'
import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'

const emojis = emojisUnicode.map((charCode, index) => ({
  id: emojisKeywords[index].substring(1, emojisKeywords[index].length - 1),
  display: `${String.fromCodePoint(parseInt(charCode, 16))} ${
    emojisKeywords[index]
  }`,
}))

function Emojis({ value, data, onChange, onAdd }) {
  return (
    <div>
      <h3>Emoji support</h3>

      <MentionsInput
        value={value}
        onChange={onChange}
        style={defaultStyle}
        placeholder={"Press ':' for emojis, mention people using '@'"}
      >
        <Mention
          trigger="@"
          displayTransform={username => `@${username}`}
          markup="@__id__"
          data={data}
          regex={/@(\S+)/g}
          appendSpaceOnAdd={true}
          style={defaultMentionStyle}
        />
        <Mention
          trigger=":"
          // displayTransform={id => {
          //   const emoji = emojis.find(emoji => emoji.id === id)
          //   return emoji ? emoji.char : `:${id}:`
          // }}
          markup=":__id__:"
          data={emojis}
          appendSpaceOnAdd={true}
          // renderSuggestion={renderEmojiSuggestion}
        />
      </MentionsInput>
    </div>
  )
}

const asExample = provideExampleValue('')

export default asExample(Emojis)
