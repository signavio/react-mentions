import React from 'react'

import Header from './Header'
import Examples from './Examples'
import License from './License'

export default function ReactMentions() {
  return (
    <div className="react-mentions">
      <Header />

      <div className="container">
        <h2 id="examples">Examples</h2>
        <Examples />

        <h2 id="license">License</h2>
        <License />
      </div>
    </div>
  )
}
