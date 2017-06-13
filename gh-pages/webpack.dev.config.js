const webpack = require('webpack')

module.exports = {
  entry: './index.js',
  output: {
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.less', '.css'],
  },
  plugins: [
    // allow examples to include react-mentions
    new webpack.NormalModuleReplacementPlugin(
      /^react-mentions$/,
      `${__dirname}/../src`
    ),
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['react-hot-loader/webpack', 'babel-loader'],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.less$/,
        loaders: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
}
