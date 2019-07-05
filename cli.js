const readLineSync = require('readline-sync');

function printTypeAnnotation(annotation) {
    switch (annotation.type) {
        case 'NumberTypeAnnotation':
            return 'number';
        case 'StringTypeAnnotation':
            return 'string';
        case 'BooleanTypeAnnotation':
            return 'boolean';
        case 'NullTypeAnnotation':
            return 'null';
        default:
            return 'any';
    }
}

function promptType(isInteractive, name, deducedType, addTemplate) {
    const deduced = printTypeAnnotation(deducedType);

    if (!isInteractive) {
        console.log(`auto picked type ${deduced} for ${name}`);
        return deduced;
    }

    let type = readLineSync.question(`what type is ${name} [ ${deduced} ]:`);
    switch (type) {
        case 'skip':
            return;
        case '':
            type = deducedType;
            break;
        case 'template':
            addTemplate(getTemplate());
            return promptType(isInteractive, name, deducedType, addTemplate);
        default:
            break;
    }
    return type;
}

function getTemplate() {
    let templ = readLineSync.question('enter full template [ help ]:');
    if (templ === 'help' || templ === '') {
        console.log(
            'This template will be inserted between the function name and the opening parentheses. Enter the full template expression below, for example you might enter "<T>" or "<T extends keyof Obj>" or "<T, U>". For more help open an issue on GitHub.'
        );
        return getTemplate();
    }
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
