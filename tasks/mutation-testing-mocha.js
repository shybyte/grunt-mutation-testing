var Mocha = require('mocha');
var requireUncache = require('require-uncache');
var _ = require('lodash');
var path = require('path');
var CopyUtils = require('../utils/CopyUtils');

exports.init = function(grunt, opts) {
    if(opts.testFramework !== 'mocha') {
        return;
    }

    var testFiles = opts.specs;
    if(testFiles.length === 0) {
        grunt.log.error('No test files found in' + testFiles);
    }

    opts.before = function(doneBefore) {
        if(opts.mutateProductionCode) {
            doneBefore();
        } else {
            // Find which files are used in the unit test such that they can be copied
            CopyUtils.copyToTemp(opts.code.concat(opts.specs), 'mutation-testing').done(function(tempDirPath) {
                // Set the basePath relative to the temp dir
                opts.basePath = path.join(tempDirPath, opts.basePath);

                testFiles = _.map(testFiles, function(file) {
                    return path.join(tempDirPath, file);
                });

                // Set the paths to the files to be mutated relative to the temp dir
                opts.mutate = _.map(opts.mutate, function(file) {
                    return path.join(tempDirPath, file);
                });

                doneBefore();
            });
        }
    };

    opts.test = function(done) {
        //https://github.com/visionmedia/mocha/wiki/Third-party-reporters
        var mocha = new Mocha({
            reporter: function(runner) {
                //dummyReporter
                //runner.on('fail', function(test, err){
                //console.log('fail: %s -- error: %s', test.fullTitle(), err.message);
                //});
            }
        });

        mocha.suite.on('pre-require', function(context, file) {
            var cache = require.cache || {};
            for(var key in cache) {
                if(cache.hasOwnProperty(key)) {
                    delete cache[key];
                }
            }
            requireUncache(file);
        });

        testFiles.forEach(function(testFile) {
            mocha.addFile(testFile);
        });

        try {
            mocha.run(function(errCount) {
                var withoutErrors = (errCount === 0);
                done(withoutErrors);
            });
        } catch(error) {
            done(false);
        }
    };
};
