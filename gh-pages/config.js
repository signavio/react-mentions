require.config({

  paths: {
    "react": "lib/vendor/react/build/react-with-addons",

    "JSXTransformer": "lib/vendor/requirejs-jsx-plugin/js/JSXTransformer",
    "jsx": "lib/vendor/requirejs-jsx-plugin/js/jsx",
    "text": "lib/vendor/requirejs-text/text",

    "react-mentions": "lib/react-mentions"
  },

  jsx: {
    fileExtension: '.jsx'
  }
});
