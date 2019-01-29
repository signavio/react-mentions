import getSuggestions from './getSuggestions'

const getSuggestion = (suggestions, index) =>
  getSuggestions(suggestions).reduce(
    (result, { suggestions, descriptor }) => [
      ...result,

      ...suggestions.map(suggestion => ({
        suggestion: suggestion,
        descriptor: descriptor,
      })),
    ],
    []
  )[index]

export default getSuggestion
