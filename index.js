const fs = require('fs');
const babel = require('babel-core');
const parse = require('./parse');
const transform = require('./transform');

const fileName = process.argv[2];
let variableToTypeMap;
let functionToTypeMap;
let argumentToTypeMap;
let functionTypeInsertPoints;
let offset = 0;

function getMaps() {
    return [variableToTypeMap, functionToTypeMap, argumentToTypeMap];
}

function setMaps([_variableToTypeMap, _functionToTypeMap, _argumentToTypeMap]) {
    variableToTypeMap = _variableToTypeMap;
    functionToTypeMap = _functionToTypeMap;
    argumentToTypeMap = _argumentToTypeMap;
}

function setPoints(points) {
    functionTypeInsertPoints = points;
}

function parseFunctionTypeInsertPoints(code) {
    functionTypeInsertPoints.map(({ point, type }, index) => {
        const typeAnnotation = `:${type}`;
        code = code.insert(point + offset, typeAnnotation);
        offset += typeAnnotation.length;
    });
    return code;
}

fs.readFile(fileName, (err, data) => {
    if (err) throw err;

    const src = data.toString();
    babel.transform(src, {
        plugins: [parse(setMaps)]
    });

    const output = babel.transform(src, {
        plugins: [transform(getMaps, setPoints)]
    });

    const code = parseFunctionTypeInsertPoints(output.code);
    console.log(code);
});
