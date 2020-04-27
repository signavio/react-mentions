import React from 'react'
import { createUseStyle } from 'substyle'

function createDefaultStyle(defaultStyle, getModifiers, getDependsOn) {
  const enhance = ComponentToWrap => {
    const useStyle = createUseStyle(defaultStyle, getModifiers, getDependsOn)

    const DefaultStyleEnhancer = props => {
      const style = useStyle(props)
      return <ComponentToWrap {...props} style={style} />
    }
    const displayName =
      ComponentToWrap.displayName || ComponentToWrap.name || 'Component'
    DefaultStyleEnhancer.displayName = `defaultStyle(${displayName})`

    return DefaultStyleEnhancer
  }

  return enhance
}

export default createDefaultStyle
