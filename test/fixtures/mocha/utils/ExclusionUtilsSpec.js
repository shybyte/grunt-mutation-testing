/**
 * Created by Martin Koster on 25/02/15.
 */
var assert = require('chai').assert,
    ExclusionUtils = require('../../../../utils/ExclusionUtils');


describe('ExclusionUtils', function(){
    it('select only valid exclusions from the given block comments', function() {
        var exclusions = ExclusionUtils.getExclusions({leadingComments:[
            {type: "Block", value: "/**\n * @excludeMutations = ['MATH', 'LITERAL']"},
            {type: "somethingElse", value: "//@excludeMutations = ['APPLE']"}
        ]});

        assert.deepEqual(exclusions, {MATH: true, LITERAL: true});
    });

    it('select only valid exclusions from the given line comments', function() {
        var exclusions = ExclusionUtils.getExclusions({leadingComments:[
            {type: "Block", value: "/**\n * excludeMutations = ['MATH', 'LITERAL']"},
            {type: "somethingElse", value: "//@excludeMutations bladibla ['COMPARISON']"}
        ]});

        assert.deepEqual(exclusions, {COMPARISON: true});
    });

    it('select all exclusions as no specific exclusions were given', function() {
        var exclusions = ExclusionUtils.getExclusions({leadingComments:[
            {type: "Block", value: "/**\n * @excludeMutations "}
        ]});

        assert.deepEqual(exclusions, {
            "ARRAY": true,
            "BLOCK_STATEMENT": true,
            "COMPARISON": true,
            "LITERAL": true,
            "LOGICAL_EXPRESSION": true,
            "MATH": true,
            "METHOD_CALL": true,
            "OBJECT": true,
            "UNARY_EXPRESSION": true,
            "UPDATE_EXPRESSION": true
        });
    })
});
