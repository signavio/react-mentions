const webpack = require('webpack')
const path = require('path')

const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const HTMLWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')

const { NODE_ENV } = process.env

const inDev = NODE_ENV === 'development' || NODE_ENV === 'test'

module.exports = {
  mode: inDev ? 'development' : 'production',
  devtool: inDev ? 'dev-tool-cheap-source-map' : 'source-map',
  entry: [
    'core-js/stable',
    'regenerator-runtime/runtime',
    path.resolve(__dirname, 'src/index.js'),
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: inDev ? '[name].[chunkhash].js' : '[chunkhash].js',

    chunkFilename: inDev ? '[name].[chunkhash].js' : '[chunkhash].js',
  },

  plugins: [
    new CaseSensitivePathsPlugin(),
    new webpack.HashedModuleIdsPlugin(),
    new HTMLWebpackPlugin({
      alwaysWriteToDisk: true,
      minify: true,
      template: path.resolve(__dirname, 'src/index.html'),
      filename: path.resolve(__dirname, 'build/index.html'),
    }),
    new HTMLWebpackHarddiskPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.css'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
    ],
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
}
