const countSuggestions = suggestions =>
  Object.values(suggestions).reduce(
    (acc, { results }) => acc + results.length,
    0
  )

export default countSuggestions
