module.exports = function(config) {
  config.set({

    basePath: '',

    frameworks: ['mocha', 'browserify'],

    files: [
      'tests.js'
    ],

    exclude: [],

    preprocessors: {
      'tests.js': ['browserify'],
      'lib/*.js': ['coverage']
    },

    coverageReporter: {
      type : 'cobertura',
      dir : 'coverage/'
    },

    junitReporter: {
      outputFile: "results/test-results.xml",
      suite: "Backbone Relations"
    },

    browserify: {
      transform: ['envify'],
      watch: true,
      debug: true
    },

    reporters: ["dots", "coverage", "junit"],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['PhantomJS'],

    captureTimeout: 60000,

    singleRun: true
  });
};
