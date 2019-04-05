import React from 'react'

import { Mention, MentionsInput } from '../../../src'

import { provideExampleValue } from './higher-order'
import emojiExampleStyle from './emojiExampleStyle'
import defaultMentionStyle from './defaultMentionStyle'

const queryEmojis = async (query, callback) => {
  const url = new URL('https://emoji.getdango.com/api/emoji')
  url.searchParams.append('q', query)
  const { results } = await fetch(url).then(res => res.json())
  callback(results.map(({ text }) => ({ id: text })))
}
const neverMatchingRegex = /($a)/

function Emojis({ value, data, onChange, onAdd }) {
  return (
    <div>
      <h3>Emoji support</h3>

      <MentionsInput
        value={value}
        onChange={onChange}
        style={emojiExampleStyle}
        placeholder={"Press ':' for emojis, mention people using '@'"}
      >
        <Mention
          trigger="@"
          displayTransform={username => `@${username}`}
          markup="@__id__"
          data={data}
          regex={/@(\S+)/}
          style={defaultMentionStyle}
          appendSpaceOnAdd
        />
        <Mention
          trigger=":"
          markup="__id__"
          regex={neverMatchingRegex}
          data={queryEmojis}
        />
      </MentionsInput>
    </div>
  )
}

const asExample = provideExampleValue('')

export default asExample(Emojis)
