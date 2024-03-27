import createMatcher from './createMatcher'
import lettersDiacritics from './diacritics'

const removeAccents = str => {
  let formattedStr = str

  lettersDiacritics.forEach(letterDiacritics => {
    formattedStr = formattedStr.replace(
      letterDiacritics.letters,
      letterDiacritics.base
    )
  })

  return formattedStr
}

export const normalizeString = str => removeAccents(str).toLowerCase()

const getSubstringIndex = (str, substr, ignoreAccents) => {
  const display = ignoreAccents ? normalizeString(str) : str
  const query = ignoreAccents ? normalizeString(substr) : substr

  const regex = createMatcher(query)
  const match = display.match(regex)

  return match ? match.index : -1
}

export default getSubstringIndex
