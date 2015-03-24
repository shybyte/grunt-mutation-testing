/*
 * mutations
 *
 * Copyright (c) 2014 Marco Stahl
 * Licensed under the MIT license.
 */

'use strict';
var esprima = require('esprima'),
    escodegen = require('escodegen'),
    _ = require('lodash'),
    Utils = require('../utils/MutationUtils'),
    MutateBaseCommand = require('../mutationCommands/MutateBaseCommand'),
    ExclusionUtils = require('../utils/ExclusionUtils'),
    CommandRegistry = require('../mutationCommands/CommandRegistry'),
    CommandExecutor = require('../mutationCommands/CommandExecutor');

function findMutations(src, excludeMutations) {
    var ast = esprima.parse(src, {range: true, loc: true, tokens: true, comment: true}),
        globalExcludes = _.merge(CommandRegistry.getDefaultExcludes(), excludeMutations),
        mutations = [];

    ast = escodegen.attachComments(ast, ast.comments, ast.tokens);
    function forEachMutation(subtree, processMutation) {
        var astNode = subtree.node,
            excludes = subtree.excludes || globalExcludes,
            Command;

        Command = astNode && CommandRegistry.selectCommand(astNode);
        if (Command) {
            if (excludes[Command.code]) { //the command code is not included - revert to default command
                Command = MutateBaseCommand;
            }

            _.forEach(CommandExecutor.executeCommand(new Command(src, subtree, processMutation)),
                function (subTree) {
                    if(subTree.node) {
                        var localExcludes = ExclusionUtils.getExclusions(subTree.node);
                        subTree.excludes = _.merge({}, excludes, localExcludes);
                    }

                    forEachMutation(subTree, processMutation);
                }
            );
        }
    }

    forEachMutation({node:ast, parentMutationId: _.uniqueId()}, function (mutation) {
        mutations.push(mutation);
    });

    return mutations;
}

function applyMutation(src, mutation) {
    return src.substr(0, mutation.begin) + mutation.replacement + src.substr(mutation.end);
}

module.exports.findMutations = findMutations;
module.exports.applyMutation = applyMutation;
