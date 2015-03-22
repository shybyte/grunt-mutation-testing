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

//            testIsFailingWithoutMutation: {
//                options: {
//                    test: function(done) {
//                        done(false);
//                    }
//                },
//                files: {
//                    'tmp/test-is-failing-without-mutation.txt': ['test/fixtures/mocha/script*.js']
////          'LOG': ['test/fixtures/mocha/script*.js']
//                }
//            },

//            args: {
//                options: {
//                    discardReplacements: /^_$/,
//                    mutateProductionCode: true,
//                    mocha: {
//                        testFiles: ['test/fixtures/mocha/arguments-test.js']
//                    }
//                },
//                files: {
////          'LOG': ['test/fixtures/mocha/arguments.js']
//                    'tmp/arguments.txt': ['test/fixtures/mocha/arguments.js']
//                }
//            },

        // Configuration to be run (and then tested).
        'mutationTest': {
            options: {
                basePath: "test/fixtures/",
                code: 'mocha/script*.js',
                specs: [],
                mutate: 'mocha/script*.js',

                testFramework: 'mocha',
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
                    specs: ['karma-mocha/karma-test.js', 'karma-mocha/karma-update-expressions-test.js', 'karma-mocha/karma-mathoperators-test.js'],
                    mutate: 'karma-mocha/script*.js',
                    discardReplacements: ['console'],
                    testFramework: 'karma',
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
        // FIXME: test is currently failing, find out why and fix it
        //'mutationTest:testIsFailingWithoutMutation',
        'mutationTest:dontTestInsideNotFailingMutations',
        'mutationTest:mocha',
        'mutationTest:attributes',
        // FIXME: test is currently failing, find out why and fix it
        //'mutationTest:args',
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
