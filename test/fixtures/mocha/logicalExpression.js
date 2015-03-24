function getBooleanAnd() {
    /* @excludeMutations ['LITERAL'] */
    return true && false;
}

function getBooleanOr() {
    /* @excludeMutations ['LITERAL'] */
    return true || false;
}

exports.getBooleanAnd = getBooleanAnd;
exports.getBooleanOr = getBooleanOr;
