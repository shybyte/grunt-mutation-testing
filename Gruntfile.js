/*
 * grunt-mutation-testing
 *
 *
 * Copyright (c) 2014 Marco Stahl
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    // load all npm grunt tasks
    require('load-grunt-tasks')(grunt);

    var karmaOptions = {
        configFile: 'test/fixtures/karma-mocha/karma.conf.js'
    };

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js'
            ],
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        // Configuration to be run (and then tested).
        mutationTest: {
            options: {
                maxReplacementLength: 0,
                basePath: '/test/fixtures/',
                ignore: [/use strict/]
            },
            flagAllMutations: {
                options: {
                    test: function(done) {
                        done(true);
                    }
                },
                files: {
                    'tmp/flag-all-mutations.txt': ['test/fixtures/mocha/script*.js']
                }
            },
            ignore: {
                options: {
                    ignore: require('./.mutation-testing-conf.js').ignore,
                    test: function(done) {
                        done(true);
                    }
                },
                files: {
                    'tmp/ignore.txt': ['test/fixtures/mocha/script1.js']
                }
            },
            testIsFailingWithoutMutation: {
                options: {
                    test: function(done) {
                        done(false);
                    }
                },
                files: {
                    'tmp/test-is-failing-without-mutation.txt': ['test/fixtures/mocha/script*.js']
//          'LOG': ['test/fixtures/mocha/script*.js']
                }
            },
            flagAllMutationsDefault: {
                options: {},
                files: {
                    'tmp/flag-all-mutations-default.txt': ['test/fixtures/mocha/script*.js']
                }
            },
            grunt: {
                options: {
                    ignore: /^log\(/,
                    test: 'grunt mochaTest:fixtures'
                },
                files: {
                    'tmp/grunt.txt': ['test/fixtures/mocha/script*.js']
                }
            },
            mocha: {
                options: {
                    ignore: /^log\(/,
                    discardReplacements: [/^console$/],
                    unitTestFiles: ['test/fixtures/mocha/script*.js', 'test/fixtures/mocha/mocha-test*.js'],
                    mocha: {
                        testFiles: ['test/fixtures/mocha/mocha-test*.js']
                    }
                },
                files: {
                    'tmp/mocha.txt': ['test/fixtures/mocha/script*.js']
//          'LOG': ['test/fixtures/mocha/script*.js']
                }
            },
            karma: {
                options: {
                    discardReplacements: ['console'],
                    karma: karmaOptions
                },
                files: {
                    'tmp/karma.txt': ['test/fixtures/karma-mocha/script*.js']
//          'LOG': ['test/fixtures/karma-mocha/script*.js']
                }
            },
            attributes: {
                options: {
                    unitTestFiles: ['test/fixtures/mocha/attribute.js', 'test/fixtures/mocha/attribute-test.js', 'node_modules/chai/**/*.js'],
                    mocha: {
                        testFiles: ['test/fixtures/mocha/attribute-test.js']
                    }
                },
                files: {
                    'tmp/attributes.txt': ['test/fixtures/mocha/attribute.js']
//          'LOG': ['test/fixtures/mocha/attribute.js']
                }
            },
            args: {
                options: {
                    discardReplacements: /^_$/,
                    mutateProductionCode: true,
                    mocha: {
                        testFiles: ['test/fixtures/mocha/arguments-test.js']
                    }
                },
                files: {
//          'LOG': ['test/fixtures/mocha/arguments.js']
                    'tmp/arguments.txt': ['test/fixtures/mocha/arguments.js']
                }
            },
            array: {
                options: {
                    unitTestFiles: ['test/fixtures/mocha/array.js', 'test/fixtures/mocha/array-test.js', 'node_modules/chai/**/*.js'],
                    mocha: {
                        testFiles: ['test/fixtures/mocha/array-test.js']
                    }
                },
                files: {
                    'tmp/array.txt': ['test/fixtures/mocha/array.js']
                }
            },
            comparisons: {
                options: {
                    unitTestFiles: ['test/fixtures/mocha/comparisons.js', 'test/fixtures/mocha/comparisons-test.js', 'node_modules/chai/**/*.js'],
                    mocha: {
                        testFiles: ['test/fixtures/mocha/comparisons-test.js']
                    }
                },
                files: {
                    'tmp/comparisons.txt': ['test/fixtures/mocha/comparisons.js']
                }
            },
            functionCalls: {
                options: {
                    unitTestFiles: ['test/fixtures/mocha/function-calls.js', 'test/fixtures/mocha/function-calls-test.js', 'node_modules/chai/**/*.js'],
                    mocha: {
                        testFiles: ['test/fixtures/mocha/function-calls-test.js']
                    }
                },
                files: {
//          'LOG': ['test/fixtures/mocha/function-calls.js']
                    'tmp/function-calls.txt': ['test/fixtures/mocha/function-calls.js']
                }
            },
            literals: {
                options: {
                    unitTestFiles: ['test/fixtures/mocha/literals.js', 'test/fixtures/mocha/literals-test.js', 'node_modules/chai/**/*.js'],
                    mocha: {
                        testFiles: ['test/fixtures/mocha/literals-test.js']
                    }
                },
                files: {
                    'tmp/literals.txt': ['test/fixtures/mocha/literals.js']
//          'LOG': ['test/fixtures/mocha/literals.js']
                }
            },
            unaryExpression: {
                options: {
                    unitTestFiles: ['test/fixtures/mocha/unaryExpression.js', 'test/fixtures/mocha/unaryExpression-test.js', 'node_modules/chai/**/*.js'],
                    mocha: {
                        testFiles: ['test/fixtures/mocha/unaryExpression-test.js']
                    }
                },
                files: {
                    'tmp/unaryExpression.txt': ['test/fixtures/mocha/unaryExpression.js']
//          'LOG': ['test/fixtures/mocha/unaryExpression.js']
                }
            },
            logicalExpression: {
                options: {
                    unitTestFiles: ['test/fixtures/mocha/logicalExpression.js', 'test/fixtures/mocha/logicalExpression-test.js', 'node_modules/chai/**/*.js'],
                    mocha: {
                        testFiles: ['test/fixtures/mocha/logicalExpression-test.js']
                    }
                },
                files: {
                    'tmp/logicalExpression.txt': ['test/fixtures/mocha/logicalExpression.js']
//          'LOG': ['test/fixtures/mocha/logicalExpression.js']
                }
            },
            mathoperators: {
                options: {
                    unitTestFiles: ['test/fixtures/mocha/mathoperators.js', 'test/fixtures/mocha/mathoperators-test.js', 'node_modules/chai/**/*.js'],
                    mocha: {
                        testFiles: ['test/fixtures/mocha/mathoperators-test.js']
                    }
                },
                files: {
                    'tmp/mathoperators.txt': ['test/fixtures/mocha/mathoperators.js']
                }
            },
            updateExpressions: {
                options: {
                    unitTestFiles: ['test/fixtures/mocha/update-expressions.js', 'test/fixtures/mocha/update-expressions-test.js', 'node_modules/chai/**/*.js'],
                    mocha: {
                        testFiles: ['test/fixtures/mocha/update-expressions-test.js']
                    }
                },
                files: {
                    'tmp/update-expressions.txt': ['test/fixtures/mocha/update-expressions.js']
                }
            },

            dontTestInsideNotFailingMutations: {
                options: {
                    dontTestInsideNotFailingMutations: true,
                    unitTestFiles: ['test/fixtures/mocha/script*.js', 'test/fixtures/mocha/mocha-test*.js'],
                    mocha: {
                        testFiles: ['test/fixtures/mocha/mocha-test*.js']
                    }
                },
                files: {
                    'tmp/dont-test-inside-surviving-mutations.txt': ['test/fixtures/mocha/script*.js']
                    //'LOG': ['test/fixtures/mocha/script*.js']
                }
            }

        },

        'mutationTest-new': {
            options: {
                basePath: "test/fixtures/",
                code: 'mocha/script*.js',
                specs: [],
                mutate: 'mocha/script*.js',

                ignore: [/use strict/],

                maxReportedMutationLength: 0,
                reporters: {
                    html: {
                        dir: 'reports/mutation-test'
                    },
                    text: {
                        dir: 'tmp'
                    }
                }
            },

            flagAllMutations: {
                options: {
                    test: function(done) {
                        done(true);
                    },

                    reporters: {
                        text: {
                            file: 'flag-all-mutations.txt'
                        }
                    }
                }
            },
            ignore: {
                options: {
                    code: 'mocha/script1.js',
                    mutate: 'mocha/script1.js',

                    ignore: require('./.mutation-testing-conf.js').ignore,
                    test: function(done) {
                        done(true);
                    },

                    reporters: {
                        text: {
                            file: 'ignore.txt'
                        }
                    }
                }
            },
            testIsFailingWithoutMutation: {
                options: {
                    test: function (done) {
                        done(false);
                    },

                    reporters: {
                        text: {
                            file: 'test-is-failing-without-mutation.txt'
                        }
                    }
                }
            },
            flagAllMutationsDefault: {
                options: {
                    reporters: {
                        text: {
                            file: 'flag-all-mutations-default.txt'
                        }
                    }
                }
            },
            grunt: {
                options: {
                    ignore: /^log\(/,
                    test: 'grunt mochaTest:fixtures',
                    reporters: {
                        text: {
                            file: 'grunt.txt'
                        }
                    }
                }
            },
            mocha: {
                options: {
                    code: 'mocha/script*.js',
                    specs: 'mocha/mocha-test*.js',
                    mutate: 'mocha/script*.js',
                    ignore: /^log\(/,
                    discardReplacements: [/^console$/],
                    reporters: {
                        text: {
                            file: 'mocha.txt'
                        }
                    }
                }
            },
            karma: {
                options: {
                    code: 'karma-mocha/script*.js',
                    specs: ['karma-test.js', 'karma-update-expressions-test.js', 'karma-mathoperators-test.js'],
                    mutate: 'karma-mocha/script*.js',
                    discardReplacements: ['console'],
                    karma: karmaOptions,
                    reporters: {
                        text: {
                            file: 'karma.txt'
                        }
                    }
                }
            },

            attributes: {
                options: {
                    code: ['mocha/attribute.js', '../../node_modules/chai/**/*.js'],
                    specs: 'mocha/attribute-test.js',
                    mutate: 'mocha/attribute.js',
                    reporters: {
                        text: {
                            file: 'attributes.txt'
                        }
                    }
                }
            },
            args: {
                options: {
                    code: ['mocha/arguments.js', '../../node_modules/lodash/**/*'],
                    specs: 'mocha/arguments-test.js',
                    mutate: 'mocha/arguments.js',
                    discardReplacements: /^_$/,
                    reporters: {
                        text: {
                            file: 'arguments.txt'
                        }
                    }
                }
            },
            array: {
                options: {
                    code: ['mocha/array.js', '../../node_modules/chai/**/*.js'],
                    specs: 'mocha/array-test.js',
                    mutate: 'mocha/array.js',
                    reporters: {
                        text: {
                            file: 'array.txt'
                        }
                    }
                }
            },
            comparisons: {
                options: {
                    code: ['mocha/comparisons.js', '../../node_modules/chai/**/*.js'],
                    specs: 'mocha/comparisons-test.js',
                    mutate: 'mocha/comparisons.js',
                    reporters: {
                        text: {
                            file: 'comparisons.txt'
                        }
                    }
                }
            },
            functionCalls: {
                options: {
                    code: ['mocha/function-calls.js', '../../node_modules/chai/**/*.js'],
                    specs: 'mocha/function-calls-test.js',
                    mutate: 'mocha/function-calls.js',
                    reporters: {
                        text: {
                            file: 'function-calls.txt'
                        }
                    }
                }
            },
            literals: {
                options: {
                    code: ['mocha/literals.js', '../../node_modules/chai/**/*.js'],
                    specs: 'mocha/literals-test.js',
                    mutate: 'mocha/literals.js',
                    reporters: {
                        text: {
                            file: 'literals.txt'
                        }
                    }
                }
            },
            unaryExpression: {
                options: {
                    code: ['mocha/unaryExpression.js', '../../node_modules/chai/**/*.js'],
                    specs: 'mocha/unaryExpression-test.js',
                    mutate: 'mocha/unaryExpression.js',
                    reporters: {
                        text: {
                            file: 'unaryExpression.txt'
                        }
                    }
                }
            },
            logicalExpression: {
                options: {
                    code: ['mocha/logicalExpression.js', '../../node_modules/chai/**/*.js'],
                    specs: 'mocha/logicalExpression-test.js',
                    mutate: 'mocha/logicalExpression.js',
                    reporters: {
                        text: {
                            file: 'logicalExpression.txt'
                        }
                    }
                }
            },
            mathoperators: {
                options: {
                    code: ['mocha/mathoperators.js', '../../node_modules/chai/**/*.js'],
                    specs: 'mocha/mathoperators-test.js',
                    mutate: 'mocha/mathoperators.js',
                    reporters: {
                        text: {
                            file: 'mathoperators.txt'
                        }
                    }
                }
            },
            updateExpressions: {
                options: {
                    code: ['mocha/update-expressions.js', '../../node_modules/chai/**/*.js'],
                    specs: 'mocha/update-expressions-test.js',
                    mutate: 'mocha/update-expressions.js',
                    reporters: {
                        text: {
                            file: 'update-expressions.txt'
                        }
                    }
                }
            },

            dontTestInsideNotFailingMutations: {
                options: {
                    specs: 'mocha/mocha-test*.js',
                    dontTestInsideNotFailingMutations: true,
                    reporters: {
                        text: {
                            file: 'dont-test-inside-surviving-mutations.txt'
                        }
                    }
                }
            }
        },

        mochaTest: {
            fixtures: {
                options: {
                    reporter: 'spec'
                },
                src: [
                    'test/fixtures/mocha/*-test.js',
                    'test/fixtures/mocha/**/*Spec.js'
                ]
            },
            mutations: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/mutations-test.js']
            },
            iTest: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/**/*-itest.js']
            },
            iTestSlow: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/**/*-itest-slow.js']
            }
        },

        karma: {
            options: karmaOptions,
            fixtures: {
                singleRun: true
            }
        }
    });


    grunt.loadNpmTasks('grunt-mocha-test');

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    grunt.registerTask('test', [
        'clean',
        'mochaTest:fixtures',
        'mochaTest:mutations',
        'karma',
        'mutationTest:flagAllMutations',
        'mutationTest:ignore',
        'mutationTest:flagAllMutationsDefault',
        'mutationTest:testIsFailingWithoutMutation',
        'mutationTest:dontTestInsideNotFailingMutations',
        'mutationTest:mocha',
        'mutationTest:attributes',
        'mutationTest:args',
        'mutationTest:comparisons',
        'mutationTest:mathoperators',
        'mutationTest:updateExpressions',
        'mutationTest:literals',
        'mutationTest:unaryExpression',
        'mutationTest:logicalExpression',
        'mutationTest:array',
        'mutationTest:functionCalls',
        'mutationTest:karma',
        'mochaTest:iTest'
    ]);

    grunt.registerTask('test-new', [
        'mutationTest-new:flagAllMutations',
        'mutationTest-new:ignore',
        'mutationTest-new:flagAllMutationsDefault',
        'mutationTest-new:testIsFailingWithoutMutation',
        'mutationTest-new:dontTestInsideNotFailingMutations',
        'mutationTest-new:mocha',
        'mutationTest-new:attributes',
        'mutationTest-new:args',
        'mutationTest-new:comparisons',
        'mutationTest-new:mathoperators',
        'mutationTest-new:updateExpressions',
        'mutationTest-new:literals',
        'mutationTest-new:unaryExpression',
        'mutationTest-new:logicalExpression',
        'mutationTest-new:array',
        'mutationTest-new:functionCalls',
        'mutationTest-new:karma'
    ]);

    grunt.registerTask('test:all', [
        'clean',
        'mochaTest:fixtures',
        'mochaTest:mutations',
        'karma',
        'mutationTest:flagAllMutations',
        'mutationTest:ignore',
        'mutationTest:flagAllMutationsDefault',
        'mutationTest:testIsFailingWithoutMutation',
        'mutationTest:mocha',
        'mutationTest:attributes',
        'mutationTest:array',
        'mutationTest:functionCalls',
        'mutationTest:args',
        'mutationTest:comparisons',
        'mutationTest:mathoperators',
        'mutationTest:updateExpressions',
        'mutationTest:literals',
        'mutationTest:unaryExpression',
        'mutationTest:logicalExpression',
        'mutationTest:dontTestInsideNotFailingMutations',
        'mutationTest:grunt',
        'mutationTest:karma',
        'mochaTest:iTest',
        'mochaTest:iTestSlow'
    ]);

    grunt.registerTask('test:karma', [
        'jshint',
        'mutationTest:karma'
    ]);

    grunt.registerTask('mocha2', [
        'clean',
        'mutationTest:dontTestInsideNotFailingMutations',
        'mutationTest:mocha',
        'mochaTest:iTest'
    ]);


    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};
