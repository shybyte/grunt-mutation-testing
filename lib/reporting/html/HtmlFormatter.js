/**
 * This class exposes a number of formatting methods for adding specific markup to code text and mutation results
 *
 * Created by Martin Koster on 06/03/15.
 */
var HandleBars = require('handlebars'),
    HtmlParser = require('htmlparser2'),
    log4js = require('log4js'),
    Q = require('q'),
    _ = require('lodash');

var codeTemplate = HandleBars.compile('<span class="{{classes}}">');
var mutationTemplate = HandleBars.compile('<tr class="{{mutationStatus}}"><td id="{{mutationId}}" class="{{mutationStatus}}">{{mutationText}}</td><td>{{mutationStatus}}</td></tr>');
var HtmlFormatter = function(src) {
    this._src = src;
};


HtmlFormatter.prototype._getHtmlIndexes = function() {
    var self = this,
        parser,
        result = [],
        pushTagIndexes = function() {
            result.push({startIndex: parser.startIndex, endIndex: parser.endIndex});
        };

    var promise = Q.Promise(function(resolve) {
        parser = new HtmlParser.Parser({
                onopentag: pushTagIndexes,
                onclosetag: pushTagIndexes,
                onend: resolve
            }, {decodeEntities:true, recognizeCDATA:true});
        parser.write(self._src);
        parser.end();
    });

    return promise.thenResolve(result);
};

/**
 * formats the list of mutations to display on the
 * @returns {string} markup with all mutations to be displayed
 */
HtmlFormatter.prototype.formatMutations = function (mutationResults) {
    var formattedMutations = '',
        orderedResults = mutationResults.sort(function(left, right) {
            return left.mutation.line - right.mutation.line;
        });
    _.forEach(orderedResults, function(mutationResult){
        var mutationHtml = mutationTemplate({
            mutationId: getDOMMutationId(mutationResult.mutation),
            mutationStatus: mutationResult.survived ? 'survived' : 'killed',
            mutationText: mutationResult.message
        });
        formattedMutations = formattedMutations.concat(mutationHtml);
    });
    return formattedMutations;
};

/**
 * format the source code by inserting markup where each of the given mutations was applied
 * @param {[object]} mutationResults an array of mutation results
 * @param {function} callback will be called with the formatted source as argument
 * @returns {string} the source code formatted with markup into the places where mutations have taken place
 */
HtmlFormatter.prototype.formatSourceToHtml = function (mutationResults, callback){
    var self = this;

    this._getHtmlIndexes().done(function(htmlIndexes) {
        var srcArray = self._src.replace(/[\r]?\n/g, '\n').split(''); //split the source into character array after removing (Windows style) carriage return characters

        _.forEach(htmlIndexes, function(indexPair) {
            var i = indexPair.startIndex;
            for (; i < indexPair.endIndex; i++) {
                srcArray[i] = srcArray[i].replace(/</, '&lt;').replace(/>/, '&gt;');
            }
        });
        _.forEach(mutationResults, function(mutationResult){
            formatMultilineFragment(srcArray, mutationResult);
        });

        if (typeof callback === 'function') {
            callback(srcArray.join(''));
        }
    });
};

/**
 * formats a multi line fragment in such a way that each line gets encased in its own set of html tags,
 * thus preventing contents of a <span> to be broken up with <li> tags later on
 * @param {string} srcArray the source split up into an array of characters
 * @param {object} mutationResult the current mutation result
 */
function formatMultilineFragment (srcArray, mutationResult) {
    var mutation = mutationResult.mutation,
        classes = 'code'.concat(mutationResult.survived ? ' survived ' : ' killed ', getDOMMutationId(mutation)),
        i, l = mutation.end;

    if (!l) { return; }//not a likely scenario, but to be sure...

    for (i = mutation.begin; i < l; i++) {
        if (i === mutation.begin) {
            srcArray[i] = codeTemplate({classes: classes}) + srcArray[i];
        }
        if (srcArray[i] === '\n') {
            if (i > 0 ) {
                srcArray[i-1] = srcArray[i-1] + '</span>';
            }
            if (i < l-1) {
                srcArray[i+1] = codeTemplate({classes: classes}) + srcArray[i+1];
            }
        }
    }

    srcArray[l-1] = srcArray[l-1] + '</span>';
}

/* creates a mutation id from the given mutation result */
function getDOMMutationId(mutation) {
    return 'mutation_' + mutation.mutationId + '_' + mutation.begin + '_' + mutation.end;
}

module.exports = HtmlFormatter;
