/* 
An attempt to develop a custom js minifier.

Functionalities to be developed:
1. Remove whitespaces ---------------------- done
2. Remove comments ------------------------- done
3. Switch to shorthand syntax
4. Resolve constant expressions
5. Concatenate/Bundle scripts 
6. Rename identifiers etc 
7. Remove unused variables & dead code

Steps req:
1. Parsing js code in AST
2. AST tree traversal using recursion
3. For each node perform modifications using Visitor Pattern
4. Code generation

For exploring AST: https://astexplorer.net/ 
For more info on using AST: https://youtu.be/C06MohLG_3s 

Visitor Pattern: provides ability to add new operations to existing object structures without 
    modifying the structures.
*/

const walk = require('acorn-walk'); //walker
const fs = require('fs'); //filesystem
const astring = require('astring'); //generator
const recast = require('recast'); // modifier

const source = fs.readFileSync('./output/combined.js', { encoding: 'utf-8' });

// const ast = acorn.parse(source);
const ast = recast.parse(source, {
    parser: {
        parse(source) {
            return require('acorn').parse(source);
        }
    }
});

const types = recast.types;
// types.namedTypes.Literal.assert(ast.program);
// console.log(types.namedTypes.Literal);

// walk.simple(ast.program, {
//     BinaryExpression(node) {
//         if (node.left
//             && node.right
//             && node.left.type === 'Literal'
//             && node.right.type === 'Literal') {
//             let expr;
//             if (node.operator === '+') {
//                 expr = node.left.value + node.right.value;
//             }
//             let builder = types.builders;
//             super.node = builder.literal(expr);
//             // console.log(this.node);
//             return node;
//         }
//     }
// });

const builder = types.builders;
const namedTypes = types.namedTypes;

recast.run(function (ast, callback) {
    recast.visit(ast, {
        visitBinaryExpression: (path) => {
            // let node = path.value;
            // console.log('\n\n');
            console.log(path);
            // if (node.left
            //     && node.right
            //     && node.left.type === 'Literal'
            //     && node.right.type === 'Literal') {
            //     let expr=0;
            //     console.log(node);
            //     if (node.operator === '+') {
            //         expr = node.left.value + node.right.value;
            //     }
            //     newNode = builder.literal(expr);
            //     path.replace(node.init, newNode);
            //     this.traverse(path);
            // }
            return false;
        },
    });
    callback(ast);
});

const out = recast.print(ast).code;
// const output = astring.generate(ast.program, {
//     indent: '',
//     lineEnd: '',
// });

fs.writeFile('./output/customOutput.js', out, () => {
    console.log('=> Minified JS content saved at ./output/customOutput.js');
});
