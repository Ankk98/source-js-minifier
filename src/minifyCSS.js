/*
Css can be inserted in these ways: https://www.w3schools.com/CSS/css_howto.asp

Inside head:
External Example: <link rel="stylesheet" type="text/css" href="mystyle.css">
Internal example: <style></style>

Inline css: 
In each tags
*/

"use strict";
const utils = require('parse5-utils');
const CleanCSS = require('clean-css');
const download = require("./downloadContent");

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



async function minifyCSS(source) {
    console.log('Minifying css content....');

    // Convert into ast
    const ast = utils.parse(source);
    // let concatenatedStyleSheets = '';

    // Traverse html AST to minify all style sheets in-place
    walk(ast, async (node) => {
        if (node.tagName === 'link' &&
            node.attrs) {
            // From link tags
            for (let index = 0; index < node.attrs.length; index++) {
                const attribute = node.attrs[index];
                if (attribute &&
                    attribute.name === 'href' &&
                    attribute.value != '' &&
                    attribute.value) {
                    // Get href link from the attribute
                    console.log('Getting contents a of CSS style sheet......');

                    // Fetch contents
                    let content;
                    try {
                        content = await download(attribute.value);
                    } catch (error) {
                        console.log(error);
                        return;
                    }

                    // Minify css
                    let options = {};
                    let minifiedStyleSheet = new CleanCSS(options).minify(content);

                    // Create new node
                    let newNode = utils.createNode('style');
                    newNode.childNodes = [];
                    newNode.childNodes.push(utils.createTextNode(minifiedStyleSheet));

                    // Replace node
                    utils.replace(node, newNode);
                }
            }
        }
        else if (node.tagName === 'style' &&
            node.childNodes.length > 0) {
            // From style tags
            for (let index = 0; index < node.childNodes.length; index++) {
                const child = node.childNodes[index];
                // For all child text tags
                if (child &&
                    child.nodeName === '#text' &&
                    child.value) {
                    console.log('Getting contents a of CSS style sheet......');

                    // Minify css
                    let minifiedStyleSheet = new CleanCSS().minify(child.value).styles;

                    // Replace content
                    utils.setText(node, minifiedStyleSheet);
                }
            }

        }
    });

    // return html in string format
    let newSource = utils.serialize(ast);
    return newSource;

}

module.exports.minifyCSS = minifyCSS;
