"use strict";
const utils = require('parse5-utils');
const download = require("./downloadContent");
const isRelativePath = require('./isRelativePath');
const validateURL = require('./validateURL');

// To traverse HTML AST
async function walk(node, callback) {
    if (callback(node) === false) {
        return false;
    }
    else {
        let childNode, i;

        if (node.childNodes !== undefined) {
            i = 0;
            childNode = node.childNodes[i];
        }

        while (childNode !== undefined) {
            if (walk(childNode, callback) === false) {
                return false;
            }
            else {
                childNode = node.childNodes[++i];
            }
        }
    }
};

// Will extract all scripts & returns [htmlWithoutScripts, concatenatedScripts] 
async function extractScripts() {

    // walk to extract all the scripts
    let concatenatedScripts = '';
    let urls = [];
    // let count = 0;
    const ast = utils.parse('<!DOCTYPE html><html><head></head><body>Hi there!<p>hello<script src="https://www.google.com/"></script><b>mann</b></p><script>aveaveaw</script>bye</body></html>');

    await walk(ast, async (node) => {
        if (node.nodeName === 'script') {
            // count++;
            if (node.childNodes != [] && node.childNodes[0] != null && node.childNodes[0]['value'] != null && node.childNodes[0]['value'] != '') {
                // Extract scripts
                console.log('Extracting a Script....');
                // scripts[`${count}.js`] = node.childNodes[0]['value'];
                concatenatedScripts += node.childNodes[0]['value'];
                concatenatedScripts += '\n';
            }
            else if (node.attrs && node.attrs[0] != null) {
                //For all attributes find src
                for (let index = 0; index < node.attrs.length; index++) {
                    // Get urls
                    const attribute = node.attrs[index];
                    if (attribute['name'] === 'src') {
                        if (isRelativePath(attribute['value']) === true) {
                            attribute['value'] = 'https:' + attribute['value'];
                        }
                        if (!validateURL(attribute['value'])) {
                            throw new Error(`Invalid URL`);
                        }
                        urls.push(attribute['value']);
                    }
                }
            }
            utils.remove(node);
        }

    });

    // Download all scripts
    for (let index = 0; index < urls.length; index++) {
        // count++;
        const url = urls[index];
        try {
            // console.log(attribute['value']);
            // scripts[`${count}.js`] = await download(url);
            concatenatedScripts += await download(url);
            concatenatedScripts += '\n';
        } catch (error) {
            throw error;
        }
    }

    const html = utils.serialize(ast);
    console.log(html);
    console.log(concatenatedScripts);

    return [html, concatenatedScripts];
}

// async function abc() {
//     await extractScripts();
// }
// abc();


module.exports.extractScripts = extractScripts;

// console.log(html);

// console.log(ast.childNodes);
// const parse5 = require('parse5');
// console.log(utils.)
// function visit(ast, callback) {
//     function _visit(node, parent, key, index) {
//         if (callback(node) === false) {
//             return false;
//         }
//         callback(ast, parent, key, index);
//         const keys = Object.keys(ast);
//         for (let i = 0; i < keys.length; i++) {
//             if (ast.childNodes) {
//                 const child = ast.childNonode;
//                 if (Array.isArray(child)) {
//                     for (let j = 0; j < child.length; j++) {
//                         _visit(child[j], node, key, j);
//                     }
//                 } else if (isNode(child)) {
//                     _visit(child, node, key);
//                 }
//             }
//         }
//     }
//     _visit(ast, null);
// }

// function isNode(node) {
//     // probably need more check,
//     // for example,
//     // if the node contains certain properties
//     return typeof node === 'object';
// }


// visit(ast, (node) => {
//     console.log(node);
// });
