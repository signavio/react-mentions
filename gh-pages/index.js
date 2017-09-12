import React from 'react'
import ReactDOM from 'react-dom'

import retargetEvents from 'react-shadow-dom-retarget-events'

import './less/react-mentions.less'

import { Application, ShadowApplication } from './views'

ReactDOM.render(<Application />, document.getElementById('app'))

const proto = Object.create(HTMLElement.prototype, {
  attachedCallback: {
    value() {
      const mountPoint = document.createElement('span')
      const shadowRoot = this.createShadowRoot()

      shadowRoot.appendChild(mountPoint)

      ReactDOM.render(<ShadowApplication />, mountPoint)

      retargetEvents(shadowRoot)
    },
  },
})

document.registerElement('shadow-mentions', { prototype: proto })
