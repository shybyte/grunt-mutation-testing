'use strict';
/** @excludeMutations ['LITERAL'] */
function createArray() {
    var el = {};
    return [el, 'string', 123];
}

exports.createArray = createArray;
