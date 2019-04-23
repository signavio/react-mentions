import invariant from 'invariant'

const combineRegExps = regExps => {
  const serializedRegexParser = /^\/(.+)\/(\w+)?$/
  return new RegExp(
    regExps
      .map(regex => {
        const [, regexString, regexFlags] = serializedRegexParser.exec(
          regex.toString()
        )

        invariant(
          !regexFlags,
          `RegExp flags are not supported. Change /${regexString}/${regexFlags} into /${regexString}/`
        )

        return `(${regexString})`
      })
      .join('|'),
    'g'
  )
}

export default combineRegExps
