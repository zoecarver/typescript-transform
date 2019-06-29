const { getType } = require('./util');

let variableToTypeMap = new Object();
let functionToTypeMap = new Object();
let argumentToTypeMap = new Object();
let functionToArgsMap = new Object();

module.exports = setMaps =>
    function(babel) {
        return {
            visitor: {
                VariableDeclarator: function({ node }) {
                    variableToTypeMap[node.id.name] = [getType(node.init)];
                },
                AssignmentExpression: function({ node }) {
                    if (variableToTypeMap[node.left.name] instanceof Array) {
                        variableToTypeMap[node.left.name].push(
                            getType(node.right)
                        );
                    } else {
                        variableToTypeMap[node.left.name] = [
                            getType(node.right.type)
                        ];
                    }
                },
                FunctionDeclaration: function({ node }) {
                    const ret = node.body.body.find(
                        x => x.type === 'ReturnStatement'
                    );
                    functionToTypeMap[node.id.name] = [getType(ret.argument)];
                    functionToArgsMap[node.id.name] = node.params.map(
                        x => x.name
                    );
                },
                CallExpression: function({ node }) {
                    if (argumentToTypeMap[node.callee.name] instanceof Array) {
                        node.arguments.forEach((arg, index) => {
                            argumentToTypeMap[
                                `${node.callee.name}::${
                                    functionToArgsMap[node.callee.name][index]
                                }`
                            ].push(getType(arg));
                        });
                    } else {
                        node.arguments.forEach((arg, index) => {
                            argumentToTypeMap[
                                `${node.callee.name}::${
                                    functionToArgsMap[node.callee.name][index]
                                }`
                            ] = [getType(arg)];
                        });
                    }
                },
                Program: {
                    exit: function() {
                        setMaps([
                            variableToTypeMap,
                            functionToTypeMap,
                            argumentToTypeMap
                        ]);
                        console.log(variableToTypeMap);
                        console.log(functionToTypeMap);
                        console.log(argumentToTypeMap);
                        console.log('\n******************************\n');
                    }
                }
            }
        };
    };
