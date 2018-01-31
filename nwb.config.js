module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: 'ReactMentions',
  },
  karma: {
    browsers: ['ChromeHeadless'],
  },
  webpack: {
    rules: {
      css: {
        modules: true,
      },
    },
  },
  devServer: {
    port: '3033',
  },
}
