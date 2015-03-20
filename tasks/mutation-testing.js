/*
 * grunt-mutation-testing
 *
 *
 * Copyright (c) 2014 Marco Stahl
 * Licensed under the MIT license.
 *
 * TODO (Martin Koster): split up this file and refactor to effect better separation of concerns. That should also improve legibility
 */

'use strict';
var esprima = require('esprima');
var fs = require('fs');
var exec = require('sync-exec');
var path = require('path');
var QPromise = require('q');
var _ = require('lodash');
var os = require('os');

var mutate = require('./mutations');
var mutationTestingKarma = require('./mutation-testing-karma');
var mutationTestingMocha = require('./mutation-testing-mocha');
var OptionUtils = require('../utils/OptionUtils');

var notFailingMutations = [];

function ensureRegExpArray(value) {
    var array = _.isArray(value) ? value : [value];
    return array.map(function (stringOrRegExp) {
        return _.isString(stringOrRegExp) ? new RegExp('^' + stringOrRegExp + '$') : stringOrRegExp;
    });
}

function canBeIgnored(opts, src, mutation) {
    if (!opts.ignore) {
        return false;
    }
    var ignorePatterns = ensureRegExpArray(opts.ignore);
    var affectedSrcPart = src.substring(mutation.begin, mutation.end);
    return _.any(ignorePatterns, function (ignorePattern) {
        return ignorePattern.test(affectedSrcPart);
    });
}

function canBeDiscarded(opts, mutation) {
    if (!opts.discardReplacements) {
        return false;
    }
    var discardPatterns = ensureRegExpArray(opts.discardReplacements);
    return _.any(discardPatterns, function (discardPattern) {
        return discardPattern.test(mutation.replacement);
    });
}

function createStats() {
    return {
        all: 0,
        ignored: 0,
        untested: 0 // if a test succeeds for mutated code, it's an untested mutation
    };
}

function addStats(stats1, stats2) {
    return _.mapValues(stats1, function (value, key) {
        return value + stats2[key];
    });
}

function createStatsMessage(stats) {
    var ignoredMessage = stats.ignored ? ' ' + stats.ignored + ' mutations were ignored.' : '';
    var allUnIgnored = stats.all - stats.ignored;
    var testedMutations = allUnIgnored - stats.untested;
    var percentTested = Math.floor((testedMutations / allUnIgnored) * 100);
    return testedMutations +
        ' of ' + allUnIgnored + ' unignored mutations are tested (' + percentTested + '%).' + ignoredMessage;
}

function truncateReplacement(opts, replacementArg) {
    var maxLength = opts.maxReplacementLength !== undefined ? opts.maxReplacementLength : 20;
    var replacement = replacementArg.replace(/\s+/g, ' ');
    if (maxLength > 0 && replacement.length > maxLength) {
        return replacement.slice(0, maxLength / 2) + ' ... ' + replacement.slice(-maxLength / 2);
    }
    return replacement;
}

function createMutationFileMessage(opts, srcFile) {
    // Normalize Windows paths to use '/' instead of '\\'
    if(os.platform() === 'win32') {
        srcFile = srcFile.replace(/\\/g, '/');
    }

    // Strip off anything before the basePath when present
    if(opts.basePath && srcFile.indexOf(opts.basePath) !== -1) {
        srcFile = srcFile.substr(srcFile.indexOf(opts.basePath));
    }

    return srcFile;
}

function createMutationLogMessage(opts, srcFilePath, mutation, src) {
    var srcFileName = createMutationFileMessage(opts, srcFilePath);
    var currentMutationPosition = srcFileName + ':' + mutation.line + ':' + (mutation.col + 1);
    var mutatedCode = src.substr(mutation.begin, mutation.end - mutation.begin);
    return currentMutationPosition + (
            mutation.replacement ?
            ' ' + truncateReplacement(opts, mutatedCode) + ' can be replaced with: ' + truncateReplacement(opts, mutation.replacement) :
            ' ' + truncateReplacement(opts, mutatedCode) + ' can be removed');
}

function createNotTestedBecauseInsideUntestedMutationLogMessage(opts, srcFilePath, mutation) {
    var srcFileName = createMutationFileMessage(opts, srcFilePath);
    var currentMutationPosition = srcFileName + ':' + mutation.line + ':' + (mutation.col + 1);
    return currentMutationPosition + ' is inside a surviving mutation';
}

function isInsideNotFailingMutation(innerMutation) {
    return _.indexOf(notFailingMutations, innerMutation.parentMutationId) > -1;
}

/**
 * @param {string} srcFilename
 * @param {function} runTests
 * @param {function} logMutation
 * @param {function} log the logger
 * @param {object} opts the config options
 */
function mutationTestFile(srcFilename, runTests, logMutation, log, opts) {
    var src = fs.readFileSync(srcFilename, 'UTF8');
    var mutations = mutate.findMutations(src, opts.excludeMutations);
    var mutationPromise = new QPromise({});

    var stats = createStats();

    log('\nMutating file ' + srcFilename + '\n');

    mutations.forEach(function (mutation) {
        stats.all += 1;
        if (canBeDiscarded(opts, mutation)) {
            return;
        }
        if (canBeIgnored(opts, src, mutation)) {
            stats.ignored += 1;
            return;
        }
        var perc = Math.round((stats.all / mutations.length) * 100);
        mutationPromise = mutationPromise.then(function () {
            log('Line ' + mutation.line + ' (' + perc + '%), ');
            if (opts.dontTestInsideNotFailingMutations && isInsideNotFailingMutation(mutation)) {
                stats.untested += 1;
                logMutation(createNotTestedBecauseInsideUntestedMutationLogMessage(opts, srcFilename, mutation));
                return;
            }
            fs.writeFileSync(srcFilename, mutate.applyMutation(src, mutation));
            return runTests().then(function (testSuccess) {
                if (testSuccess) {
                    logMutation(createMutationLogMessage(opts, srcFilename, mutation, src));
                    stats.untested += 1;
                    notFailingMutations.push(mutation.mutationId);
                }
            });
        });
    });

    mutationPromise = mutationPromise.then(function () {
        return stats;
    });

    return mutationPromise.fin(function () {
        console.log('\nRestore ', srcFilename);
        fs.writeFileSync(srcFilename, src);
    });
}


function mutationTest(grunt, task, opts) {
    var done = task.async();
    var mutationTestPromise = new QPromise();

    function logToMutationReport(fileDest, msg) {
        if (fileDest === 'LOG') {
            grunt.log.writeln('\n' + msg);
            return;
        }
        if (!grunt.file.exists(fileDest)) {
            grunt.file.write(fileDest, '');
        }
        fs.appendFileSync(fileDest, msg + '\n');
    }

    function runTests() {
        var deferred = QPromise.defer();
        if (typeof opts.test === 'string') {
            var execResult = exec(opts.test);
            deferred.resolve(execResult.status === 0);
        } else {
            opts.test(function (ok) {
                deferred.resolve(ok);
            });
        }
        return deferred.promise;
    }

    opts.before(function () {
        var files = opts.files;

        // run first without mutations
        runTests().done(function (testOk) {
            if (!testOk) {
                files.forEach(function (file) {
                    logToMutationReport(file.dest, 'Tests fail without mutations.');
                });
            } else {
                files.forEach(function (file) {
                    mutationTestPromise = mutationTestPromise.then(function () {
                        var validFiles = file.src.filter(function (filepath) {
                            if (!grunt.file.exists(filepath)) {
                                grunt.log.warn('Source file "' + filepath + '" not found.');
                                return false;
                            } else {
                                return true;
                            }
                        });

                        if (validFiles.length === 0) {
                            grunt.log.warn('Found no valid files in ' + JSON.stringify(file.orig.src));
                            return false;
                        }

                        function log(msg) {
                            grunt.log.write(msg);
                        }

                        var logMutationToFileDest = _.partial(logToMutationReport, file.dest);
                        var statsSummary = createStats();

                        var mutationFilesPromise = new QPromise();
                        validFiles.forEach(function (srcFile) {
                            mutationFilesPromise = mutationFilesPromise.then(function () {
                                return mutationTestFile(path.resolve(srcFile), runTests, logMutationToFileDest, log, opts).then(function (stats) {
                                    statsSummary = addStats(statsSummary, stats);
                                });
                            });
                        });

                        mutationFilesPromise = mutationFilesPromise.then(function () {
                            logMutationToFileDest(createStatsMessage(statsSummary));
                        });

                        return mutationFilesPromise;
                    });
                });
            }

            mutationTestPromise.then(function () {
                var dfd = QPromise.defer();
                opts.after(function () {
                    dfd.resolve();
                });
                return dfd.promise;
            });
            mutationTestPromise.done(done);
        });
    });
}

function callDone(done) {
    done(true);
}

var DEFAULT_OPTIONS = {
    test: callDone,
    before: callDone,
    after: callDone,
    files: []
};

module.exports = function (grunt) {
    grunt.registerMultiTask('mutationTest', 'Test your tests by mutating the production code.', function () {
        var opts = this.options(DEFAULT_OPTIONS);
        opts.files = this.files;
        mutationTestingKarma.init(grunt, opts);
        mutationTestingMocha.init(grunt, opts);
        mutationTest(grunt, this, opts);
    });

    grunt.registerMultiTask('mutationTest-new', 'Test your tests by mutating the code.', function() {
        var opts = OptionUtils.getOptions(grunt, this);
        grunt.log.warn(JSON.stringify(opts));
    });
};
