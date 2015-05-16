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

    var chaiCode = '../../node_modules/chai/**/*.js';
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
            tests: ['tmp'],
            reports: ['reports']
        },

        // Configuration to be run (and then tested).
        mutationTest: {
            options: {
                basePath: 'test/fixtures/',
                code: 'mocha/script*.js',
                specs: [],
                mutate: 'mocha/script*.js',

                testFramework: 'mocha',

                logLevel: 'WARN',
                maxReportedMutationLength: 0,
                reporters: {
                    html: {
                        dir: 'reports/mutation-test',
                        successThreshold: 70
                    },
                    text: {
                        dir: 'tmp'
                    }
                }
            },

            flagAllMutations: {
                options: {
                    testFramework: null,
                    test: function(done) {
                        done('SURVIVED');
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
                    testFramework: null,
                    test: function(done) {
                        done('SURVIVED');
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
                    testFramework: null,
                    test: function(done) {
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
                    ignore: /^\s*log\(/,
                    ignoreReplacement: [/^console$/],
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
                    specs: ['karma-mocha/karma-test.js', 'karma-mocha/karma-endlessLoop-test.js', 'karma-mocha/karma-update-expressions-test.js', 'karma-mocha/karma-mathoperators-test.js'],
                    mutate: 'karma-mocha/script*.js',
                    ignoreReplacement: ['^console$'],
                    testFramework: 'karma',
                    karma: {
                        frameworks: ['mocha', 'chai'],
                        browsers: ['PhantomJS']
                    },
                    logLevel: 'DEBUG',
                    reporters: {
                        text: {
                            file: 'karma.txt'
                        }
                    }
                }
            },

            attributes: {
                options: {
                    code: ['mocha/attribute.js', chaiCode],
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
                    code: ['mocha/arguments.js', '../../node_modules/lodash/**/*', chaiCode],
                    specs: 'mocha/arguments-test.js',
                    mutate: 'mocha/arguments.js',
                    ignoreReplacement: /^_$/,
                    reporters: {
                        text: {
                            file: 'arguments.txt'
                        }
                    }
                }
            },
            array: {
                options: {
                    code: ['mocha/array.js', chaiCode],
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
                    code: ['mocha/comparisons.js', chaiCode],
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
                    code: ['mocha/function-calls.js', chaiCode],
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
                    code: ['mocha/literals.js', chaiCode],
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
                    code: ['mocha/unaryExpression.js', chaiCode],
                    specs: 'mocha/unaryExpression-test.js',
                    mutate: 'mocha/unaryExpression.js',
                    mutateStrictModeKeyword: true,
                    reporters: {
                        text: {
                            file: 'unaryExpression.txt'
                        }
                    }
                }
            },
            logicalExpression: {
                options: {
                    code: ['mocha/logicalExpression.js', chaiCode],
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
                    code: ['mocha/mathoperators.js', chaiCode],
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
                    code: ['mocha/update-expressions.js', chaiCode],
                    specs: 'mocha/update-expressions-test.js',
                    mutate: 'mocha/update-expressions.js',
                    reporters: {
                        text: {
                            file: 'update-expressions.txt'
                        }
                    }
                }
            },
            htmlFragments: {
                options: {
                    code: ['mocha/html-fragments.js', chaiCode],
                    specs: 'mocha/html-fragments-test.js',
                    mutate: 'mocha/html-fragments.js',
                    reporters: {
                        text: {
                            file: 'html-fragments.txt'
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
        'mutationTest:htmlFragments',
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
        'mutationTest:htmlFragments',
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
