import React from 'react'
import useStyles from 'substyle'

function LoadingIndicator({style}) {
  const styles = useStyles({}, {style})
  const spinnerStyles = styles('spinner')
  return (
    <div {...styles}>
      <div {...spinnerStyles}>
        <div {...spinnerStyles(['element', 'element1'])} />
        <div {...spinnerStyles(['element', 'element2'])} />
        <div {...spinnerStyles(['element', 'element3'])} />
        <div {...spinnerStyles(['element', 'element4'])} />
        <div {...spinnerStyles(['element', 'element5'])} />
      </div>
    </div>
  )
}

export default LoadingIndicator
