const countSuggestions = suggestions =>
  Object.keys(suggestions).reduce(
    (acc, prop) => acc + suggestions[prop].results.length,
    0
  )

export default countSuggestions
