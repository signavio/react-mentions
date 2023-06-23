import React from 'react'
import useStyles from 'substyle'
import { LoadingUserItem } from './components'

export function LoadingIndicator({
  style,
  className,
  classNames,
}: useStyles.StylingProps) {
  const styles = useStyles(defaultstyle, { style, className, classNames })
  const spinnerStyles = styles('spinner')

  return (
    <div {...styles}>
      <div {...spinnerStyles}>
        <>
          {[...Array(4)].map((ele) => (
            <LoadingUserItem key={ele} />
          ))}
        </>
      </div>
    </div>
  )
}

const defaultstyle = {}
