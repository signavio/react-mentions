export default {
  control: {
    backgroundColor: '#fff',
    fontSize: 16,
    fontWeight: 'normal',
    border: '1px solid silver',
  },

  highlighter: {
    overflow: 'hidden',
  },

  input: {
    margin: 0,
    padding: 9,
    minHeight: 63,
    outline: 0,
    border: 0,
    lineHeight: 1,
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
