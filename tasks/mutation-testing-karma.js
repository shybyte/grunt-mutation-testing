/**
 * mutation-testing-karma
 *
 * @author Marco Stahl
 * @author Jimi van der Woning
 * @author Martin Koster
 */
'use strict';
var _ = require('lodash'),
    path = require('path');

var CopyUtils = require('../utils/CopyUtils');

exports.init = function(grunt, opts) {
    if(opts.testFramework !== 'karma') {
        return;
    }

    var runner = require('karma').runner,
        backgroundProcesses = [],
        startServer,
        karmaConfig,
        port = 12111;

    opts.before = function(doneBefore) {
        karmaConfig = _.extend(
            {
                // defaults, but can be overwritten
                reporters: [],
                logLevel: 'OFF',
                waitForServerTime: 5
            },
            opts.karma,
            {
                // can't be overwritten, because important for us
                configFile: opts.karma && opts.karma.configFile ? path.resolve(opts.karma.configFile) : undefined,
                background: false,
                singleRun: false,
                autoWatch: false,
                port: port
            }
        );

        startServer = function(startCallback) {
            //FIXME: nasty fallback in case of infinite looping owing to code mutations. At least make it non-blocking
            backgroundProcesses.push(
                grunt.util.spawn(
                    {
                        cmd: 'node',
                        args: [
                            path.join(__dirname, '..', 'lib', 'run-karma-in-background.js'),
                            JSON.stringify(karmaConfig)
                        ]
                    }, function() {
                    }
                )
            );

            setTimeout(
                function() {
                    startCallback();
                }, karmaConfig.waitForServerTime * 1000
            );
        };

        // Find which files are used in the unit test
        karmaConfig.files = opts.code.concat(opts.specs);

        if(!opts.mutateProductionCode) {
            CopyUtils.copyToTemp(karmaConfig.files, 'mutation-testing').done(function(tempDirPath) {
                // Set the basePath relative to the temp dir
                karmaConfig.basePath = tempDirPath;
                opts.basePath = path.join(tempDirPath, opts.basePath);

                // Set the paths to the files to be mutated relative to the temp dir
                opts.mutate = _.map(opts.mutate, function(file) {
                    return path.join(tempDirPath, file);
                });

                startServer(doneBefore);
            });
        } else {
            startServer(doneBefore);
        }

        process.on(
            'exit', function() {
                backgroundProcesses.forEach(
                    function(bgProcess) {
                        bgProcess.kill();
                    }
                );
            }
        );
    };

    opts.test = function(done) {
        setTimeout(
            function() {
                runner.run(
                    _.merge(karmaConfig, { port: port }),
                    function(exitCode) {
                        clearTimeout(timer);
                        done(exitCode === 0);
                    }
                );

                var timer = setTimeout(
                    function() {
                        grunt.log.warn('\nPotentially infinite loop detected. Starting a new Karma instance...');
                        port++;
                        startServer(
                            function() {
                                done(false);
                            }
                        );
                    }, 2000
                );
            }, 100
        );
    };

    opts.after = function() {
        backgroundProcesses.forEach(
            function(bgProcess) {
                bgProcess.kill();
            }
        );
    };
};
