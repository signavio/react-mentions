const webpack = require('webpack')

module.exports = {
  entry: './',
  devtool: 'source-map',
  output: {
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.less', '.css'],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({ output: { comments: false } }),
    new webpack.DefinePlugin({
      'process.env': {
        // This has effect on the react lib size
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new webpack.NormalModuleReplacementPlugin( // allow examples to include react-mentions
      /^react-mentions$/,
      `${__dirname}/../src`
    ),
  ],
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.less$/,
        loaders: [
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
    ],
  },
}
