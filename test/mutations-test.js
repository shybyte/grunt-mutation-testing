var _ = require('lodash');
var assert = require("assert");
var expect = require("chai").expect;
var Mutator = require("../lib/Mutator");

describe('Mutations', function () {
    function assertDeepEquivalent(properties, actual, expected) {
        var i, l = expected.length;
        assert.equal(l, actual.length, 'Unexpected number of mutations. Expected ' + l + ', but was ' + actual.length);
        for (i = 0; i < l; i++) {
            _.forEach(properties, function (property) {
                assert.strictEqual(actual[i][property], expected[i][property], 'expected ' + property + ': ' + actual[i][property] + ' to equal ' + expected[i][property]);
            });
        }
    }

    describe('Collect Mutations', function () {

        function add(array) {
            var sum = 0;
            for (var i = 0; i < array.length; i++) {
                sum += array[i];
            }
            sum += 0;
            return sum;
        }

        var addSrc = add.toString();

        it('find mutations in simple function', function () {
            var actual = new Mutator(addSrc).collectMutations();
            assertDeepEquivalent(['begin', 'end', 'replacement'], actual, [
                {begin: 0, end: 202, line: 1, col: 0, replacement: ''},
                {begin: 34, end: 46, line: 2, col: 12, replacement: ''},
                {begin: 59, end: 146, line: 3, col: 12, replacement: ''},
                {begin: 159, end: 168, line: 6, col: 12, replacement: ''},
                {begin: 181, end: 192, line: 7, col: 12, replacement: ''},
                {begin: 44, end: 45, line: 2, col: 22, replacement: '1'},
                {begin: 72, end: 73, line: 3, col: 24, replacement: '1'},
                {begin: 116, end: 132, line: 4, col: 16, replacement: ''},
                {begin: 166, end: 167, line: 6, col: 19, replacement: '1'}
            ])
        });

        function mul(array) {
            return array.reduce(function (x, y) {
                return x * y;
            });
        }

        var mulSrc = mul.toString();
        it('find mutations in functions used as argument', function () {
            var foundMutations = new Mutator(mulSrc).collectMutations();
            var innerReturnMutation = foundMutations[5];
            assertDeepEquivalent(['begin', 'end', 'replacement'], [innerReturnMutation], [{
                begin: 88,
                end: 101,
                line: 3,
                col: 16,
                replacement: ''
            }]);
        });


        function createSimplePerson(name) {
            return {
                name: name
            }
        }

        var createSimplePersonSrc = createSimplePerson.toString();
        it('find mutations in simple object literals', function () {
            var foundMutations = new Mutator(createSimplePersonSrc).collectMutations();
            assert.equal(foundMutations.length, 3);
            var attributeMutation = foundMutations[2];
            assertDeepEquivalent(['begin', 'end', 'replacement'], [attributeMutation], [{
                begin: 73,
                end: 83,
                line: 3,
                col: 16,
                replacement: ''
            }]);
        });

        function createPerson(name, age) {
            return {
                name: name,
                age: age
            }
        }

        var createPersonSrc = createPerson.toString();
        it('find mutations in object literals', function () {
            var foundMutations = new Mutator(createPersonSrc).collectMutations();
            assert.equal(foundMutations.length, 4);
            var attributeMutation = foundMutations[2];
            // take care for the comma
            assertDeepEquivalent(['begin', 'end', 'replacement'], [attributeMutation], [{
                begin: 72,
                end: 100,
                line: 3,
                col: 16,
                replacement: ''
            }]);
        });

        function containsName(persons, name) {
            return _.contains(_.pluck(persons, 'name'), name);
        }

        var containsNameSrc = containsName.toString();
        it('find mutations in function arguments', function () {
            var foundMutations = new Mutator(containsNameSrc).collectMutations();
            assertDeepEquivalent(['begin', 'end', 'replacement'], foundMutations, [
                {begin: 0, end: 111, line: 1, col: 0, replacement: ''},
                {begin: 51, end: 101, line: 2, col: 12, replacement: ''},
                {begin: 69, end: 93, line: 2, col: 30, replacement: '"MUTATION!"'},
                {begin: 95, end: 99, line: 2, col: 56, replacement: '"MUTATION!"'},
                {begin: 58, end: 100, line: 2, col: 19, replacement: '_'},
                {begin: 77, end: 84, line: 2, col: 38, replacement: '"MUTATION!"'},
                {begin: 86, end: 92, line: 2, col: 47, replacement: '"MUTATION!"'},
                {begin: 69, end: 93, line: 2, col: 30, replacement: '_'}
            ]);
        });

        function createArray() {
            var el = {};
            return [el, 'string', 123];
        }

        var createArraySrc = createArray.toString();
        it('find mutations in array literals', function () {
            var foundMutations = new Mutator(createArraySrc).collectMutations();
            assertDeepEquivalent(['begin', 'end', 'replacement'], foundMutations, [
                {begin: 0, end: 99, line: 1, col: 0, replacement: ''},
                {begin: 37, end: 49, line: 2, col: 12, replacement: ''},
                {begin: 62, end: 89, line: 3, col: 12, replacement: ''},
                {begin: 70, end: 74, line: 3, col: 20, replacement: ''},
                {begin: 74, end: 84, line: 3, col: 24, replacement: ''},
                {begin: 84, end: 87, line: 3, col: 34, replacement: ''},
                {begin: 74, end: 82, line: 3, col: 24, replacement: '"MUTATION!"'},
                {begin: 84, end: 87, line: 3, col: 34, replacement: '124'}
            ]);
        });


        function encodeUrl(url) {
            return encodeURI(url);
        }

        var encodeUrlSrc = encodeUrl.toString();
        it("find mutations by replacing function call with it's argument", function () {
            var foundMutations = new Mutator(encodeUrlSrc).collectMutations();
            assertDeepEquivalent(['begin', 'end', 'replacement'], [foundMutations[3]], [{
                begin: 45,
                end: 59,
                line: 2,
                col: 19,
                replacement: 'url'
            }]);
        });

        function trim(string) {
            return string.trim();
        }

        var trimSrc = trim.toString();
        it("find mutations by replacing method calls with object", function () {
            var foundMutations = new Mutator(trimSrc).collectMutations();
            assertDeepEquivalent(['begin', 'end', 'replacement'], [foundMutations[2]], [{
                begin: 43,
                end: 56,
                line: 2,
                col: 19,
                replacement: 'string'
            }]);
        });

        function getLiterals() {
            return {
                string: "string",
                number: 42,
                boolean: true
            };
        }

        var getLiteralsSrc = getLiterals.toString();
        it("find mutations by replacing literals", function () {
            var foundMutations = new Mutator(getLiteralsSrc).collectMutations();
            assertDeepEquivalent(['begin', 'end', 'replacement'], [foundMutations[5]], [{
                begin: 70,
                end: 78,
                line: 3,
                col: 24,
                replacement: '"MUTATION!"'
            }]);
            assertDeepEquivalent(['begin', 'end', 'replacement'], [foundMutations[6]], [{
                begin: 104,
                end: 106,
                line: 4,
                col: 24,
                replacement: '43'
            }]);
            assertDeepEquivalent(['begin', 'end', 'replacement'], [foundMutations[7]], [{
                begin: 133,
                end: 137,
                line: 5,
                col: 25,
                replacement: 'false'
            }]);
        });

        function getUnaryExpression() {
            return {
                string: -"string",
                number: -42,
                boolean: -true
            };
        }

        var getUnaryExpressionSrc = getUnaryExpression.toString();
        it("find mutations by mutating unary expressions", function () {
            var foundMutations = new Mutator(getUnaryExpressionSrc).collectMutations();
            assertDeepEquivalent(['begin', 'end', 'replacement'], [foundMutations[5]], [{
                begin: 77,
                end: 78,
                line: 3,
                col: 24,
                replacement: ''
            }]);
            assertDeepEquivalent(['begin', 'end', 'replacement'], [foundMutations[6]], [{
                begin: 112,
                end: 113,
                line: 4,
                col: 24,
                replacement: ''
            }]);
            assertDeepEquivalent(['begin', 'end', 'replacement'], [foundMutations[7]], [{
                begin: 142,
                end: 143,
                line: 5,
                col: 25,
                replacement: ''
            }]);
        });

        function getLogicalExpression() {
            return {
                string: true && 2,
                number: true || 3
            };
        }

        var getLogicalExpressionSrc = getLogicalExpression.toString();
        it("find mutations by mutating logical expressions", function () {
            var foundMutations = new Mutator(getLogicalExpressionSrc).collectMutations();
            assertDeepEquivalent(['begin', 'end', 'replacement'], [foundMutations[4]], [{
                begin: 83,
                end: 87,
                line: 3,
                col: 24,
                replacement: '||'
            }]);
            assertDeepEquivalent(['begin', 'end', 'replacement'], [foundMutations[7]], [{
                begin: 118,
                end: 122,
                line: 4,
                col: 24,
                replacement: '&&'
            }]);
        });

        function mulArrowStmt(array) {
            return array.reduce((x, y) => {
                return x * y;
            });
        }

        var mulArrowStmtSrc = mulArrowStmt.toString();
        it('find mutations in statement arrow functions', function () {
            var foundMutations = new Mutator(mulArrowStmtSrc).collectMutations();

	        var innerReturnMutation = foundMutations[5];
	        assertDeepEquivalent(['begin', 'end', 'replacement'], [innerReturnMutation], [{
                begin: 91,
                end: 104,
                line: 3,
                col: 16,
                replacement: ''
	        }]);
        });

        function mulArrowExpr(array) {
            return array.reduce((x, y) => x * y);
        }

        var mulArrowExprSrc = mulArrowExpr.toString();
        it('find mutations in expression arrow functions', function () {
	        var foundMutations = new Mutator(mulArrowExprSrc).collectMutations();

	        var expressionMutation = foundMutations[5];
	        assertDeepEquivalent(['begin', 'end', 'replacement'], [expressionMutation], [{
                begin: 74,
                end: 77,
                line: 2,
                col: 43,
                replacement: '/'
	        }]);
        });
    })
});
