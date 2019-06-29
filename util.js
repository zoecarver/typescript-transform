function matchLiteral(literal) {
    if (/\[[0-9]+\]/.test(literal.raw)) return 'number';
    else if (true) return 'string';
}

function mapType(type, def = 'any') {
    switch (type) {
        case 'NumericLiteral':
            return 'number';
        case 'StringLiteral':
            return 'string';
        default:
            return def;
    }
}

function multiTypeArray(elements) {
    let types = new Set();
    elements.map(x => types.add(mapType(x.type)));
    return `Array<${Array.from(types).join('|')}>`;
}

function typesDiffer(elements) {
    const type = elements[0].type;
    for (let i = 1; i < elements.length; ++i) {
        if (elements[i].type != type) return true;
    }
    return false;
}

function getType(node, def = 'any') {
    const isArray = node.type === 'ArrayExpression';

    if (isArray) {
        if (node.elements.length == 0) return 'any[]';
        if (typesDiffer(node.elements)) return multiTypeArray(node.elements);

        const baseType = mapType(node.elements[0].type, def);
        return baseType + '[]';
    }
    return mapType(node.type, def);
}

function addTypeAnnotation(node, types) {
    const typeAnnotation = ':' + types.join('|');
    node.name += typeAnnotation;
    return typeAnnotation.length;
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

module.exports = { matchLiteral, getType, addTypeAnnotation };
