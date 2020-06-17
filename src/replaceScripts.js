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






// const utils = require('parse5-utils');
// const jssoup = require("jssoup").default;
// const walk = require('./htmlASTTraverser');
// const jssoup = require("jssoup").default;
// const uglify = require("uglify-js");
// const { customMinifier } = require("./customMinifier");

// async function replaceScriptsWithMinScripts(source, url, useCustomMinifier) {
//     console.log('Replacing all the scripts present in the webpage & from the src links of scripts...');

//     let soup = new jssoup(source);

//     let des = soup.descendants;

//     let scripts = {};
//     let count = 0;

//     for (let i = 0; i < des.length; ++i) {
//         if (des[i].constructor.name === 'SoupTag') {
//             if (des[i].name === 'script') {
//                 count++;
//                 if (des[i].contents != [] && des[i].contents[0] != null && des[i].contents[0]['_text'] != null && des[i].contents[0]['_text'] != '') {
//                     console.log('Minifying and replacing a script...');
//                     scripts[count + '.js'] = des[i].contents[0]['_text'];
//                     let text;
//                     if (useCustomMinifier) {
//                         text = customMinifier(des[i].contents[0]['_text']);
//                     } else {
//                         text = uglify.minify(des[i].contents[0]['_text'])['code'];
//                     }
//                     if (text) {
//                         des[i].contents[0]['_text'] = text;
//                     } else {
//                         des[i].contents[0]['_text'] = '';
//                     }
//                 }
//                 else if (des[i].attrs && des[i].attrs.src != null) {
//                     if (isRelativePath(des[i].attrs.src) === true) {
//                         des[i].attrs.src = 'https:' + des[i].attrs.src;
//                     }
//                     //TODO: download scripts and add SoupString with minified text
//                 }
//             }
//             else if (des[i].name === 'link' || des[i].name === 'a') {
//                 if (des[i].attrs && des[i].attrs.href) {
//                     if (!isRelativePath(des[i].attrs.href) && !validateURL(des[i].attrs.href)) {
//                         des[i].attrs.href = url + des[i].attrs.href;
//                     }
//                     else if (isRelativePath(des[i].attrs.href) === true) {
//                         des[i].attrs.href = 'https:' + des[i].attrs.href;
//                     }
//                 }
//             }
//             else if (des[i].name === 'img') {
//                 if (des[i].attrs && des[i].attrs.src) {
//                     if (!isRelativePath(des[i].attrs.src) && !validateURL(des[i].attrs.src)) {
//                         des[i].attrs.src = url + des[i].attrs.src;
//                     }
//                     else if (isRelativePath(des[i].attrs.src) === true) {
//                         des[i].attrs.src = 'https:' + des[i].attrs.src;
//                     }
//                 }
//             }
//             else if (des[i].name === 'form') {
//                 if (des[i].attrs && des[i].attrs.action) {
//                     if (!isRelativePath(des[i].attrs.action) && !validateURL(des[i].attrs.action)) {
//                         des[i].attrs.action = url + des[i].attrs.action;
//                     }
//                     else if (isRelativePath(des[i].attrs.action) === true) {
//                         des[i].attrs.action = 'https:' + des[i].attrs.action;
//                     }
//                 }
//             }
//         }
//     }

//     let minifiedScripts = uglify.minify(scripts)['code'];
//     // console.log(minifiedScripts);

//     let combined = '';
//     for (const key in scripts) {
//         if (scripts.hasOwnProperty(key)) {
//             combined += scripts[key];
//         }
//     }

//     try {
//         fs.writeFileSync('./output/combined.js', combined, () => {
//             console.log('=> Combined Source JS content of given URL saved at ./output/combined.js');
//         });
//         fs.writeFileSync('./output/combined.min.js', minifiedScripts, () => {
//             console.log('=> Combined & minified source js content of given URL saved at ./output/combined.min.js');
//         });
//     } catch (error) {
//         assert(error);
//     }


//     let result = soup.prettify();
//     return result;
// }
