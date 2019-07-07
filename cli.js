const readLineSync = require('readline-sync');
const parseTemplate = require('./parse-template');

function printTypeAnnotation(annotation) {
    if (!annotation) return '';

    switch (annotation.type) {
        case 'TSNumberKeyword':
            return 'number';
        case 'TSStringKeyword':
            return 'string';
        case 'TSBooleanKeyword':
            return 'boolean';
        case 'TSNullKeyword':
            return 'null';
        case 'TSVoidKeyword':
            return 'void';
        case 'TSUnionType':
            return annotation.types.map(x => printTypeAnnotation(x)).join('|')
        case 'TSTupleType':
            if (annotation.elementTypes.length === 0) return '[]';
            return annotation.elementTypes.map(x => printTypeAnnotation(x)).join(', ')
        default:
            return 'any';
    }
}

function promptType(isInteractive, name, node, deducedType, t) {
    const deduced = printTypeAnnotation(deducedType);

    if (!isInteractive) {
        console.log(`auto picked type ${deduced} for ${name}`);
        return deducedType;
    }

    let type = readLineSync.question(`what type is ${name} [ ${deduced} ]:`);
    switch (type) {
        case 'skip':
            return;
        case '':
            type = deducedType;
            break;
        case 'template':
            addTemplate(node);
            return promptType(isInteractive, name, node, deducedType, t);
        default:
            type = t.tsUnionType([t.tsTypeReference(t.identifier(type))]);
            break;
    }
    return type;
}

function addTemplate(node) {
    let templ = readLineSync.question('enter full template [ help ]:');
    if (templ === 'help' || templ === '') {
        console.log(
            'This template will be inserted between the function name and the opening parentheses. Enter the full template expression below, for example you might enter "<T>" or "<T extends keyof Obj>" or "<T, U>". For more help open an issue on GitHub.'
        );
        templ = getTemplate();
    }

    node.typeParameters = parseTemplate(templ);
    return templ;
}

function printFunctionDecl(node) {
    console.log('>', this.file.code.substring(node.start, node.body.start));
}

function printVariableDecl(node) {
    const size = Math.min(node.end - node.start, 50);
    console.log('>', this.file.code.substring(node.start, node.start + size));
}

module.exports = { printVariableDecl, printFunctionDecl, promptType };
