const readLineSync = require('readline-sync');

function promptType(name, deduced) {
    let type = readLineSync.question(`what type is ${name} [ ${deduced} ]:`);
    switch (type) {
        case 'skip':
            return;
        case '':
            type = deduced;
            break;
        default:
            break;
    }
    return type;
}

function printFunctionDecl(node) {
    console.log('>', this.file.code.substring(node.start, node.body.start));
}

function printVariableDecl(node) {
    const size = Math.min(node.end - node.start, 50);
    console.log('>', this.file.code.substring(node.start, node.start + size));
}

module.exports = { printVariableDecl, printFunctionDecl, promptType };
