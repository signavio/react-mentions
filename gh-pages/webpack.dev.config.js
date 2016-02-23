var webpack = require('webpack');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.less', '.css']
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin( // allow examples to include react-mentions
      /^react-mentions$/,
      __dirname + '/../src'
    )
  ],
  module: {
    loaders: [
      { test: /\.jsx$/, loader: 'babel', exclude: /node_modules/ },
      { test: /\.js$/, loader: 'babel', exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      {
        test: /\.less$/,
        loaders: [
          'style-loader',
          'css-loader',
          'less-loader'
        ],
      }
    ]
  }
};
