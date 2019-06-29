const fs = require('fs');
const babel = require('babel-core');
const parse = require('./parse');
const transform = require('./transform');

const fileName = process.argv[2];
let variableToTypeMap;
let functionToTypeMap;
let argumentToTypeMap;

function getMaps() {
    return [variableToTypeMap, functionToTypeMap, argumentToTypeMap];
}

function setMaps([_variableToTypeMap, _functionToTypeMap, _argumentToTypeMap]) {
    console.log('reviced');
    variableToTypeMap = _variableToTypeMap;
    functionToTypeMap = _functionToTypeMap;
    argumentToTypeMap = _argumentToTypeMap;
}

fs.readFile(fileName, (err, data) => {
    if (err) throw err;

    const src = data.toString();
    babel.transform(src, {
        plugins: [parse(setMaps)]
    });

    const output = babel.transform(src, {
        plugins: [transform(getMaps)]
    });

    console.log(output.code);
});
