basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'https://maps.googleapis.com/maps/api/js?sensor=false',
  'http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
  'test/lib/angular/angular.js',
  'test/lib/angular/angular-mocks.js',
  'src/module.js',
  'src/directives/*.js',
  'src/services/*.js',
  'test/unit/**/*.js'
];

autoWatch = true;
singleRun = false;
browsers = ['Firefox', 'PhantomJS'];
reportSlowerThan = 500;

preprocessors = {
  '**/src/**/*.js': 'coverage',
};

reporters = ['progress', 'coverage'];

coverageReporter = {
  type : 'html',
  dir : 'test/coverage/'
};

