"use strict";
const utils = require('parse5-utils');
const download = require("./downloadContent");
const { isRelativePath } = require('./isRelativePath');
const { validateURL } = require('./validateURL');
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

    // console.log(source);
    //Fix asset links
    source = await fixAssetLinks(source, url);

    //Extract Scripts
    let arr = await extractScripts(source);
    let html = arr[0];
    let concatenatedScripts = arr[1];
    // console.log(concatenatedScripts);

    // Minify
    let minifiedScripts;
    try {
        if (useCustomMinifier) {
            minifiedScripts = await customMinifier(concatenatedScripts);
        } else {
            let result = UglifyJS.minify(concatenatedScripts);
            // console.log(result.error);
            if (result.error) {
                throw new Error(result.error);
            }
            minifiedScripts = result['code'];
        }
    } catch (error) {
        console.log(error);
    }


    // Convert into ast
    const ast = utils.parse(html);

    // console.log(minifiedScripts);
    //Attach Minified Script
    // Add <script></script> to the end of body
    walk(ast, (node) => {
        if (node.nodeName === 'body') {
            let newNode = utils.createNode('script');
            newNode.childNodes.push(utils.createTextNode(minifiedScripts));
            // console.log(newNode);
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
    // console.log(source);
    const ast = utils.parse(source);

    // console.log(ast);

    walk(ast, (node) => {
        if (node.nodeName === 'script') {

            if (node.childNodes != []) {
                for (let index = 0; index < node.childNodes.length; index++) {
                    const element = node.childNodes[index];
                    if (element &&
                        element['nodeName'] === '#text' &&
                        element['value']) {
                        // Extract scripts
                        console.log('Extracting a Script....');
                        concatenatedScripts = concatenatedScripts.concat(element['value']);
                        concatenatedScripts = concatenatedScripts.concat('  \n');
                    }
                }
                utils.remove(node);
            }
            if (node.attrs && node.attrs.length > 0) {
                //For all attributes find src
                console.log('Checking script tags....');
                for (let index = 0; index < node.attrs.length; index++) {
                    // Get urls
                    const attribute = node.attrs[index];
                    if (attribute['name'] === 'src' &&
                        attribute['value']) {
                        console.log('Extracting a script URL....');
                        let currUrl = fixRelativeURL(attribute['value']);
                        urls.push(currUrl);
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
            concatenatedScripts = concatenatedScripts.concat(await download(url));
            concatenatedScripts = concatenatedScripts.concat('   \n');
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    // console.log(ast);
    // console.log(concatenatedScripts);
    const html = utils.serialize(ast);
    // console.log(html);


    return [html, concatenatedScripts];
}

module.exports.extractScripts = extractScripts;
module.exports.concatenateScripts = concatenateScripts;


















// const walk = require('./htmlASTTraverser');
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