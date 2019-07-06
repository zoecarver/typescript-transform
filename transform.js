const { getType, addTypeAnnotation } = require('./util');
const { promptType, printVariableDecl, printFunctionDecl } = require('./cli');
const { deduceType } = require('./type-deduction');

module.exports = (isInteractive, getMaps) =>
    function(babel) {
        const [
            variableToTypeMap,
            functionToTypeMap,
            argumentToTypeMap
        ] = getMaps();
        const t = babel.types;

        return {
            visitor: {
                VariableDeclarator: function({ node }) {
                    // TODO: try harder with the deduction
                    // right now we arent doing closures
                    if (
                        node.init &&
                        node.init.type === 'ArrowFunctionExpression'
                    )
                        return;
                    // can't handle destructing props yet
                    if (node.id.type === 'ObjectPattern') return;

                    printVariableDecl.bind(this)(node);

                    const deduced = variableToTypeMap[node.id.name];
                    const type = promptType(
                        isInteractive,
                        node.id.name,
                        node,
                        deduced && t.tsUnionType(deduced),
                        t
                    );
                    addTypeAnnotation(node.id, type, t);
                },
                FunctionDeclaration: function({ node }) {
                    // if we return an identifier, we might already know what type it is
                    const ret = node.body.body.find(
                        x => x.type === 'ReturnStatement'
                    );

                    if (!ret && node.params.length === 0) return;
                    printFunctionDecl.bind(this)(node);

                    // finding the return value of the function
                    // only one array element may be present in the map
                    if (
                        (!functionToTypeMap[node.id.name] ||
                            functionToTypeMap[node.id.name][0].type == 'TSAnyKeyword') &&
                        ret
                    ) {
                        // let's see if we can get more specific
                        functionToTypeMap[node.id.name] = deduceType(
                            ret.argument,
                            [
                                variableToTypeMap,
                                functionToTypeMap,
                                argumentToTypeMap
                            ],
                            node.id,
                            t
                        );
                    }

                    // map the argument types
                    // this should come first so the offset is correct
                    node.params.forEach((param, index) => {
                        const deduced = t.tsUnionType(
                            argumentToTypeMap[`${node.id.name}::${param.name}`] || []
                        );
                        const type = promptType(
                            isInteractive,
                            param.name,
                            node, // the node to apply the template to
                            deduced,
                            t
                        );
                        // because this is a union we check types
                        if (type.types.length) addTypeAnnotation(param, type, t);
                    });

                    // function return type for later
                    const deducedReturnAnnotation = functionToTypeMap[node.id.name]
                        || [t.tsVoidKeyword()];
                    const returnType = promptType(
                        isInteractive,
                        node.id.name,
                        node,
                        deducedReturnAnnotation && t.tsUnionType(deducedReturnAnnotation),
                        t
                    );
                    // because this is a union we check types
                    if (returnType.types.length) addTypeAnnotation(node, returnType, t);
                }
            }
        };
    };
