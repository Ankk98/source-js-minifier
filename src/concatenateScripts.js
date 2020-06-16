"use strict";
const utils = require('parse5-utils');
const download = require("./downloadContent");
const { isRelativePath } = require('./isRelativePath');
const { validateURL } = require('./validateURL');
// const walk = require('./htmlASTTraverser');
const { fixRelativeURL } = require('./fixRelativeURL');
const { customMinifier } = require('./customMinifier');
const UglifyJS = require('uglify-js');

// To DFS traversal of HTML AST
function walk(node, callback) {
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

// Traverse through all asset links and fix them if needed
async function fixAssetLinks(source, url) {

    const ast = utils.parse(source);

    walk(ast, (node) => {
        if ((node.tagName === 'link' ||
            node.tagName === 'a' ||
            node.tagName === 'img' ||
            node.tagName === 'form') &&
            node.attrs) {
            // console.log(node);
            for (let index = 0; index < node.attrs.length; index++) {
                const attribute = node.attrs[index];
                if (attribute && attribute.value) {
                    if (attribute.name === 'href' ||
                        attribute.name === 'src' ||
                        attribute.name === 'action') {
                        if (!isRelativePath(attribute.value) && !validateURL(attribute.value)) {
                            attribute.value = url + attribute.value;
                            utils.setAttribute(node, attribute.name, attribute.value);
                        }
                        else if (isRelativePath(attribute.value) === true) {
                            attribute.value = 'https:' + attribute.value;
                            utils.setAttribute(node, attribute.name, attribute.value);
                        }
                        // console.log(attribute);
                    }
                }
            }
            // console.log(node.attrs);
        }
    });

    return utils.serialize(ast);
}

//To extract, concat, minify & attach scripts
async function concatenateScripts(source, url, useCustomMinifier) {

    //Fix asset links
    source = await fixAssetLinks(source, url);

    //Extract Scripts
    let arr = await extractScripts(source);
    let html = arr[0];
    let concatenatedScripts = arr[1];
    console.log(concatenatedScripts);

    // Minify
    let minifiedScripts;
    try {
        if (useCustomMinifier) {
            minifiedScripts = await customMinifier(concatenatedScripts);
        } else {
            minifiedScripts = UglifyJS.minify(concatenatedScripts)['code'];
        }
    } catch (error) {
        console.log(error);
    }


    // Convert into ast
    const ast = utils.parse(html);

    console.log(minifiedScripts);
    //Attach Minified Script
    // Add <script></script> to the end of body
    walk(ast, (node) => {
        if (node.nodeName === 'body') {
            let newNode = utils.createNode('script');
            newNode.childNodes.push(utils.createTextNode(minifiedScripts));
            console.log(newNode);
            node.childNodes.push(newNode);
            return false;
        }
    });

    // Convert to string of html
    let resultantPage = utils.serialize(ast);

    return resultantPage;
}


// Will extract all scripts & returns [htmlWithoutScripts, concatenatedScripts] 
async function extractScripts(source) {

    // walk to extract all the scripts
    let concatenatedScripts = '';
    let urls = [];
    console.log(source);
    const ast = utils.parse(source);

    console.log(ast);

    walk(ast, (node) => {
        if (node.nodeName === 'script') {

            if (node.childNodes != [] &&
                node.childNodes[0] != null &&
                node.childNodes[0]['value'] != null &&
                node.childNodes[0]['value'] != '') {
                // Extract scripts
                console.log('Extracting a Script....');
                concatenatedScripts += node.childNodes[0]['value'];
                concatenatedScripts += '\n';
                utils.remove(node);
            }
            else if (node.attrs && node.attrs[0]) {
                //For all attributes find src
                // console.log(node.attrs);
                for (let index = 0; index < node.attrs.length; index++) {
                    // Get urls
                    const attribute = node.attrs[index];
                    if (attribute['name'] === 'src') {
                        url = fixRelativeURL(attribute['value']);
                        urls.push(attribute['value']);
                    }
                }
                utils.remove(node);
            }
        }

    });

    // console.log(urls);
    // Download all scripts
    for (let url of urls) {
        // const url = urls[index];
        try {
            url = fixRelativeURL(url);
            concatenatedScripts += await download(url);
            concatenatedScripts += '\n';
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    const html = utils.serialize(ast);
    // console.log(html);
    // console.log(concatenatedScripts);

    return [html, concatenatedScripts];
}

module.exports.extractScripts = extractScripts;
module.exports.concatenateScripts = concatenateScripts;



















                        // if (isRelativePath(attribute['value']) === true) {
                        //     attribute['value'] = 'https:' + attribute['value'];
                        // }
                        // if (!validateURL(attribute['value'])) {
                        //     throw new Error(`Invalid URL`);
                        // }
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
// console.log(attribute['value']);
            // scripts[`${count}.js`] = await download(url);
            // count++;
            // scripts[`${count}.js`] = node.childNodes[0]['value'];
            // count++;
    // let count = 0;