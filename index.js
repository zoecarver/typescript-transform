const fs = require('fs');
const babel = require('babel-core');
const parse = require('./parse');
const transform = require('./transform');

const fileName = process.argv[2];
let variableToTypeMap;
let functionToTypeMap;
let argumentToTypeMap;
let insertPoints = new Array();
let offset = 0;

function getMaps() {
    return [variableToTypeMap, functionToTypeMap, argumentToTypeMap];
}

function setMaps([_variableToTypeMap, _functionToTypeMap, _argumentToTypeMap]) {
    variableToTypeMap = _variableToTypeMap;
    functionToTypeMap = _functionToTypeMap;
    argumentToTypeMap = _argumentToTypeMap;
}

function addInsertPoint(point, value) {
    insertPoints.push({ point, value });
}

function parseInsertPoints(code) {
    insertPoints.map(({ point, value }) => {
        code = code.insert(point + offset, value);
        offset += value.length;
    });
    return code;
}

fs.readFile(fileName, (err, data) => {
    if (err) throw err;

    const src = data.toString();
    babel.transform(src, {
        plugins: [parse(setMaps)]
    });

    let { code } = babel.transform(src, {
        plugins: [transform(getMaps, addInsertPoint)]
    });

    code = parseInsertPoints(code);

    if (process.argv[3]) console.log(`\n${code}`);
});
