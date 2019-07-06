const babel = require('@babel/core');

let typeArgs = [];

const plug = function(babel) {
    const t = babel.types;

    return {
        visitor: {
            FunctionDeclaration: function({ node }) {
                typeArgs = node.typeParameters;
            }
        }
    }
}

module.exports = function(templateSnippet) {
    babel.transform(`function fn${templateSnippet}(){}`, {
        presets: ["@babel/preset-typescript"],
        plugins: [plug],
        filename: '_.ts' // lovely hack
    });

    return typeArgs;
}
