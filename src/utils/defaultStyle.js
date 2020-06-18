import React from 'react'
import useStyles from 'substyle'

function createDefaultStyle(defaultStyle, getModifiers) {
  const enhance = (ComponentToWrap) => {
    const DefaultStyleEnhancer = ({
      style,
      className,
      classNames,
      ...rest
    }) => {
      const modifiers = getModifiers ? getModifiers(rest) : undefined
      const styles = useStyles(
        defaultStyle,
        { style, className, classNames },
        modifiers
      )

      return <ComponentToWrap {...rest} style={styles} />
    }
    const displayName =
      ComponentToWrap.displayName || ComponentToWrap.name || 'Component'
    DefaultStyleEnhancer.displayName = `defaultStyle(${displayName})`

    return DefaultStyleEnhancer
  }

  return enhance
}

export default createDefaultStyle
