const fs = require('fs');
const babel = require('babel-core');
const parse = require('./parse');
const transform = require('./transform');
const commander = require('commander');

commander
    .version('0.1.0')
    .usage('<file> [options]')
    .option('-i, --interactive', 'Ask about each type before adding it', {
        isDefault: true
    })
    .option('-a, --auto', 'Pick the types for me')
    .option('-o, --output [output]', 'Output file. Defaults to stdout')
    .parse(process.argv);

if (process.argv.length < 3) throw new Error('Expected one input file.');
if (commander.interactive && commander.auto)
    throw new Error('Cannot be both interactive and autonomous');

const interactive = commander.interactive || !commander.auto;

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

const src = fs.readFileSync(fileName).toString();

babel.transform(src, {
    plugins: [parse(setMaps)]
});

let { code } = babel.transform(src, {
    plugins: [transform(interactive, getMaps, addInsertPoint)]
});

code = parseInsertPoints(code);

if (commander.output) fs.writeFileSync(commander.output, code);
else console.log(code);
