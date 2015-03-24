'use strict';
/**
 * ExclusionUtils
 *
 * @author Jimi van der Woning
 */
var EXCLUSION_KEYWORD = '@excludeMutations';

var _ = require('lodash'),
    CommandRegistry = require('../mutationCommands/CommandRegistry');

/**
 * Parse the comments from a given astNode. It removes all leading asterisks from multiline comments, as
 * well as all leading and trailing whitespace.
 * @param {object} astNode the AST node from which comments should be retrieved
 * @returns {[string]} the comments for the AST node, or an empty array if none could be found
 */
function parseASTComments(astNode) {
    var comments = [];
    if(astNode && astNode.leadingComments) {
        _.forEach(astNode.leadingComments, function(comment) {
            if(comment.type === 'Block') {
                comments = comments.concat(comment.value.split('\n').map(function(commentLine) {
                    // Remove asterisks at the start of the line
                    return commentLine.replace(/^\s*\*\s*/g, '').trim();
                }));
            } else {
                comments.push(comment.value);
            }
        });
    }

    return comments;
}

/**
 * Get the specific exclusions for a given [astNode], if there are any.
 * @param {object} astNode the AST node from which comments should be retrieved
 * @returns {object} a list of mutation codes [key] that are excluded. [value] is always true
 */
function getExclusions(astNode) {
    var comments = parseASTComments(astNode),
        commandCodes = CommandRegistry.getAllCommandCodes(),
        params,
        exclusions = {};

    _.forEach(comments, function(comment) {
        if(comment.indexOf(EXCLUSION_KEYWORD) !== -1) {
            params = comment.match(/\[.*\]/g);
            if(params) {
                // Replace all single quotes with double quotes to be able to JSON parse them
                _.forEach(JSON.parse(params[0].replace(/'/g, '\"')), function(exclusion) {
                    if(commandCodes.indexOf(exclusion) !== -1) {
                        exclusions[exclusion] = true;
                    } else {
                        console.warn('Encountered an unknown exclusion:', exclusion);
                    }
                });
            }

            // Exclude all mutations when none are specifically excluded
            if(_.keys(exclusions).length === 0){
                _.forEach(commandCodes, function(code) {
                    exclusions[code] = true;
                });
            }
        }
    });

    return exclusions;
}

module.exports.getExclusions = getExclusions;
