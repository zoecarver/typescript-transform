const { getType, addTypeAnnotation } = require('./util');
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
                    offset += addTypeAnnotation(
                        node.id,
                        variableToTypeMap[node.id.name]
                    );
                },
                FunctionDeclaration: function({ node }) {
                    // if we return an identifier, we might already know what type it is
                    const ret = node.body.body.find(
                        x => x.type === 'ReturnStatement'
                    );
                    if (!ret) return;

                    // only one array element may be present in the map
                    if (functionToTypeMap[node.id.name][0] == 'any') {
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

                    node.params.forEach((param, index) => {
                        offset += addTypeAnnotation(
                            param,
                            argumentToTypeMap[`${node.id.name}::${param.name}`]
                        );
                    });
                    functionTypeInsertPoints.push({
                        point: node.body.start + offset - 1,
                        type: functionToTypeMap[node.id.name]
                    });
                },
                Program: {
                    exit: function() {
                        setPoints(functionTypeInsertPoints);
                    }
                }
            }
        };
    };
