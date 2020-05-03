export default {
  control: {
    fontSize: 16,
    lineHeight: 1.2,
    minHeight: 63,
  },

  highlighter: {
    padding: 9,
    border: '1px solid transparent',
  },

  input: {
    fontSize: 16,
    lineHeight: 1.2,
    padding: 9,
    border: '1px solid silver',
  },

  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid rgba(0,0,0,0.15)',
      fontSize: 16,
    },

    item: {
      padding: '5px 15px',
      borderBottom: '1px solid rgba(0,0,0,0.15)',

      '&focused': {
        backgroundColor: '#cee4e5',
      },
    },
  },
}
