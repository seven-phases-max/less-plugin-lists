'use strict';

module.exports = function (grunt) {

    require('time-grunt')(grunt);
    require('jit-grunt')(grunt);

    grunt.initConfig({

        less: {
            options: {
                plugins: [new (require('../less-plugin-lists'))()]
            },
            regression: {
                expand:   true,
                flatten:  true,
                src:     'test/less/*.less',
                dest:    'test/tmp/css',
                ext:     '.css'
            }
        },

        compare: {
            src:  'test/css/*.css',
            dest: 'test/tmp/css',
        },

        jshint: {
            options: {
                jshintrc: 'test/.jshintrc'
            },
            src: [
                'lib/*.js',
                'Gruntfile.js',
                'test/compare.js'
            ],
        },

        clean: ['test/tmp']

    });

    grunt.registerTask('compare', require('./test/compare')(grunt));

    grunt.registerTask('regression', [
        'clean',
        'less:regression',
        'compare'
    ]);

    grunt.registerTask('test', [
        'jshint',
        'regression'
    ]);

    grunt.registerTask('default', ['test']);

};
