'use strict';
function getBinaryExpression() {
    return -(6*7);
}

function getNumber() {
    return -43;
}

function getBitwiseNotNumber() {
    return ~43;
}

function getNumberBoolean() {
    return !!43;
}

function getNegativeBoolean() {
    return -true;
}

function getBoolean() {
    return !true;
}

exports.getNumber = getNumber;
exports.getBinaryExpression = getBinaryExpression;
exports.getBoolean = getBoolean;
exports.getNegativeBoolean = getNegativeBoolean;
exports.getNumberBoolean = getNumberBoolean;
exports.getBitwiseNotNumber = getBitwiseNotNumber;
