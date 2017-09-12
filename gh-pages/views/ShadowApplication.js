import React from 'react'

import { ShadowDOM, data } from './examples'

export default function ReactMentions() {
  return (
    <div className="container">
      <h2>Shadow DOM application</h2>

      <ShadowDOM data={data} />
    </div>
  )
}
