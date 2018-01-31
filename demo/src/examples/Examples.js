import React from 'react'
import { EnhancerProvider } from 'substyle'
import Radium from 'radium'

import MultipleTrigger from './MultipleTrigger'
import SingleLine from './SingleLine'
import Advanced from './Advanced'
import CssModules from './CssModules'
import AsyncHashtags from './AsyncHashtags'

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
      <div>
        <MultipleTrigger data={users} />
        <SingleLine data={users} />
        <Advanced data={users} />
        <CssModules data={users} />
        <AsyncHashtags data={users} />
      </div>
    </EnhancerProvider>
  )
}
