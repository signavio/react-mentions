const babelConfig = require('../.babelrc.js')

module.exports = require('babel-jest').createTransformer(babelConfig)
