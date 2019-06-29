const { getType } = require('./util');

let variableToTypeMap = new Object();
let functionToTypeMap = new Object();
let argumentToTypeMap = new Object();

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
                    functionToTypeMap[node.id.name] = getType(ret.argument);
                },
                CallExpression: function({ node }) {
                    if (argumentToTypeMap[node.callee.name] instanceof Array) {
                        argumentToTypeMap[node.callee.name].forEach(
                            (param, index) =>
                                param.push(getType(node.arguments[index]))
                        );
                    } else {
                        argumentToTypeMap[
                            node.callee.name
                        ] = node.arguments.map(x => [getType(x)]);
                    }
                },
                SpreadElement: function() {
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
        };
    };
