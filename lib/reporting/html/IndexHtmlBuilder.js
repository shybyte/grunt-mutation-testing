/**
 * HTML reporter
 *
 * @author Martin Koster
 * @author Jimi van der Woning
 */
'use strict';

var HandleBars = require("handlebars"),
    IOUtils = require('../../../utils/IOUtils'),
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash');

var segmentLinkTemplate = HandleBars.compile('<a class="link {{status}}" href="{{segment}}/index.html">{{folder}}</a>{{separator}}');
var fileLinkTemplate = HandleBars.compile('<a class="link {{status}}" href="{{path}}">{{file}}</a>');
var rowTemplate = HandleBars.compile('<tr><td>{{{pathSegments}}}</td><td class="perc">{{{filePerc}}}%</td></tr>\n');

var DEFAULT_CONFIG = {
    successThreshold: 80
};

/**
 * IndexHtmlBuilder constructor.
 *
 * @param {string} baseDir
 * @param {object=} config
 * @constructor
 */
var IndexHtmlBuilder = function(baseDir, config) {
    this._baseDir = baseDir;
    this._config = _.merge({}, DEFAULT_CONFIG, config);
    this._folderPercentages = {};
};

/**
 * create the index file for the current directory. The index file contains a list of all mutated files in all
 * subdirectories, including links for drilling down into the subdirectories
 * @param currentDir the directory for which to create the index file
 * @param files mutated files within the directory subtree of currentDir
 */
IndexHtmlBuilder.prototype.createIndexFile = function(currentDir, files) {
    var allStats = _.reduce(files, this._accumulateStatsAndPercentages, {}, this),
        folderSuccessRate = (allStats.all - allStats.survived) / allStats.all * 100,
        indexSource = fs.readFileSync(__dirname + '/templates/index.html', 'utf-8'),
        indexTemplate = HandleBars.compile(indexSource),
        rows = '';

    _.forEach(files, function(file) {
        var relativePath = path.relative(this._baseDir, currentDir),
            filePerc = file.stats.all ? (file.stats.all - file.stats.survived) / file.stats.all * 100 : 0,
            pathSegments = this.linkPathItems({
                currentDir: relativePath,
                fileName: file.fileName,
                separator: '/',
                filePerc: filePerc
            });

        rows = rows.concat(rowTemplate({ pathSegments: pathSegments, filePerc: filePerc.toFixed(1) }));
    }, this);

    fs.writeFileSync(currentDir + "/index.html", indexTemplate({
        rows: rows,
        stats: allStats,
        style: fs.readFileSync(__dirname + '/templates/index.css', 'utf-8'),
        status: folderSuccessRate > this._config.successThreshold ? 'killed' : 'survived',
        folderSuccessRate: folderSuccessRate.toFixed(1)
    }));
};

/**
 * Adds Hyperlinks to each path segment - linking to the relevant directory's index.html
 * @param {{currentDir, fileName, separator, [filePerc], [relativePath]}} options object containing the parameters to link the path items
 * @returns {string}
 */
IndexHtmlBuilder.prototype.linkPathItems = function(options) {
    var folderPercentages = this._folderPercentages || {},
        successThreshold = this._config.successThreshold,
        fileName = path.basename(options.fileName, '.html'),
        relativeLocation = IOUtils.normalizeWindowsPath(path.relative(options.currentDir, options.fileName)),
        rawPath = options.relativePath || '.',
        directoryList = IOUtils.getDirectoryList(relativeLocation.replace(rawPath, ''), true),
        linkedPath = '',
        fileStatus = options.filePerc ? options.filePerc > successThreshold ? 'killed' : 'survived' : '',
        folderStatus;

    _.forEach(directoryList, function(folder) {
        var perc = folderPercentages ? folderPercentages[folder] : null;
        rawPath = rawPath.concat('/', folder);
        folderStatus = perc ? perc.total / perc.weight > successThreshold ? 'killed' : 'survived' : '';
        linkedPath = linkedPath.concat(segmentLinkTemplate({
            segment: rawPath,
            folder: folder,
            status: folderStatus,
            separator: options.separator
        }));
    });

    if (options.linkDirectoryOnly) {
        return linkedPath.concat(fileName);
    }else {
        return linkedPath.concat(fileLinkTemplate({
            path: relativeLocation,
            separator: options.separator,
            file: fileName,
            status: fileStatus
        }));
    }
};

/**
 * accumulates the statistics of given file in each of its path segments and returns the mutation statistics for that file
 * @param result result containing stats
 * @param file file for which to collect stats
 * @returns {{all, ignored, untested, survived}} stats for the given file
 */
IndexHtmlBuilder.prototype._accumulateStatsAndPercentages = function(result, file) {
    var folders = IOUtils.getDirectoryList(file.fileName, true);
    _.forEach(folders, function(folder) {
        this._folderPercentages[folder] = this._folderPercentages[folder] || {};
        this._folderPercentages[folder].total = (this._folderPercentages[folder].total || 0) +
        (file.stats.all - file.stats.survived) / file.stats.all * 100;
        this._folderPercentages[folder].weight = (this._folderPercentages[folder].weight || 0) + 1;
    }, this);

    result.ignored = (result.ignored || 0) + file.stats.ignored;
    result.all = (result.all || 0) + file.stats.all;
    result.untested = (result.untested || 0) + file.stats.untested;
    result.survived = (result.survived || 0) + file.stats.survived;
    return result;
};

module.exports = IndexHtmlBuilder;
