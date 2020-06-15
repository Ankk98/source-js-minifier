/* 
An attempt to develop a custom js minifier.

Functionalities to be developed:
1. Remove whitespaces
2. Remove comments
3. Switch to shorthand syntax
4. Resolve constant expressions
5. Combine scripts 
6. Rename identifiers etc 
7. Remove unused variables & dead code

Steps req:
1. Parsing js code in AST
2. AST tree traversal using recursion
3. For each node perform modifications using Visitor Pattern
4. Code generation

For more info: https://youtu.be/C06MohLG_3s 

Visitor Pattern: provides ability to add new operations to existing object structures without 
    modifying the structures.
*/

const acorn = require('acorn');
const walk = require('acorn-walk');
const fs = require('fs');
const astring = require('astring');

const source = fs.readFileSync('./output/combined.js', { encoding: 'utf-8' });

const ast = acorn.parse(source);
let state = {};
let base = {};
walk.simple(ast, {
    VariableDeclaration(node) {
        console.log(node);
    }
});

const output = astring.generate(ast);

fs.writeFile('./output/customOutput.js', output, () => {
    console.log(output);
});
