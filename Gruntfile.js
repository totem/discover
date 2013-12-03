'use strict';

module.exports = function (grunt) {
  grunt.initConfig({

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        '.jshintrc',
        'package.json',
        '**/*.js',
        '!node_modules/**/*',
        '!test/**/*',
        '!static/**/*'
      ]
    },

    mochacov: {
      unit: {
        options: {
          reporter: 'spec'
        }
      },
      coverage: {
        options: {
          reporter: 'mocha-term-cov-reporter',
          coverage: true
        }
      },
      options: {
        files: 'test/**/*.js',
        ui: 'bdd',
        colors: true
      }
    }

  });

  grunt.loadNpmTasks('grunt-mocha-cov');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', ['jshint', 'mochacov:unit', 'mochacov:coverage']);
  grunt.registerTask('travis', ['jshint', 'mochacov:unit', 'mochacov:coverage']);
  grunt.registerTask('default', 'test');

};
