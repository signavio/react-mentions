import React from 'react'
import { EnhancerProvider } from 'substyle'
import Radium from 'radium'

import MultipleTrigger from './MultipleTrigger'
import SingleLine from './SingleLine'
import Advanced from './Advanced'
import CssModules from './CssModules'
import AsyncHashtags from './AsyncHashtags'
import ShadowDOM from './ShadowDOM'

const users = [
  {
    id: 'walter',
    display: 'Walter White',
  },
  {
    id: 'jesse',
    display: 'Jesse Pinkman',
  },
  {
    id: 'gus',
    display: 'Gustavo "Gus" Fring',
  },
  {
    id: 'saul',
    display: 'Saul Goodman',
  },
  {
    id: 'hank',
    display: 'Hank Schrader',
  },
  {
    id: 'skyler',
    display: 'Skyler White',
  },
  {
    id: 'mike',
    display: 'Mike Ehrmantraut',
  },
]

export default function Examples() {
  return (
    <EnhancerProvider enhancer={Radium}>
      <div className="examples">
        <div className="row">
          <div className="col-lg-12">
            <MultipleTrigger data={users} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <SingleLine data={users} />
          </div>
          <div className="col-md-6">
            <Advanced data={users} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <CssModules data={users} />
          </div>
          <div className="col-md-6">
            <AsyncHashtags data={users} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <ShadowDOM data={users} />
          </div>
        </div>
      </div>
    </EnhancerProvider>
  )
}
