/**
 * Builds the HTML for each file in the given results
 * Created by Martin Koster on 3/2/15.
 */
var fs = require('fs'),
    _ = require('lodash'),
    Q = require('q'),
    log4js = require('log4js'),
    path = require('path'),
    Handlebars = require('handlebars'),
    HtmlFormatter = require('./HtmlFormatter'),
    IndexHtmlBuilder = require('./IndexHtmlBuilder');

var fileTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, '/templates/file.html'), 'utf-8'));

var DEFAULT_CONFIG = {
    successThreshold: 80
};

var logger = log4js.getLogger('FileHtmlBuilder');

var FileHtmlBuilder = function(config) {
    this._config = _.merge({}, DEFAULT_CONFIG, config);

    Handlebars.registerHelper('json', function(context) {
        return encodeURI(JSON.stringify(context));
    });
};

/**
 * creates an HTML report for each file within the given results
 * @param {Array} fileResults mutation results for each file
 * @param {string} baseDir the base directory in which to write the reports
 */
FileHtmlBuilder.prototype.createFileReports = function(fileResults, baseDir) {
    var self = this,
        promises = [];

    _.forEach(fileResults, function(fileResult) {
        promises.push(Q.Promise(function(resolve) {
            var results = fileResult.mutationResults,
                formatter = new HtmlFormatter(fileResult.src);

            formatter.formatSourceToHtml(results, function(formattedSource) {
                writeReport.call(self, fileResult, formatter, formattedSource.split('\n'), baseDir);
                resolve();
            });
        }));
    }, this);

    return Q.all(promises);
};

/**
 * write the report to file
 */
function writeReport(fileResult, formatter, formattedSourceLines, baseDir) {
    var fileName = fileResult.fileName,
        formattedSource = '',
        stats = fileResult.stats,
        parentDir = path.normalize(baseDir + '/..'),
        coverage = stats.all ? ((stats.all - stats.survived) / stats.all * 100).toFixed(1) : 0,
        mutations = formatter.formatMutations(fileResult.mutationResults),
        breadcrumb = new IndexHtmlBuilder(baseDir).linkPathItems({
            currentDir: parentDir,
            fileName: baseDir + '/' + fileName + '.html',
            separator: ' >> ',
            relativePath: getRelativeDistance(baseDir + '/' + fileName, baseDir ),
            linkDirectoryOnly: true
        });

    _.forEach(formattedSourceLines, function (line) {
        formattedSource = formattedSource.concat('<li>', line, '</li>');
    });
    fs.writeFileSync(
        path.join(baseDir, fileName + ".html"),
        fileTemplate({
            style: fs.readFileSync(path.join(__dirname, 'templates/file.css'), 'utf-8'),
            script: fs.readFileSync(path.join(__dirname, 'templates/file.js'), 'utf-8'),
            source: '<ol>' + formattedSource + '</ol>',
            mutations: mutations,
            breadcrumb: breadcrumb,
            stats: stats,
            coverage: coverage,
            coverageStatus: coverage > this._config.successThreshold ? 'killed' : 'survived'
        }));
}

function getRelativeDistance(baseDir, currentDir) {
    var relativePath = path.relative(baseDir, currentDir),
        segments = relativePath.split(path.sep);

    return _.filter(segments, function(segment) {
        return segment === '.' || segment === '..';
    }).join('/');
}

module.exports = FileHtmlBuilder;
