'use strict';
const jssoup = require("jssoup").default;
const download = require("./downloadContent");
const uglify = require("uglify-js");
const fs = require("fs");
const open = require('open');

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

function SoupString(text, parent) {
    this.parent = null;
    this.previousElement = null;
    this.nextElement = null;
    this._text = text;
}

async function replaceScriptsWithMinScripts(source, url) {
    console.log('Replacing all the scripts present in the webpage & from the src links of scripts...');

    let soup = new jssoup(source);

    let des = soup.descendants;

    for (let i = 0; i < des.length; ++i) {
        if (des[i].constructor.name === 'SoupTag') {
            if (des[i].name === 'script') {
                if (des[i].contents != [] && des[i].contents[0] != null && des[i].contents[0]['_text'] != null && des[i].contents[0]['_text'] != '') {
                    console.log('Minifying and replacing a script...');
                    let text = uglify.minify(des[i].contents[0]['_text'])['code'];
                    if (text) {
                        des[i].contents[0]['_text'] = text;
                    } else {
                        des[i].contents[0]['_text'] = '';
                    }
                }
                else if (des[i].attrs && des[i].attrs.src != null) {
                    if (isRelativePath(des[i].attrs.src) === true) {
                        des[i].attrs.src = 'https:' + des[i].attrs.src;
                    }
                    //TODO: download scripts and add SoupString with minified text
                }
            }
            else if (des[i].name === 'link' || des[i].name === 'a') {
                if (des[i].attrs && des[i].attrs.href) {
                    if (!isRelativePath(des[i].attrs.href) && !validateURL(des[i].attrs.href)) {
                        des[i].attrs.href = url + des[i].attrs.href;
                    }
                    else if (isRelativePath(des[i].attrs.href) === true) {
                        des[i].attrs.href = 'https:' + des[i].attrs.href;
                    }
                }
            }
            else if (des[i].name === 'img') { 
                if (des[i].attrs && des[i].attrs.src) {
                    if (!isRelativePath(des[i].attrs.src) && !validateURL(des[i].attrs.src)) {
                        des[i].attrs.src = url + des[i].attrs.src;
                    }
                    else if (isRelativePath(des[i].attrs.src) === true) {
                        des[i].attrs.src = 'https:' + des[i].attrs.src;
                    }
                }
            }
            else if (des[i].name === 'form') { 
                if (des[i].attrs && des[i].attrs.action) {
                    if (!isRelativePath(des[i].attrs.action) && !validateURL(des[i].attrs.action)) {
                        des[i].attrs.action = url + des[i].attrs.action;
                    }
                    else if (isRelativePath(des[i].attrs.action) === true) {
                        des[i].attrs.action = 'https:' + des[i].attrs.action;
                    }
                }
            }
        }
    }

    let result = soup.prettify();
    return result;
}

async function app(url) {
    console.log(`=> URL of source webpage provided: ${url}`);

    if (!validateURL(url)) {
        console.log(`Invalid URL`);
        return;
    }

    if (url[url.length - 2] != '/') {
        url += '/';
    }

    let source;
    try {
        source = await download(url);
    } catch (error) {
        console.log(error);
        return;
    }

    fs.writeFile('./downloads/source.html', source, () => {
        console.log('=> Source content of given URL saved at ./downloads/source.html');
    });

    let newSource;
    try {
        newSource = await replaceScriptsWithMinScripts(source, url);
    } catch (error) {
        throw error;
    }

    fs.writeFileSync('./downloads/newSource.html', newSource, () => {
        console.log('=> Source JS code of given URL saved at ./downloads/newSource.html');
    });

    console.log('=> Opening the webpage into the default browser...');
    try {
        await open('./downloads/newSource.html');
    } catch (error) {
        console.log(error);
        return;
    }

    console.log('=> Processing Complete, take a look at the browser tab. Exiting.');
}

module.exports.app = app;
module.exports.replaceScriptsWithMinScripts = replaceScriptsWithMinScripts;

// For future reference:
// if (des[i].attrs && des[i].attrs.src != null) {
                //     if (isRelativePath(des[i].attrs.src) === true) {
                //         des[i].attrs.src = 'https:' + des[i].attrs.src;
                //     }
                //     if (!validateURL(des[i].attrs.src)) {
                //         throw new Error(`Invalid URL`);
                //     }

                //     let currText;
                //     try {
                //         currText = await download(des[i].attrs.src);
                //     } catch (error) {
                //         throw error;
                //     }
                //     console.log('Minifying and replacing a script...');
                //     delete des[i].attrs.src;
                //     // console.log(des[i]);
                //     let text = uglify.minify(currText)['code'];
                //     if(text){
                //         des[i].contents.push(new SoupString(text, des[i]));
                //     }else{
                //         des[i].contents.push(new SoupString('', des[i]));
                //     }
                //     // des[i].contents[0]['_text'] = uglify.minify(currText);
                //     console.log(des[i].attrs);
                // }