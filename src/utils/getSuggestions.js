const getSuggestions = suggestions =>
  Object.keys(suggestions).reduce(
    (acc, mentionType) => [
      ...acc,
      {
        suggestions: suggestions[mentionType].results,
        descriptor: suggestions[mentionType],
      },
    ],
    []
  )

export default getSuggestions
