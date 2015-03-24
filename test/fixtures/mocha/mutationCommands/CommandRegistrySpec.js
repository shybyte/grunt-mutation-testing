/**
 * Created by martin on 20/03/15.
 */
var _ = require('lodash'),
    expect = require('chai').expect,
    CommandRegistry = require('../../../../mutationCommands/CommandRegistry');

describe('Command Registry', function(){

    describe('Command Codes', function () {
        it('returns the command codes', function() {
            var defaultExclusions = CommandRegistry.getAllCommandCodes();
            expect(defaultExclusions).to.contain("ARRAY", "BLOCK_STATEMENT", "COMPARISON", "LITERAL", "LOGICAL_EXPRESSION", "MATH", "METHOD_CALL", "OBJECT", "UNARY_EXPRESSION", "UPDATE_EXPRESSION");
        });

    });

    describe('Default Excludes', function() {
        it('returns the command codes and their default values', function() {
            var defaultExclusions = CommandRegistry.getDefaultExcludes();
            expect(defaultExclusions).to.contain({
                "ARRAY": false,
                "BLOCK_STATEMENT": false,
                "COMPARISON": false,
                "LITERAL": false,
                "LOGICAL_EXPRESSION": false,
                "MATH": false,
                "METHOD_CALL": false,
                "OBJECT": false,
                "UNARY_EXPRESSION": false,
                "UPDATE_EXPRESSION": false
            });
        });
    });

    describe('Select Command', function(){
        it('selects a BlockStatementCommand if the node contains an array in its body', function() {
            expect(CommandRegistry.selectCommand({body:[]}).name).to.equal('MutateBlockStatementCommand');
        });

        it('selects a MutateIterationCommand if the node type is a (do) while statement', function() {
            expect(CommandRegistry.selectCommand({type:"WhileStatement"}).name).to.equal('MutateIterationCommand');
            expect(CommandRegistry.selectCommand({type:"DoWhileStatement"}).name).to.equal('MutateIterationCommand');
        });

        it('selects a MutateForLoopCommand if the node type is a while statement', function() {
            expect(CommandRegistry.selectCommand({type:"ForStatement"}).name).to.equal('MutateForLoopCommand');
        });

        it('selects a AssignmentExpressionCommand if the node type is an assignment expression', function() {
            expect(CommandRegistry.selectCommand({type:"AssignmentExpression"}).name).to.equal('AssignmentExpressionCommand');
        });

        it('selects a MutateCallExpressionCommand if the node type is a function call', function() {
            expect(CommandRegistry.selectCommand({type:"CallExpression"}).name).to.equal('MutateCallExpressionCommand');
        });

        it('selects a MutateObjectCommand if the node type is an object', function() {
            expect(CommandRegistry.selectCommand({type:"ObjectExpression"}).name).to.equal('MutateObjectCommand');
        });

        it('selects a MutateArrayExpressionCommand if the node type is an array', function() {
            expect(CommandRegistry.selectCommand({type:"ArrayExpression"}).name).to.equal('MutateArrayCommand');
        });

        it('selects a MutateUpdateExpressionCommand if the node type is an update expression', function() {
            expect(CommandRegistry.selectCommand({type:"UpdateExpression"}).name).to.equal('MutateUpdateExpressionCommand');
        });

        it('selects a MutateLiteralCommand if the node type is a literal', function() {
            expect(CommandRegistry.selectCommand({type:"Literal"}).name).to.equal('MutateLiteralCommand');
        });

        it('selects a UnaryExpressionCommand if the node type is a unary expression', function() {
            expect(CommandRegistry.selectCommand({type:"UnaryExpression"}).name).to.equal('UnaryExpressionCommand');
        });

        it('selects a MutateLogicalExpressionCommand if the node type is a logical expression', function() {
            expect(CommandRegistry.selectCommand({type:"LogicalExpression"}).name).to.equal('MutateLogicalExpressionCommand');
        });

        it('returns null if the given node is not an object', function() {
            expect(CommandRegistry.selectCommand("notAnObject")).to.be.null;
        });
    });
});

