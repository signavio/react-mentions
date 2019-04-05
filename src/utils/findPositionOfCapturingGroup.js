import invariant from 'invariant'
import PLACEHOLDERS from './placeholders'

const findPositionOfCapturingGroup = (markup, parameterName) => {
  invariant(
    parameterName === 'id' || parameterName === 'display',
    'Second arg must be either "id" or "display"'
  )

  // find positions of placeholders in the markup
  let indexDisplay = markup.indexOf(PLACEHOLDERS.display)
  let indexId = markup.indexOf(PLACEHOLDERS.id)

  // set indices to null if not found
  if (indexDisplay < 0) indexDisplay = null
  if (indexId < 0) indexId = null

  // markup must contain one of the mandatory placeholders
  invariant(
    indexDisplay !== null || indexId !== null,
    `The markup '${markup}' does not contain either of the placeholders '__id__' or '__display__'`
  )

  if (indexDisplay !== null && indexId !== null) {
    // both placeholders are used, return 0 or 1 depending on the position of the requested parameter
    return (parameterName === 'id' && indexId <= indexDisplay) ||
      (parameterName === 'display' && indexDisplay <= indexId)
      ? 0
      : 1
  }

  // just one placeholder is being used, we'll use the captured string for both parameters
  return 0
}

export default findPositionOfCapturingGroup
