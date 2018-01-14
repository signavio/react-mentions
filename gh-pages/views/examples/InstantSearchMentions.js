import React from 'react'
import { InstantSearch } from 'react-instantsearch/dom'
import { connectAutoComplete } from 'react-instantsearch/connectors'

import { MentionsInput, Mention } from '../../../src'

import { provideExampleValue } from './higher-order'

import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'

function RawAutoComplete({ onChange, value, hits, refine }) {
  return (
    <MentionsInput
      value={value}
      onChange={onChange}
      style={defaultStyle}
      placeholder="Enter actors with @"
      displayTransform={(tag) => {
        // why does this show as the objectID instead of the `display`?
        return `@${tag}`
      }}
    >
      <Mention
        trigger="@"
        onChange={(newValue) => {
          // how can I make sure the data is fetched here
          // I'd also like to use `<Highlight attributeName="name" />` from react-instantsearch
          // instead of the default highlighting
          refine(newValue)
        }}
        // I'd also
        data={hits.map(({ name: display, objectID: id }) => ({ display, id }))}
        style={defaultMentionStyle}
      />
    </MentionsInput>
  )
}

const AutoComplete = connectAutoComplete(RawAutoComplete)

function Mentions({ value, data, onChange }) {
  return (
    <div className="async">
      <InstantSearch appId="latency" apiKey="6be0576ff61c053d5f9a3225e2a90f76" indexName="actors">
        <h3>
          <a href="https://community.algolia.com/react-instantsearch/">React InstantSearch</a>{' '}
          Hashtags
        </h3>
        <AutoComplete onChange={onChange} value={value} />
      </InstantSearch>
    </div>
  )
}

const asExample = provideExampleValue('')

export default asExample(Mentions)
