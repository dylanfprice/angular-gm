module.exports = function(config) {
    config.set({
        basePath: '../',

        files: [
          'https://maps.googleapis.com/maps/api/js?sensor=false',
          'test/lib/angular/angular.js',
          'test/lib/angular/angular-mocks.js',
          'src/module.js',
          'src/directives/*.js',
          'src/services/*.js',
          'src/controllers/*.js',
          'test/unit/**/*.js'
        ],

        frameworks: ["jasmine"],

        autoWatch: true,
        singleRun: false,
        browsers: ['PhantomJS'],
        reportSlowerThan: 500,

        preprocessors: {
          'src/**/*.js': 'coverage'
        },

        reporters: ['progress', 'coverage'],

        coverageReporter: {
          type : 'html',
          dir : 'test/coverage/'
        }
    });
};

