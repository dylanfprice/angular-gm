'use strict';

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-docular');

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
        dest: '<%= dirs.dest %>/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: ['<%= concat.dist.dest %>'],
        dest: '<%= dirs.dest %>/<%= pkg.name %>-<%= pkg.version %>.min.js'
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
    docular : {
      docular_webapp_target : "dist/doc/",
      groups: [
        {
          groupTitle: 'AngularGM Docs',
          groupId: 'angulargm-<%= pkg.version %>',
          groupIcon: 'icon-map-marker',
          sections: [
            {
              id: "api",
              title: "AngularGM API",
              scripts: [
                "src/",
              ]
            }
          ]
        }
      ],
      showDocularDocs: false,
      showAngularDocs: false
    }
  });

  grunt.registerTask('default', ['build']);

  grunt.registerTask('build', ['jshint', 'karma:unit', 'concat', 'uglify', 'docular']);

};
