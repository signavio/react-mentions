import { isUndefined } from 'lodash'

const countSuggestions = (suggestions, maxSuggestions) =>
  isUndefined(maxSuggestions)
    ? Object.values(suggestions).reduce((acc, { results }) => acc + results.length, 0)
    : maxSuggestions

export default countSuggestions
