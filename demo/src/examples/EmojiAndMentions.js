import React from 'react'

import { Mention, MentionsInput } from '../../../src'

import { provideExampleValue } from './higher-order'

import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'
import emojiAliases from './emojiAliases'
import _ from 'lodash'

const defaultEmoji = [
  { id: '+1', display: '👍 +1' },
  { id: '-1', display: '👎 -1' },
  { id: 'white_check_mark', display: '✅ white_check_mark' },
  { id: '100', display: '💯 100' }
]

const emoji = Object.entries(emojiAliases).map(([key, value]) => {
  return { id: key, display: `${value} ${key}` }
})

function displayTransform(id, display, type) {
  if (type === 'emoji') return emojiAliases[id]

  return display
}

function EmojiAndMentions({ value, data, onChange, onAdd }) {
  return (
    <div>
      <h3>Emoji and mentions</h3>
      <p>Insert an emoji by using ':' + emoji name or mention people using '@' + username or</p>

      <MentionsInput
        value={value}
        onChange={onChange}
        style={defaultStyle}
        markup="@[__display__](__type__:__id__)"
        placeholder={"Insert an emoji by using ':'"}
        displayTransform={displayTransform}
      >
        <Mention
          type="user"
          trigger="@"
          data={data}
          renderSuggestion={(
            suggestion,
            search,
            highlightedDisplay,
            index,
            focused
          ) => (
            <div className={`user ${focused ? 'focused' : ''}`}>
              {highlightedDisplay}
            </div>
          )}
          onAdd={onAdd}
          style={defaultMentionStyle}
          appendSpaceOnAdd
        />

        <Mention
          type="emoji"
          trigger=":"
          data={search => {
            if (search.length === 0) return defaultEmoji

            return emoji.filter(
              x => x.id.includes(search)
            ).slice(0, 5)
          }}
          onAdd={onAdd}
          appendSpaceOnAdd
          insertDisplayWithoutMarkup
        />
      </MentionsInput>
    </div>
  )
}

const asExample = provideExampleValue(
  "Hi @[John Doe](user:johndoe) "
)

export default asExample(EmojiAndMentions)
