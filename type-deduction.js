function deduceType(node, maps, currentFunction) {
    const [variableToTypeMap, functionToTypeMap, argumentToTypeMap] = maps;
    let returnType;

    // const id = node.find(x => x.type === 'Identifier');
    if (node.type === 'Identifier') {
        const { name, type } = node;
        if (variableToTypeMap[name]) {
            returnType = variableToTypeMap[name];
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
            deduceType(node.left, maps, currentFunction) ||
            deduceType(node.right, maps, currentFunction);
    }

    console.log('return type: ', returnType);
    return returnType;
}

module.exports = { deduceType };
