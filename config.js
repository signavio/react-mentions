require.config({

  paths: {
    "react": "lib/vendor/react/react-with-addons",
    "react-mentions": "lib/react-mentions",
    "react-router": "lib/vendor/react-router/dist/react-router",

    "JSXTransformer": "lib/vendor/requirejs-jsx-plugin/js/JSXTransformer",
    "jsx": "lib/vendor/requirejs-jsx-plugin/js/jsx",
    "text": "lib/vendor/requirejs-text/text"
  },

  waitSeconds: 20,

  jsx: {
    fileExtension: '.jsx'
  }
});
