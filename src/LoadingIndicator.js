import React from 'react'
import useStyles from 'substyle'

function LoadingIndicator({ style, className, classNames }) {
  const styles = useStyles(defaultstyle, { style, className, classNames })
  const spinnerStyles = styles('spinner')
  return (
    <div {...styles} aria-label="Loading indicator">
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

const defaultstyle = {}

export default LoadingIndicator
