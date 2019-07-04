const { getType, addTypeAnnotation } = require('./util');
const { promptType, printVariableDecl, printFunctionDecl } = require('./cli');
const { deduceType } = require('./type-deduction');

let functionTypeInsertPoints = [];
let offset = 0;

module.exports = (getMaps, setPoints) =>
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
                    printVariableDecl.bind(this)(node);
                    const type = promptType(
                        node.id.name,
                        variableToTypeMap[node.id.name]
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
                    if (functionToTypeMap[node.id.name][0] == 'any' && ret) {
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

                    // map the argument types
                    // this should come first so the offset is correct
                    node.params.forEach((param, index) => {
                        const type = promptType(
                            param.name,
                            argumentToTypeMap[`${node.id.name}::${param.name}`]
                        );

                        offset += addTypeAnnotation(param, type);
                    });

                    // function return type for later
                    const returnType = promptType(
                        node.id.name,
                        functionToTypeMap[node.id.name]
                    );

                    if (returnType) {
                        functionTypeInsertPoints.push({
                            point: node.body.start + offset - 1,
                            type: returnType
                        });
                    }
                },
                Program: {
                    exit: function() {
                        setPoints(functionTypeInsertPoints);
                    }
                }
            }
        };
    };
