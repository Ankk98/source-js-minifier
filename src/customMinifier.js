/* 
An attempt to develop a custom js minifier.

Functionalities to be developed:
1. Remove whitespaces ---------------------- done
2. Remove comments ------------------------- done
3. Switch to shorthand syntax -------------- done
4. Resolve constant expressions ------------ done
5. Concatenate/Bundle scripts -------------- done 
6. Rename identifiers etc TODO:
7. Remove unused variables & dead code TODO:
8. if else to terenary --------------------- done
9. assignment operator --------------------- done

Steps req:
1. Parsing js code in AST
2. AST tree traversal using recursion
3. For each node perform modifications using Visitor Pattern
4. Code re-generation

For exploring AST: https://astexplorer.net/ 
For more info on using AST: https://youtu.be/C06MohLG_3s 

Visitor Pattern: provides ability to add new operations to existing object structures without 
    modifying the structures.
*/

const fs = require('fs'); // filesystem
const recast = require('recast'); // ast modifier/transformer
const astring = require('astring'); //generator

async function customMinifier(source) {

    console.log('Using Custom JS Minifier!');

    const ast = recast.parse(source); // uses esprima for tokenization & parsing


    const types = recast.types; // Types of nodes 
    const builder = types.builders; // Builders to build nodes

    // Recurse through AST & perform operations in visitor pattern
    recast.visit(ast, {
        visitBinaryExpression(path) {
            // Resolve constant binary operations
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
            // Convert while loop to for loop
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
            //Convert ifelse to terenary operator 
            const node = path.node;
            if (node.consequent &&
                node.alternate &&
                node.consequent.type === 'ExpressionStatement' &&
                node.alternate.type === 'ExpressionStatement') {
                let newNode = builder.expressionStatement(builder.conditionalExpression(node.test,
                    node.consequent.expression, node.alternate.expression));
                path.replace(newNode);
                this.traverse(path);
            }
            this.traverse(path);
        },
        visitExpressionStatement(path) {
            //Convert to shorthand assignment operator
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

    // For removing whitespaces
    const newAST = require('esprima').parseScript(out);
    const output = astring.generate(newAST, {
        indent: '',
        lineEnd: '',
    });

    return output;
}

module.exports.customMinifier = customMinifier;