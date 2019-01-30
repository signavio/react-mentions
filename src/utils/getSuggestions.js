const getSuggestions = suggestions =>
  Object.keys(suggestions).reduce(
    (acc, childIndex) => [
      ...acc,
      {
        suggestions: suggestions[childIndex].results,
        descriptor: suggestions[childIndex],
      },
    ],
    []
  )

export default getSuggestions
