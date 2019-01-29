const combineRegExps = regExps => {
  const serializedRegexParser = /^\/(.+)\/(\w+)?$/
  return new RegExp(
    regExps
      .map(regex => {
        const [, regexString, regexFlags] = serializedRegexParser.exec(
          regex.toString()
        )

        if (regexFlags.length > 0) {
          throw new Error(
            `RegExp flags are not supported. Change /${regexString}/${regexFlags} into /${regexString}/`
          )
        }

        return `(${regexString})`
      })
      .join('|'),
    'g'
  )
}

export default combineRegExps
