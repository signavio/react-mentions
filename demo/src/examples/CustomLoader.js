import React, { useState } from 'react'
import useStyles from 'substyle'
import { Mention, MentionsInput } from '../../../src'

import { provideExampleValue } from './higher-order'
import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'

const mentionStyle = {
  suggestions: {
    list: {
      border: 'none',
    },
  },
}

const loaderStyle = {
  color: '#d8d8d8',
  fontSize: 12,
  padding: 6,
}

function CustomLoader({ value, data, onChange }) {
  const [isLoading, setIsLoading] = useState(false)

  const styles = useStyles(defaultStyle, { style: mentionStyle })

  const fetchUsers = (query, callback) => {
    if (!query) return

    setIsLoading(true)

    new Promise((resolve) => {
      setTimeout(() => {
        resolve(data.filter((user) => user.id.includes(query)))
      }, 1500)
    }).then((users) => {
      setIsLoading(false)
      callback(users)
    })
  }

  return (
    <div>
      <h3>Custom loader component</h3>

      <MentionsInput
        value={value}
        onChange={onChange}
        style={styles}
        loader={<span style={loaderStyle}>Loading...</span>}
      >
        <Mention
          displayTransform={(login) => `@${login}`}
          trigger="@"
          data={fetchUsers}
          style={defaultMentionStyle}
          isLoading={isLoading}
        />
      </MentionsInput>
    </div>
  )
}

const asExample = provideExampleValue('')

export default asExample(CustomLoader)
