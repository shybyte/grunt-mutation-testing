'use strict';

// @excludeMutations ['BLOCK_STATEMENT']
exports.lessThan = function (left, right) {
    return left < right;
};

exports.notGreaterThan = function (left, right) {
    return left <= right;
};

exports.greaterThan = function (left, right) {
    return left > right;
};

exports.notLessThan = function (left, right) {
    return left >= right;
};

exports.equalsStrict = function (left, right) {
    return left === right;
};

exports.equalsLenient = function (left, right) {
    return left == right;
};

exports.unequalsStrict = function (left, right) {
    return left !== right;
};

exports.unequalsLenient = function (left, right) {
    return left != right;
};
