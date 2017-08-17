import React from 'react'
import { merge } from 'lodash'
import { compose, withHandlers } from 'recompose'

import { MentionsInput, Mention } from '../../../src'

import { provideExampleValue } from './higher-order'

import defaultStyle from './defaultStyle'
import defaultMentionStyle from './defaultMentionStyle'

const multiLineInputDefaultStyle = defaultStyle['&multiLine']['input'];
delete multiLineInputDefaultStyle.minHeight;
multiLineInputDefaultStyle.height = 63;
//fix the height of textarea

const style = merge({}, defaultStyle, {
  suggestions: {
    list: {
      maxHeight: 100,
      overflow: 'auto',
      position: 'absolute',
      bottom: 14,
    },
  },
})

function Advanced({ value, data, onChange, onBlur, onAdd }) {
  return (
    <div className="advanced">
      <h3>Fixed Height textarea</h3>

      <MentionsInput
        value={ value }
        onChange={ onChange }
        onBlur={ onBlur }
        markup="{{__id__}}"
        style={style}
        displayTransform={ (id) => `<-- ${id} -->` }
      >
        <Mention
          data={ data }
          onAdd={ onAdd }
          style={ defaultMentionStyle }
        />
      </MentionsInput>
    </div>
  )
}

export default compose(
  provideExampleValue('Hi {{johndoe}}!'),
  withHandlers({
    onBlur: () => (ev, clickedOnSuggestion) => {
      if (!clickedOnSuggestion) {
        console.log('finished editing')
      }
    },
  })
)(Advanced)
