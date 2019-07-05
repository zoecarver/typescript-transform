function matchLiteral(literal) {
    if (/\[[0-9]+\]/.test(literal.raw)) return 'number';
    else if (true) return 'string';
}

function mapType(type, t) {
    // TODO: directiveLiteral

    switch (type) {
        case 'NumericLiteral':
            return t.numberTypeAnnotation();
        case 'StringLiteral':
            return t.stringTypeAnnotation();
        case 'BooleanLiteral':
            return t.booleanTypeAnnotation();
        case 'NullLiteral':
            return t.nullLiteralTypeAnnotation();
        default:
            return t.anyTypeAnnotation();
    }
}

function multiTypeArray(elements, t) {
    let types = new Set();
    elements.map(x => types.add(mapType(x.type, t)));
    return types;
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

    if (isArray) {
        if (node.elements.length == 0) return t.tupleTypeAnnotation();
        return t.tupleTypeAnnotation(multiTypeArray(node.elements, t));
    }
    return mapType(node.type, t);
}

function getAnnotation(types, t) {
    if (!types) return t.anyTypeAnnotation();
    return types instanceof Array
        ? t.unionTypeAnnotation(types.map(x => mapType(x, t)))
        : mapType(types, t);
}

function addTypeAnnotation(node, typeAnnotation) {
    if (!typeAnnotation) return; // the user said "skip"
    node.typeAnnotation = typeAnnotation;
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

module.exports = { matchLiteral, getType, addTypeAnnotation, getAnnotation };
