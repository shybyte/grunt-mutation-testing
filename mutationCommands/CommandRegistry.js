/**
 * This registry contains all the possible mutation commands and the predicates for which they a command will be selected.
 * It will select and return a command based on the given syntax tree node.
 *
 * To add new commands to the application simply create a new Mutation command based on MutationBaseCommand and add it to the registry together with an appropriate predicate.
 *
 * Created by Martin Koster on 2/20/15.
 */
var _ = require('lodash'),
    MutateComparisonOperatorCommand = require('../mutationCommands/MutateComparisonOperatorCommand'),
    MutateArithmeticOperatorCommand = require('../mutationCommands/MutateArithmeticOperatorCommand'),
    MutateArrayExpressionCommand = require('../mutationCommands/MutateArrayExpressionCommand'),
    MutateBlockStatementCommand = require('../mutationCommands/MutateBlockStatementCommand'),
    MutateObjectCommand = require('../mutationCommands/MutateObjectCommand'),
    MutateLiteralCommand = require('../mutationCommands/MutateLiteralCommand'),
    MutateUnaryExpressionCommand = require('../mutationCommands/MutateUnaryExpressionCommand'),
    MutateLogicalExpressionCommand = require('../mutationCommands/MutateLogicalExpressionCommand'),
    MutateBaseCommand = require('../mutationCommands/MutateBaseCommand'),
    MutateCallExpressionCommand = require('../mutationCommands/MutateCallExpressionCommand'),
    MutateUpdateExpressionCommand = require('../mutationCommands/MutateUpdateExpressionCommand'),
    MutateIterationCommand = require('../mutationCommands/MutateIterationCommand'),
    MutateForLoopCommand = require('../mutationCommands/MutateForLoopCommand'),
    AssignmentExpressionCommand = require('../mutationCommands/AssignmentExpressionCommand');

/*
 * Add a new command to this registry together with its predicate. It will automatically be included in the system
 */
var registry  = [
    {predicate: function(node) {return node && node.body && _.isArray(node.body);}, Command: MutateBlockStatementCommand},
    {predicate: function(node) {return node && (node.type === 'WhileStatement' || node.type === 'DoWhileStatement');}, Command: MutateIterationCommand},
    {predicate: function(node) {return node && node.type === 'ForStatement';}, Command: MutateForLoopCommand},
    {predicate: function(node) {return node && node.type === 'AssignmentExpression';}, Command: AssignmentExpressionCommand},
    {predicate: function(node) {return node && node.type === 'CallExpression';}, Command: MutateCallExpressionCommand},
    {predicate: function(node) {return node && node.type === 'ObjectExpression';}, Command: MutateObjectCommand},
    {predicate: function(node) {return node && node.type === 'ArrayExpression';}, Command: MutateArrayExpressionCommand},
    {predicate: function(node) {return node && node.type === 'BinaryExpression' && isArithmeticExpression(node);}, Command: MutateArithmeticOperatorCommand},
    {predicate: function(node) {return node && node.type === 'BinaryExpression' && !isArithmeticExpression(node);}, Command: MutateComparisonOperatorCommand},
    {predicate: function(node) {return node && node.type === 'UpdateExpression';}, Command: MutateUpdateExpressionCommand},
    {predicate: function(node) {return node && node.type === 'Literal';}, Command: MutateLiteralCommand},
    {predicate: function(node) {return node && node.type === 'UnaryExpression';}, Command: MutateUnaryExpressionCommand},
    {predicate: function(node) {return node && node.type === 'LogicalExpression';}, Command: MutateLogicalExpressionCommand},
    {predicate: function(node) {return _.isObject(node);}, Command: MutateBaseCommand}
];

function isArithmeticExpression(node) {
    return _.indexOf(['+', '-', '*', '/', '%'], node.operator) > -1;
}
(function CommandRegistry(exports) {

    /**
     * Selectes a command based on the given Abstract Syntax Tree node.
     * @param {object} node the node for which to return a mutation command
     * @returns {object} The command to be executed for this node
     */
    function selectCommand(node) {
        var commandRegistryItem = _.find(registry, function(registryItem) {
            return !!registryItem.predicate(node);
        });
        return commandRegistryItem ? commandRegistryItem.Command : null;
    }

    /**
     * returns the command codes of all available mutation commands
     * @returns {[string]} a list of mutation codes
     */
    function getAllCommandCodes() {
        return _.keys(getDefaultExcludes());
    }

    /**
     * returns the default exclusion status of each mutation command
     * @returns {object} a list of mutation codes [key] and whether or not they're excluded [value]
     */
    function getDefaultExcludes() {
        var excludes = {};
        _.forEach(_.pluck(registry, 'Command'), function(Command){
            if(Command.code) {
                excludes[Command.code] = !!Command.exclude;
            }
        });
        return excludes;
    }

    exports.selectCommand = selectCommand;
    exports.getAllCommandCodes = getAllCommandCodes;
    exports.getDefaultExcludes = getDefaultExcludes;
})(module.exports);
