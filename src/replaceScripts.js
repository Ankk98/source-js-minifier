"use strict";
const utils = require('parse5-utils');
const download = require("./downloadContent");
const { isRelativePath } = require('./isRelativePath');
const { validateURL } = require('./validateURL');
const { fixRelativeURL } = require('./fixRelativeURL');
const UglifyJS = require("uglify-js");
const { customMinifier } = require("./customMinifier");

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

async function replaceScriptsWithMinScripts(source, url, useCustomMinifier) {
    console.log('Replacing all the scripts present in the webpage & from the src links of scripts...');

    source = await fixAssetLinks(source, url);

    // Replace scripts with min scripts

    // parse into ast
    const ast = utils.parse(source);

    // traverse ast 
    walk(ast, async (node) => {
        if (node.nodeName === 'script') {

            if (node.childNodes != []) {
                for (let index = 0; index < node.childNodes.length; index++) {
                    const element = node.childNodes[index];
                    if (element &&
                        element['nodeName'] === '#text' &&
                        element['value']) {

                        console.log('Replacing a Script....');

                        // minify
                        let minifiedScript;
                        try {
                            if (useCustomMinifier) {
                                minifiedScript = await customMinifier(element['value']);
                            } else {
                                let result = UglifyJS.minify(element['value']);
                                if (result.error) {
                                    throw new Error(result.error);
                                }
                                minifiedScript = result['code'];
                            }
                        } catch (error) {
                            console.log(error);
                        }

                        // replace
                        // node.childNodes[0]['value'] = minifiedScript;
                        utils.setText(node, minifiedScript);

                    }
                }
            }
            else if (node.attrs && node.attrs[0]) {
                //For all attributes find src
                console.log('Extracting URL of a script....');
                let script;
                let minifiedScript;
                let currUrl;
                for (let index = 0; index < node.attrs.length; index++) {
                    // Get url
                    const attribute = node.attrs[index];
                    if (attribute['name'] === 'src' &&
                        attribute['value']) {
                        currUrl = fixRelativeURL(attribute['value']);
                        break;
                    }
                }

                if (!currUrl) {
                    return;
                }

                // download
                try {
                    currUrl = fixRelativeURL(currUrl);
                    script = await download(currUrl);
                } catch (error) {
                    console.log(error);
                    return;
                }

                //minify
                console.log('Minifying script ....');
                try {
                    if (useCustomMinifier) {
                        minifiedScript = await customMinifier(script);
                    } else {
                        let result = UglifyJS.minify(script);
                        if (result.error) {
                            throw new Error(result.error);
                        }
                        minifiedScript = result['code'];
                    }
                } catch (error) {
                    console.log(error);
                }

                // replace
                console.log('Replacing script...');
                node.attrs = [];
                node.childNodes.push(utils.createTextNode(minifiedScript));
                // utils.remove(node);
            }
        }

    });

    //Generate code from ast & return
    let resultantPage = utils.serialize(ast);

    return resultantPage;
}

module.exports.replaceScriptsWithMinScripts = replaceScriptsWithMinScripts;




