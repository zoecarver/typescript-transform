function mapType(type, t) {
    // TODO: directiveLiteral

    switch (type) {
        case 'NumericLiteral': case 'TSNumberKeyword':
            return t.tsNumberKeyword();
        case 'StringLiteral': case 'TSStringKeyword':
            return t.tsStringKeyword();
        case 'BooleanLiteral': case 'TSBooleanKeyword':
            return t.tsBooleanKeyword();
        case 'NullLiteral': case 'TSNullKeyword':
            return t.tsNullKeyword();
        default:
            return t.tsAnyKeyword();
    }
}

function multiTypeArray(elements, t) {
    let types = new Set();
    elements.map(x => types.add(mapType(x.type, t)));
    return Array.from(types);
}

function typesDiffer(elements) {
    const type = elements[0].type;
    for (let i = 1; i < elements.length; ++i) {
        if (elements[i].type != type) return true;
    }
    return false;
}

function getType(node, t) {
    const isArray = node.type === 'ArrayExpression';
    if (isArray)
        return t.tsTupleType(multiTypeArray(node.elements, t));
    return mapType(node.type, t);
}

function addTypeAnnotation(node, typeAnnotation, t) {
    if (!typeAnnotation) return; // the user said "skip"
    if (node.type === 'FunctionDeclaration')
        node.returnType = t.tsTypeAnnotation(typeAnnotation);
    else
        node.typeAnnotation = t.tsTypeAnnotation(typeAnnotation);
}

// extentions

String.prototype.insert = function(index, string) {
    if (index > 0)
        return (
            this.substring(0, index) +
            string +
            this.substring(index, this.length)
        );

    return string + this;
};

module.exports = { getType, addTypeAnnotation };
