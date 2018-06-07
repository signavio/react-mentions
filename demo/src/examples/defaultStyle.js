export default {
  control: {
    backgroundColor: '#fff',

    fontSize: 12,
    fontWeight: 'normal',
  },

  highlighter: {
    overflow: 'hidden',
  },

  input: {
    margin: 0,
  },

  '&singleLine': {
    control: {
      display: 'inline-block',

      width: 130,
    },

    highlighter: {
      padding: 1,
      border: '2px inset transparent',
    },

    input: {
      padding: 1,

      border: '2px inset',
    },
  },

  '&multiLine': {
    control: {
      fontFamily: 'monospace',

      border: '1px solid silver',
    },

    highlighter: {
      padding: 9,
    },

    input: {
      padding: 9,
      minHeight: 63,
      outline: 0,
      border: 0,
    },
  },

  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid rgba(0,0,0,0.15)',
      fontSize: 10,
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
