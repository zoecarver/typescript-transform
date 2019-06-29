const { getType, addTypeAnnotation } = require('./util');

module.exports = getMaps =>
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
                    addTypeAnnotation(node.id, variableToTypeMap[node.id.name]);
                },
                FunctionDeclaration: function({ node }) {
                    node.params.forEach((param, index) => {
                        addTypeAnnotation(
                            param,
                            argumentToTypeMap[node.id.name][index]
                        );
                    });
                }
            }
        };
    };
