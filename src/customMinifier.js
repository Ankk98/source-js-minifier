/* 
An attempt to develop a custom js minifier.

Functionalities to be developed:
1. Remove whitespaces ---------------------- done
2. Remove comments ------------------------- done
3. Switch to shorthand syntax
4. Resolve constant expressions ------------ done
5. Concatenate/Bundle scripts 
6. Rename identifiers etc 
7. Remove unused variables & dead code
8. if else to terenary --------------------- done
9. assignment operator --------------------- done

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

const fs = require('fs'); //filesystem
const recast = require('recast'); // modifier

const source = fs.readFileSync('./output/combined.js', { encoding: 'utf-8' });

const ast = recast.parse(source, {
    parser: {
        parse(source) {
            return require('acorn').parse(source); // tokenizer & parser
        }
    }
});


const types = recast.types; // Types of nodes 
const builder = types.builders; // Builders to build nodes

recast.visit(ast, {
    visitBinaryExpression(path) {
        let node = path.node;
        if (node.left &&
            node.right &&
            node.left.type === 'Literal' &&
            node.right.type === 'Literal') {
            let expr = 0;

            switch (node.operator) {
                case '+':
                    expr = node.left.value + node.right.value;
                    break;
                case '-':
                    expr = node.left.value - node.right.value;
                    break;
                case '*':
                    expr = node.left.value * node.right.value;
                    break;
                case '**':
                    expr = node.left.value ** node.right.value;
                    break;
                case '/':
                    expr = node.left.value / node.right.value;
                    break;
                case '%':
                    expr = node.left.value % node.right.value;
                    break;
            }
            let newNode = builder.literal(expr);
            path.replace(newNode);
            return false;
        }
        this.traverse(path);
    },
    visitWhileStatement(path) {
        const node = path.node;
        if (node.test.type === 'Literal' &&
            node.test.value === true) {
            let newNode = builder.forStatement(null, null, null, node.body);
            path.replace(newNode);
            this.traverse(path);
        }
        this.traverse(path);
    },
    visitIfStatement(path) {
        const node = path.node;
        if (node.consequent.type === 'ExpressionStatement' &&
            node.alternate.type === 'ExpressionStatement') {
            let newNode = builder.expressionStatement(builder.conditionalExpression(node.test,
                node.consequent.expression, node.alternate.expression));
            path.replace(newNode);
            this.traverse(path);
        }
        this.traverse(path);
    },
    visitExpressionStatement(path) {
        const node = path.node.expression;
        if (node.type === 'AssignmentExpression' &&
            node.operator === '=' &&
            node.left.type === 'Identifier' &&
            node.right.type === 'BinaryExpression' &&
            node.right.right.type === 'Identifier' &&
            node.left.name === node.right.left.name) {
            let operator;
            switch (node.right.operator) {
                case '+':
                    operator = '+=';
                    break;
                case '-':
                    operator = '-=';
                    break;
                case '*':
                    operator = '*=';
                    break;
                case '**':
                    operator = '**=';
                    break;
                case '/':
                    operator = '/=';
                    break;
                case '%':
                    operator = '%=';
                    break;
            }
            node.operator = operator;
            node.right = node.right.right;
            this.traverse(path);
        }
        this.traverse(path);
    }
});

const out = recast.print(ast).code;

fs.writeFile('./output/customOutput.js', out, () => {
    console.log('=> Minified JS content saved at ./output/customOutput.js');
});

// const ast = acorn.parse(source);
// types.namedTypes.Literal.assert(ast.program);
// console.log(types.namedTypes.Literal);
// const astring = require('astring'); //generator
// const walk = require('acorn-walk'); //walker
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

// const namedTypes = types.namedTypes;

// recast.run(function (ast, callback) {
//     recast.visit(ast, {
//         visitBinaryExpression: (path) => {
//             // let node = path.value;
//             // console.log('\n\n');
//             // console.log(path);
//             // if (node.left
//             //     && node.right
//             //     && node.left.type === 'Literal'
//             //     && node.right.type === 'Literal') {
//             //     let expr=0;
//             //     console.log(node);
//             //     if (node.operator === '+') {
//             //         expr = node.left.value + node.right.value;
//             //     }
//             //     newNode = builder.literal(expr);
//             //     path.replace(node.init, newNode);
//             //     this.traverse(path);
//             // }
//             return false;
//         }
//     });
//     callback(ast);
// });
// const output = astring.generate(ast.program, {
//     indent: '',
//     lineEnd: '',
// });
