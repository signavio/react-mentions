import React from 'react'
import { StylesViaJss } from 'substyle-jss'

import Advanced from './Advanced'
import AsyncGithubUserMentions from './AsyncGithubUserMentions'
import CssModules from './CssModules'
import Emojis from './Emojis'
import CutCopyPaste from './CutCopyPaste'
import CustomMentionRenderer from './CustomMentionRenderer'
import MultipleTrigger from './MultipleTrigger'
import Scrollable from './Scrollable'
import SingleLine from './SingleLine'
import SingleLineIgnoringAccents from './SingleLineIgnoringAccents'
import SuggestionPortal from './SuggestionPortal'
import BottomGuard from './BottomGuard'

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
  {
    id: 'lydia',
    display: 'Lydìã Rôdarté-Qüayle',
  },
]

export default function Examples() {
  return (
    <StylesViaJss>
      <div>
        <MultipleTrigger data={users} />
        <SingleLine data={users} />
        <SingleLineIgnoringAccents data={users} />
        <Scrollable data={users} />
        <Advanced data={users} />
        <CutCopyPaste data={users} />
        <CssModules data={users} />
        <AsyncGithubUserMentions data={users} />
        <Emojis data={users} />
        <SuggestionPortal data={users} />
        <BottomGuard data={users} />
        <CustomMentionRenderer data={users} />
      </div>
    </StylesViaJss>
  )
}
