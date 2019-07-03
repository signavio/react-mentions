module.exports = {
  testRegex: '\\.spec\\.js$',

  snapshotSerializers: ['enzyme-to-json/serializer'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageReporters: ['cobertura', 'lcov', 'text-summary'],
  coverageDirectory: '<rootDir>/coverage',
  setupFilesAfterEnv: ['./jest/setupTestFramework.js'],
  setupFiles: [
    'raf/polyfill',
    // './jest/setupTests.js'
  ],
  roots: ['<rootDir>/src'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  // transform: {
  //   '^.+\\.jsx?$': './jest/testTransformer.js',
  // },
}
