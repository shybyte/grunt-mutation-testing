/**
 * HTML reporter
 *
 * @author Martin Koster
 * @author Merlin Weemaes
 * @author Jimi van der Woning
 */
'use strict';

var FileHtmlBuilder = require("./FileHtmlBuilder"),
    IndexHtmlBuilder = require("./IndexHtmlBuilder"),
    IOUtils = require("../../../utils/IOUtils"),
    fs = require('fs'),
    path = require('path'),
    Q = require('q'),
    _ = require('lodash');

/**
 * Constructor for the HTML reporter.
 *
 * @param {string} basePath The base path where the report should be created
 * @param {object=} config Configuration object
 * @constructor
 */
var HtmlReporter = function(basePath, config) {
    this._basePath = basePath;
    this._config = config;

    var directories = IOUtils.getDirectoryList(basePath, false);
    IOUtils.createPathIfNotExists(directories, './');
};

/**
 * creates an HTML report using the given results
 * @param results
 * @returns {*}
 */
HtmlReporter.prototype.create = function(results) {
    var self = this;
    return Q.Promise(function (resolve) {
        _.forEach(results, function(result){
            IOUtils.createPathIfNotExists(IOUtils.getDirectoryList(result.fileName, true), self._basePath);
        }, this);
        new FileHtmlBuilder(self._config).createFileReports(results, self._basePath).then(function() {
            self._createDirectoryIndexes(results, self._basePath);
            resolve();
        });
    });
};

/**
 * recursively creates index.html files for all the (sub-)directories
 * @param {object} results mutation results
 * @param {string} baseDir the base directory from which to start generating index files
 * @param {string=} currentDir the current directory
 * @returns {Array} files listed in the index.html
 */
HtmlReporter.prototype._createDirectoryIndexes = function(results, baseDir, currentDir) {
    var self = this,
        dirContents,
        files = [];

    function retrieveStatsFromFile(dir, file) {
        var html = fs.readFileSync(dir + '/' + file, 'utf-8'),
            regex = /data-mutation-stats="(.+)"/g;

        return JSON.parse(decodeURI(regex.exec(html)[1]));
    }

    currentDir = currentDir || baseDir;
    dirContents = fs.readdirSync(currentDir);
    _.forEach(dirContents, function(item){
        if (fs.statSync(path.join(currentDir,item)).isDirectory()) {
            files = _.union(files, self._createDirectoryIndexes(results, baseDir, path.join(currentDir, item)));
        } else if (item !== 'index.html') {
            files.push({fileName: path.join(path.relative(baseDir, currentDir), item), stats: retrieveStatsFromFile(currentDir, item)});
        }
    });

    new IndexHtmlBuilder(baseDir, self._config).createIndexFile(currentDir, files);
    return files;
};

module.exports = HtmlReporter;
