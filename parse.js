const { getType } = require('./util');
const { deduceType } = require('./type-deduction');

let variableToTypeMap = new Object();
let functionToTypeMap = new Object();
let argumentToTypeMap = new Object();
let functionToArgsMap = new Object();

module.exports = setMaps =>
    function(babel) {
        const t = babel.types;

        return {
            visitor: {
                VariableDeclarator: function({ node }) {
                    if (!node.init) return; // we will have to infer this later
                    // handling closures: don't
                    if (node.init.type === 'ArrowFunctionExpression') return;
                    // can't handle destructing props yet
                    if (node.id.type === 'ObjectPattern') return;

                    const deduced = deduceType(
                            node.init,
                            [
                                variableToTypeMap,
                                functionToTypeMap,
                                argumentToTypeMap
                            ],
                            null,
                            t
                        );
                    variableToTypeMap[node.id.name] = deduced;
                },
                AssignmentExpression: function({ node }) {
                    const deduced = deduceType(
                        node.right,
                        [
                            variableToTypeMap,
                            functionToTypeMap,
                            argumentToTypeMap
                        ],
                        null,
                        t
                    );
                    if (!deduced) return;

                    if (variableToTypeMap[node.left.name] instanceof Array) {
                        deduced.forEach(dType => variableToTypeMap[node.left.name].push(dType));
                    } else {
                        variableToTypeMap[node.left.name] = deduced;
                    }
                },
                FunctionDeclaration: function({ node }) {
                    const ret = node.body.body.find(
                        x => x.type === 'ReturnStatement'
                    );
                    if (!ret) return; // // TODO: arguments are []

                    functionToTypeMap[node.id.name] = [
                        getType(ret.argument, t)
                    ];
                    functionToArgsMap[node.id.name] = node.params.map(
                        x => x.name
                    );
                },
                CallExpression: function({ node }) {
                    // functions may not exist because they were declared as variables
                    // ...or some other reason. In that case, we want to exit early
                    if (!functionToArgsMap[node.callee.name]) return;

                    if (
                        argumentToTypeMap[
                            `${node.callee.name}::${
                                functionToArgsMap[node.callee.name][0]
                            }`
                        ] instanceof Array
                    ) {
                        node.arguments.forEach((arg, index) => {
                            argumentToTypeMap[
                                `${node.callee.name}::${
                                    functionToArgsMap[node.callee.name][index]
                                }`
                            ].push(getType(arg, t));
                        });
                    } else {
                        node.arguments.forEach((arg, index) => {
                            argumentToTypeMap[
                                `${node.callee.name}::${
                                    functionToArgsMap[node.callee.name][index]
                                }`
                            ] = [getType(arg, t)];
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
                        if (/*VERBOSE*/ false) {
                            console.log(variableToTypeMap);
                            console.log(functionToTypeMap);
                            console.log(argumentToTypeMap);
                            console.log('\n******************************\n');
                        }
                    }
                }
            }
        };
    };
