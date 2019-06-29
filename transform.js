const { getType, addTypeAnnotation } = require('./util');

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
                    if (ret.argument.type == 'Identifier') {
                        // TODO: cleanup this block of code
                        if (variableToTypeMap[ret.argument.name]) {
                            functionToTypeMap[node.id.name] =
                                variableToTypeMap[ret.argument.name];
                        }
                        // we want this to override variables
                        if (
                            argumentToTypeMap[
                                `${node.id.name}::${ret.argument.name}`
                            ]
                        ) {
                            functionToTypeMap[node.id.name] =
                                argumentToTypeMap[
                                    `${node.id.name}::${ret.argument.name}`
                                ];
                        }
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
