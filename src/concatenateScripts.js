"use strict";
const utils = require('parse5-utils');
const download = require("./downloadContent");
const { isRelativePath } = require('./isRelativePath');
const { validateURL } = require('./validateURL');
const { fixRelativeURL } = require('./fixRelativeURL');
const { customMinifier } = require('./customMinifier');
const Terser = require('terser');
const { minifyCSS } = require('./minifyCSS');

// For DFS traversal of HTML AST
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

// Traverse through all asset links and fix them if required
async function fixAssetLinks(source, url) {

    const ast = utils.parse(source);

    walk(ast, (node) => {
        if ((node.tagName === 'link' ||
            node.tagName === 'a' ||
            node.tagName === 'img' ||
            node.tagName === 'form') &&
            node.attrs) {
            for (let index = 0; index < node.attrs.length; index++) {
                const attribute = node.attrs[index];
                if (attribute && attribute.value) {
                    if (attribute.name === 'href' ||
                        attribute.name === 'src' ||
                        attribute.name === 'action') {
                        if (!isRelativePath(attribute.value) && !validateURL(attribute.value)) {
                            console.log(`Adding domain to url: ${attribute.value}`);
                            attribute.value = url + attribute.value;
                            utils.setAttribute(node, attribute.name, attribute.value);
                        }
                        else if (isRelativePath(attribute.value) === true) {
                            console.log(`Adding https to url: ${attribute.value}`);
                            attribute.value = 'https:' + attribute.value;
                            utils.setAttribute(node, attribute.name, attribute.value);
                        }
                    }
                }
            }
        }
    });

    return utils.serialize(ast);
}

//To extract, concat, minify & attach scripts
async function concatenateScripts(source, url, useCustomMinifier) {

    //Fix asset links
    source = await fixAssetLinks(source, url);

    // Minify CSS
    source = await minifyCSS(source);

    //Extract Scripts
    let arr = await extractScripts(source);
    let html = arr[0];
    let concatenatedScripts = arr[1];

    // Minify JS
    let minifiedScripts = '';
    try {
        console.log('Minifying & concatenating scripts....');
        if (useCustomMinifier) {
            for (const key in concatenatedScripts) {
                if (concatenatedScripts.hasOwnProperty(key)) {
                    const text = concatenatedScripts[key];
                    minifiedScripts = minifiedScripts.concat(await customMinifier(text));
                    minifiedScripts = minifiedScripts.concat('  \n');
                }
            }
        } else {
            let result = Terser.minify(concatenatedScripts);
            if (result.error) {
                throw new Error(result.error);
            }
            minifiedScripts = result['code'];
        }
    } catch (error) {
        console.log(error);
        return;
    }

    // Convert into ast
    const ast = utils.parse(html);

    // Attach Minified Script
    // Add <script></script> to the end of body
    walk(ast, (node) => {
        if (node.nodeName === 'body') {
            let newNode = utils.createNode('script');
            newNode.childNodes.push(utils.createTextNode(minifiedScripts));
            node.childNodes.push(newNode);
            return false;
        }
    });

    // Convert to string of html
    let resultantPage = utils.serialize(ast);
    return resultantPage;
}


// Will extract all scripts & returns [htmlWithoutScripts, {name: concatenatedScripts}] 
async function extractScripts(source) {

    // walk to extract all the scripts
    let concatenatedScripts = {};
    let count = 1;
    let urls = [];
    const ast = utils.parse(source);

    // DFS traversal
    walk(ast, async (node) => {
        if (node.nodeName === 'script') {
            let currType = 'application/javascript';
            for (let index = 0; index < node.attrs.length; index++) {
                const attribute = node.attrs[index];
                if (attribute.name === 'type') {
                    currType = attribute.value;
                    break;
                }
            }
            if (currType === 'application/javascript') {
                if (node.childNodes != []) {
                    for (let index = 0; index < node.childNodes.length; index++) {
                        const element = node.childNodes[index];
                        if (element &&
                            element['nodeName'] === '#text' &&
                            element['value']) {
                            // Extract scripts
                            console.log('Extracting a Script....');
                            let name = `${count}.js`;
                            concatenatedScripts[name] = element['value'];
                            count++;
                        }
                    }
                    utils.remove(node);
                }
                else if (node.attrs && node.attrs.length > 0) {
                    // For all attributes find src
                    console.log('Checking script tags....');

                    let currUrl;
                    for (let index = 0; index < node.attrs.length; index++) {
                        // Get urls
                        const attribute = node.attrs[index];
                        if (attribute['name'] === 'src' &&
                            attribute['value']) {
                            console.log('Extracting a script URL....');
                            currUrl = fixRelativeURL(attribute['value']);
                            break;
                        }
                    }
                    if (!currUrl) {
                        return;
                    }

                    try {
                        currUrl = fixRelativeURL(currUrl);
                        let name = `${count}.js`;
                        concatenatedScripts[name] = await download(currUrl);
                        count++;
                    } catch (error) {
                        console.log(error);
                        return;
                    }

                    utils.remove(node);
                }
            }
        }

    });

    const html = utils.serialize(ast);
    return [html, concatenatedScripts];
}

module.exports.extractScripts = extractScripts;
module.exports.concatenateScripts = concatenateScripts;