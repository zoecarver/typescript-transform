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
                    node.params.forEach((param, index) => {
                        offset += addTypeAnnotation(
                            param,
                            argumentToTypeMap[node.id.name][index]
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
