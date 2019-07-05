const { getType, addTypeAnnotation, getAnnotation } = require('./util');
const { promptType, printVariableDecl, printFunctionDecl } = require('./cli');
const { deduceType } = require('./type-deduction');

let offset = 0;

module.exports = (isInteractive, getMaps, addInsertPoint) =>
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
                    // right now we arent doing closures
                    if (
                        node.init &&
                        node.init.type === 'ArrowFunctionExpression'
                    )
                        return;
                    // can't handle destructing props yet
                    if (node.id.type === 'ObjectPattern') return;

                    printVariableDecl.bind(this)(node);

                    const deduced = getAnnotation(
                        variableToTypeMap[node.id.name]
                    );
                    const type = promptType(
                        isInteractive,
                        node.id.name,
                        deduced,
                        () => null // templates shouldn't work for variable declarations
                    );
                    offset += addTypeAnnotation(node.id, type);
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
                            functionToTypeMap[node.id.name][0] == 'any') &&
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
                            node.id
                        );
                    }

                    // this needs to be declared before parameters are added
                    // ...otherwise offset will be wrong
                    const templateOffset = new Number(node.id.end + offset);
                    const addTmpl = tmpl =>
                        addInsertPoint(templateOffset, tmpl);

                    // map the argument types
                    // this should come first so the offset is correct
                    node.params.forEach((param, index) => {
                        const deduced = getAnnotation(
                            argumentToTypeMap[`${node.id.name}::${param.name}`]
                        );
                        const type = promptType(
                            isInteractive,
                            param.name,
                            deduced,
                            addTmpl
                        );
                        offset += addTypeAnnotation(param, type);
                    });

                    // function return type for later
                    const deducedReturnAnnotation = functionToTypeMap[
                        node.id.name
                    ]
                        ? getAnnotation(functionToTypeMap[node.id.name])
                        : 'void';
                    const returnType = promptType(
                        isInteractive,
                        node.id.name,
                        deducedReturnAnnotation,
                        addTmpl
                    );

                    if (returnType) {
                        addInsertPoint(
                            node.body.start + offset - 1,
                            `:${returnType}`
                        );
                    }
                }
            }
        };
    };
