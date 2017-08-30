import React from 'react'
import { merge } from 'lodash'

import { MentionsInput, Mention } from '../../../src'

import { provideExampleValue } from './higher-order'

import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'

function getHashtags(query, callback) {
  const getIndex = tag => tag.indexOf(query.toLowerCase());
  fetch('data/hashtags.json')
    .then(res => res.json())

    // Note: the following two lines aren't needed if your data source already
    // filters and/or sorts results
    .then(tags => tags.filter(tag =>  getIndex(tag) !== -1))
    .then(tags => tags.sort((a, b) => getIndex(a) - getIndex(b)))

    // Transform the hashtags to what react-mentions expects
    .then(tags => tags.map(tag => ({ display: tag, id: tag })))

    .then(callback)
}

function AsyncHashtags({ value, data, onChange }) {
  return (
    <div className="async">
      <h3>Async Hashtags</h3>

      <MentionsInput
        value={ value }
        onChange={ onChange }
        style={ defaultStyle }
        placeholder="Enter hashtags with #"
        displayTransform={tag => `#${tag}`}
      >
        <Mention trigger="#" data={ getHashtags } style={ defaultMentionStyle } />
      </MentionsInput>
    </div>
  )
}

const asExample = provideExampleValue('')

export default asExample(AsyncHashtags)
