import React from 'react'
import { EnhancerProvider } from 'substyle'
import Radium from 'radium'

import users from './data'

import MultipleTrigger from './MultipleTrigger'
import SingleLine from './SingleLine'
import Advanced from './Advanced'
import CssModules from './CssModules'
import AsyncHashtags from './AsyncHashtags'

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
      </div>
    </EnhancerProvider>
  )
}
