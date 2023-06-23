import React from 'react'
import useStyles from 'substyle'
import { MentionProps } from '../types/types'

const defaultStyle = {
  fontWeight: 'inherit',
}
export interface ExtendedProps {
  display: string
  // classNames: useStyles.StylingProps['classNames']
}

export const Mention = ({
  display,
  style,
  className,
  classNames,
}: MentionProps & useStyles.StylingProps & ExtendedProps) => {
  const styles = useStyles(defaultStyle, { style, className, classNames })
  return <strong {...styles}>{display}</strong>
}

Mention.defaultProps = {
  trigger: '@',
  markup: '@[__display__](__id__)',
  displayTransform: function(id?: string, display?: string) {
    return display || id
  },
  onAdd: () => null,
  onRemove: () => null,
  renderSuggestion: null,
  isLoading: false,
  appendSpaceOnAdd: false,
}

export default Mention
