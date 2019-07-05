// function fn(a, b, c) {
//     return null;
// }
//
// fn('0', 1, true);

const x = ''
    .reverse()
    .reverse()
    .reverse().length;

const fileName = '';
let variableToTypeMap = [];
let functionToTypeMap = [];
let argumentToTypeMap = [];
let insertPoints = [];
let offset = 0;

function getMaps() {
    return [variableToTypeMap, functionToTypeMap, argumentToTypeMap];
}
