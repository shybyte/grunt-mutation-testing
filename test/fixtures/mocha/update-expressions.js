exports.incrementA = function (x) {
    // @excludeMutations ['COMPARISON', 'LITERAL']
    return ++x < 10;
};

exports.decrementA = function (x) {
    /* @excludeMutations ['COMPARISON', 'LITERAL'] */
    return --x > 10;
};

// @excludeMutations ['COMPARISON', 'LITERAL']
exports.incrementB = function (x) {
    return x++ < 10;
};

/**
 *  @excludeMutations ['COMPARISON', 'LITERAL']
 */
exports.decrementB = function (x) {
    return x-- > 10;
};
