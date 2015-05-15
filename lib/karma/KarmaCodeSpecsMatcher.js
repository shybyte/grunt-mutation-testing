/**
 * KarmaFindCodeSpecs class, containing functionality to find the accompanying spec files for a list of unit test files,
 * both automatically and from a configuration object/file.
 *
 * @author Jimi van der Woning
 */
'use strict';

var _ = require('lodash'),
    fs = require('fs-extra'),
    log4js = require('log4js'),
    path = require('path'),
    Q = require('q'),
    xml2js = require('xml2js');

var IOUtils = require('../../utils/IOUtils');

var logger = log4js.getLogger('KarmaCodeSpecsMatcher');

/**
 * Constructor for the KarmaCodeSpecsMatcher
 *
 * @param {KarmaServerManager} serverManager Karma server manager used to manage the Karma servers
 * @param {object} config Configuration object
 * @constructor
 */
function KarmaCodeSpecsMatcher(serverManager, config) {
    this._serverManager = serverManager;
    this._config = _.merge({ karma: { waitForCoverageTime: 5 } }, config);
    this._coverageDir = path.join(config.karma.basePath, 'coverage');
}

/**
 * Get the coverage for all config.code of a single spec file. When none is provided, one can find the base coverage,
 * i.e. the coverage any spec file will have on config.code.
 *
 * @param {string=} specFile Path to the spec file
 * @returns {*|promise} a promise that will resolve with an object containing the line coverage for each file in
 *                      config.mutate, or reject when any error occurs.
 * @private
 */
KarmaCodeSpecsMatcher.prototype._getSpecFileCoverage = function(specFile) {
    var self = this,
        deferred = Q.defer(),
        files = specFile ? self._config.code.concat(specFile) : self._config.code,
        config = _.merge({}, self._config.karma, { files: files }, {
            reporters: ['coverage'],
            preprocessors: _.zipObject(_.map(self._config.mutate, function(file) {
                return [file, 'coverage'];
            })),
            coverageReporter: {
                type: 'cobertura',
                dir: self._coverageDir,
                file: (specFile ? specFile : 'dummy') + '.coverage.xml'
            }
        });

    self._serverManager.startNewInstance(config).done(function(instance) {
        instance.runTests().done(function() {
            var fileName = path.basename(config.coverageReporter.file),
                maxWait = self._config.karma.waitForCoverageTime * 1000;

            IOUtils.findEventually(fileName, config.coverageReporter.dir, -1, maxWait)
                .done(function(coverageFile) {
                    coverageFile = IOUtils.normalizeWindowsPath(coverageFile);
                    self._parseXMLCoverageFile(coverageFile).then(function(fileLineCoverage) {
                        instance.stop();
                        deferred.resolve(fileLineCoverage);
                    }, function(error) {
                        logger.warn('Could not parse the XML coverage file: %s', error.message);
                        deferred.reject(error);
                    });
                }, function(error) {
                    logger.warn('Coverage file (%s) not found after %dms: %s', fileName, maxWait, error.message);
                    deferred.reject(error);
                });
        });
    });

    return deferred.promise;
};

/**
 * Parse XML coverage data from a 'cobertura' style coverage report.
 *
 * @param {string} xmlCoverageData String representation of the 'cobertura' coverage report
 * @returns {*|promise} a promise that will resolve with an object containing the coverage per file, or reject when the
 *                      coverage data is invalid
 * @private
 */
KarmaCodeSpecsMatcher.prototype._parseXMLCoverageData = function(xmlCoverageData) {
    var deferred = Q.defer(),
        fileLineCoverage = {};

    xml2js.parseString(xmlCoverageData, function(error, coverageData) {
        if(error) {
            logger.warn('An error occurred while parsing XML coverage data: %s', error.message);
            deferred.reject(error);
        } else {
            try {
                coverageData.coverage['packages'].forEach(function(pkgs) {
                    pkgs['package'].forEach(function(pkg) {
                        pkg['classes'].forEach(function(clss) {
                            clss['class'].forEach(function(cls) {
                                var fileName = IOUtils.normalizeWindowsPath(cls.$['filename']);
                                fileLineCoverage[fileName] = Number(cls.$['line-rate']);
                            });
                        });
                    });
                });
            } catch(error) {
                logger.warn('XML coverage data is not in the expected format: %s', error.message);
                deferred.reject(error);
            }

            deferred.resolve(fileLineCoverage);
        }
    });

    return deferred.promise;
};

/**
 * Parse an XML coverage file containing a 'cobertura' style coverage report. If the report cannot be read straight
 * away, more attempts will be made in a period of config.karma.waitForCoverageTime seconds.
 *
 * @param {string} xmlCoverageFile The path to the XML coverage report
 * @returns {*|promise} a promise that will resolve with an object containing the coverage per file, or reject when the
 *                      coverage data is invalid
 * @private
 */
KarmaCodeSpecsMatcher.prototype._parseXMLCoverageFile = function(xmlCoverageFile) {
    var self = this,
        deferred = Q.defer();

    IOUtils.promiseToReadFile(xmlCoverageFile)
        .done(function(xmlData) {
            deferred.resolve(self._parseXMLCoverageData(xmlData));
        }, function(error) {
            logger.warn("An error occurred while parsing XML coverage file: %s", error.message);
            deferred.reject(error);
        });

    return deferred.promise;
};

/**
 * Get a file path relative to the original base path.
 *
 * @param {string} filePath The file path that needs to be made relative
 * @returns {string} The relative file path
 * @private
 */
KarmaCodeSpecsMatcher.prototype._getRelativeFilePath = function(filePath) {
    var normalizedFilePath = IOUtils.normalizeWindowsPath(filePath),
        basePath = IOUtils.normalizeWindowsPath(_.last(this._config.basePath.split(this._config.karma.basePath)))
            .slice(1);
    return basePath ? _.last(normalizedFilePath.split(basePath)) : normalizedFilePath;
};

/**
 * Transform a code-specs mapping object in such way that the paths to the specs become absolute, i.e. are prefixed
 * with the base path.
 *
 * @param {object} codeSpecs An object containing mappings from code files to arrays of spec files
 * @returns {object} The transformed code-specs mapping object
 * @private
 */
KarmaCodeSpecsMatcher.prototype._getAbsoluteSpecPaths = function(codeSpecs) {
    var self = this,
        absoluteCodeSpecs = {};

    _.forOwn(codeSpecs, function(specs, code) {
        absoluteCodeSpecs[code] = _.map(specs, function(spec) {
            return path.join(self._config.basePath, spec);
        });
    });

    return absoluteCodeSpecs;
};

/**
 * Create the code-specs mapping object from the config object. This can be provided in config.karma.fileSpecs.
 * When config.karma.fileSpecs is a string, it will be assumed that this is the path to a JSON file containing the
 * code-specs mapping.
 *
 * @returns {*|promise} a promise that will resolve with the found code-specs mapping object, or reject when the
 *                      supplied configuration file cannot be found or parsed
 * @private
 */
KarmaCodeSpecsMatcher.prototype._findCodeSpecsFromConfig = function() {
    var self = this,
        deferred = Q.defer(),
        codeSpecs = {},
        configFileSpecs;

    // When a string is provided as the configuration, this should point to a JSON file containing the mapping
    if(_.isString(self._config.karma.fileSpecs)) {
        try {
            configFileSpecs = JSON.parse(fs.readFileSync(self._config.karma.fileSpecs));
        } catch(error) {
            deferred.reject(error);
            return deferred.promise;
        }
    } else {
        configFileSpecs = self._config.karma.fileSpecs;
    }

    // Create a mapping from source code to its specs, or to all specs when not explicitly provided
    _.forEach(self._config.mutate, function(mutateFile) {
        mutateFile = IOUtils.normalizeWindowsPath(mutateFile);
        var mutateFileSpecs = _.find(configFileSpecs, function(specs, file) {
            return mutateFile.indexOf(IOUtils.normalizeWindowsPath(file)) !== -1;
        });

        codeSpecs[mutateFile] = mutateFileSpecs || _.map(self._config.specs, function(spec) {
            return self._getRelativeFilePath(spec);
        });
    });

    deferred.resolve(self._getAbsoluteSpecPaths(codeSpecs));

    return deferred.promise;
};

/**
 * Create the code-specs mapping object using Karma coverage metrics. First, the base coverage will be established by
 * running Karma without any spec files. Using this, which code file is covered by a spec file can easily be determined
 * by comparing the coverage of that spec file to the base coverage. If the coverage is higher, the spec file must
 * contain a unit test that covers a piece of code in the source file.
 *
 * @returns {*|promise} a promise that will resolve with the found code-specs mapping object, or reject when any error
 *                      occurs in the process of creating the code-specs mapping object.
 * @private
 */
KarmaCodeSpecsMatcher.prototype._findCodeSpecsUsingCoverage = function() {
    var self = this,
        deferred = Q.defer(),
        codeSpecs = {};

    // First, determine the coverage without any spec file
    self._getSpecFileCoverage().done(function(coverage) {
        var baseCoverage = coverage,
            specCoveragePromises = [];

        // Determine the coverage of all spec files in parallel
        _.forEach(self._config.specs, function(specFile) {
            var deferred = Q.defer();

            self._getSpecFileCoverage(specFile).then(function(specCoverage) {
                _.forOwn(specCoverage, function(coverage, file) {
                    var relativeFile = self._getRelativeFilePath(file),
                        relativeSpecFile = self._getRelativeFilePath(specFile);

                    // A spec file covers a code file when its coverage is higher than the base coverage
                    if(coverage > baseCoverage[file]) {
                        codeSpecs[relativeFile] = _.union(codeSpecs[relativeFile], [relativeSpecFile]);
                    }
                });

                deferred.resolve(specCoverage);
            }, function(error) {
                deferred.reject(error);
            });

            specCoveragePromises.push(deferred.promise);
        });

        // Wait for all spec file coverage objects to be computed
        Q.all(specCoveragePromises).then(function() {
            logger.info("Found pairs of code files and specs: %j", codeSpecs);

            // Remove the coverage files when mutating production code
            if(self._config.mutateProductionCode) {
                fs.remove(self._coverageDir);
            }

            deferred.resolve(self._getAbsoluteSpecPaths(codeSpecs));
        }, function(error) {
            logger.warn('Could not match code with specs: %s', error.message);
            deferred.reject(error);
        });
    }, function(error) {
        logger.warn('Could not find base file coverage: %s', error.message);
        deferred.reject(error);
    });

    return deferred.promise;
};

/**
 * Find the code-specs mapping object, that lists which spec files cover which source code file.
 *
 * @returns {*|promise} a promise that will resolve with the found code-specs mapping object, or reject when any error
 *                      occurs in the process of creating the code-specs mapping object.
 */
KarmaCodeSpecsMatcher.prototype.findCodeSpecs = function() {
    return this._config.karma.fileSpecs ? this._findCodeSpecsFromConfig() : this._findCodeSpecsUsingCoverage();
};

module.exports = KarmaCodeSpecsMatcher;
