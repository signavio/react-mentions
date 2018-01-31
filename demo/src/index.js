import React, { Component } from 'react'
import { render } from 'react-dom'

import Examples from './examples'

class Demo extends Component {
  render() {
    return (
      <div>
        <h1>react-mentions Demo</h1>
        <Examples />
      </div>
    )
  }
}

render(<Demo />, document.querySelector('#demo'))
