'use strict';

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-ngdocs');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/**\n' +
      ' * <%= pkg.description %>\n' +
      ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
      ' * @link <%= pkg.homepage %>\n' +
      ' * @author <%= pkg.author %>\n' +
      ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
      ' */\n'
    },
    clean: ["dist"],
    dirs: {
      src: 'src/**/*.js',
      dest: 'dist'
    },
    concat: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: ['src/module.js', 'src/directives/*.js', 'src/services/*.js', 'src/controllers/*.js'],
        dest: '<%= dirs.dest %>/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: ['<%= concat.dist.dest %>'],
        dest: '<%= dirs.dest %>/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      files: ['Gruntfile.js', '<%= dirs.src %>'],
      options: {
        curly: false,
        browser: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        expr: true,
        node: true,
        globals: {
          exports: true,
          angular: false,
          google: false
        }
      }
    },
    karma: {
      options: {
        configFile: 'test/karma.conf.js'
      },
      server: {
      },
      unit: {
        singleRun: true
      },
      continuous: {
        singleRun: true,
        browsers: ['PhantomJS']
      }
    },
    copy: {
      examples: {
        expand: true,
        src: 'examples/**',
        dest: 'dist/'
      }
    },
    ngdocs: {
      options: {
        dest: 'dist/docs/',
        title: 'AngularGM Documentation',
        html5Mode: false,
        navTemplate: 'examples/docs-nav.html'
      },
      all: ['src/**/*.js']
    },
    connect: {
      options: {
        keepalive: true
      },
      server: {}
    }
  });

  grunt.registerTask('default', ['build']);

  grunt.registerTask('build', ['clean', 'jshint', 'karma:unit', 'concat', 'uglify', 'copy:examples', 'ngdocs']);

};
