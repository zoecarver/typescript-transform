const { getType } = require('./util');

function deduceType(node, maps, currentFunction, t) {
    // if we can get literal type, do that
    const literalType = getType(node, t);
    if (literalType) return [literalType];

    const [variableToTypeMap, functionToTypeMap, argumentToTypeMap] = maps;
    let returnType;

    // const id = node.find(x => x.type === 'Identifier');
    if (node.type === 'Identifier') {
        const { name, type } = node;
        if (variableToTypeMap[name]) {
            returnType = variableToTypeMap[name];
        }
        if (functionToTypeMap[name]) {
            returnType = functionToTypeMap[name];
        }
        // we want this to override variables
        if (
            currentFunction &&
            argumentToTypeMap[`${currentFunction.name}::${name}`]
        ) {
            returnType = argumentToTypeMap[`${currentFunction.name}::${name}`];
        }
    } else if (node.left) {
        returnType =
            deduceType(node.left, maps, currentFunction, t) ||
            deduceType(node.right, maps, currentFunction, t);
    } else if (node.type === 'CallExpression') {
        return deduceType(node.callee, maps, currentFunction, t);
    } else if (node.type === 'UnaryExpression') {
        if (node.operator === '!') return 'boolean';
        return deduceType(node.argument, maps, currentFunction, t);
    }

    if (/*VERBOSE*/ false) console.log('return type: ', returnType);
    return returnType;
}

module.exports = { deduceType };
