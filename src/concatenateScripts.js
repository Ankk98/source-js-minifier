"use strict";
const utils = require('parse5-utils');
const download = require("./downloadContent");

function validateURL(url) {
    let pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    let regex = new RegExp(pattern);
    return regex.test(url);
}

function isRelativePath(url) {
    let pattern = /^\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    let regex2 = new RegExp(pattern);
    let result = regex2.test(url);
    return result;
}

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

async function extractScripts() {

    // walk to extract all the scripts
    let scripts = {};
    let count = 0;
    const ast = utils.parse('<!DOCTYPE html><html><head></head><body>Hi there!<p>hello<script src="https://www.google.com/"></script><b>mann</b></p><script>aveaveaw</script>bye</body></html>');

    await walk(ast, async (node) => {
        if (node.nodeName === 'script') {
            count++;
            if (node.childNodes != [] && node.childNodes[0] != null && node.childNodes[0]['value'] != null && node.childNodes[0]['value'] != '') {
                // extract scripts
                console.log('Extracting a Script....');
                scripts[`${count}.js`] = node.childNodes[0]['value'];
            }
            else if (node.attrs && node.attrs[0] != null) {

                for (let index = 0; index < node.attrs.length; index++) {
                    const attribute = node.attrs[index];
                    // console.log(attribute['value']);
                    if (attribute['name'] === 'src') {
                        // download scripts
                        // console.log(attribute['value']);
                        if (isRelativePath(attribute['value']) === true) {
                            attribute['value'] = 'https:' + attribute['value'];
                        }
                        if (!validateURL(attribute['value'])) {
                            throw new Error(`Invalid URL`);
                        }

                        try {
                            // console.log(attribute['value']);
                            const content = await download(attribute['value']);
                            scripts[`${count}.js`] = content;
                        } catch (error) {
                            throw error;
                        }
                        // console.log(attribute['value']);
                    }
                }
                // node.attrs.forEach(async attribute => {

                // });
            }
            utils.remove(node);
        }

    });

    const html = utils.serialize(ast);
    console.log(html);
    console.log(scripts);
}

(async () => {
    await extractScripts();
})();


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
