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

async function replaceScriptsWithMinScripts(source) {
    console.log('Replacing all the scripts present in the webpage & from the src links of scripts...');

    let soup = new jssoup(source);

    let des = soup.descendants;

    for (let i = 0; i < des.length; ++i) {
        if (des[i].constructor.name === 'SoupTag') {
            if (des[i].name === 'script') {
                if(des[i].contents != [] && des[i].contents[0] != null && des[i].contents[0]['_text'] != null && des[i].contents[0]['_text'] != ''){
                    console.log('Minifying and replacing a script...');
                    des[i].contents[0]['_text'] = uglify.minify(des[i].contents[0]['_text'])['code'];
                }
                if(des[i].attrs && des[i].attrs.src != null){
                    let temp = await download(des[i].attrs.src);
                    console.log('Minifying and replacing a script...');
                    console.log(des[i].attrs);
                    delete des[i].attrs.src;
                    des[i].contents[0]['_text'] = uglify.minify(temp);
                    console.log(des[i].attrs);
                }
            }
        }
    }

    let result = soup.prettify();
    return result;
}

async function app(url) {
    console.log(`=> URL of source webpage provided: ${url}`);

    if(!validateURL(url)){
        console.log(`Invalid URL`);

        return;
    }

    let source;
    try{
        source = await download(url);
    } catch(error){
        console.log(error);
    }

    fs.writeFile('./downloads/source.html', source, () => {
        console.log('=> Source content of given URL saved at ./downloads/source.html');
    });

    let newSource;
    try{
        newSource = await replaceScriptsWithMinScripts(source);
    } catch(error){
        console.log(error);
    }
    
    fs.writeFileSync('./downloads/newSource.html', newSource, () => {
        console.log('=> Source JS code of given URL saved at ./downloads/newSource.html');
    });

    console.log('=> Opening the webpage into the default browser...');
    await open('./downloads/newSource.html');

    console.log('=> Processing Complete, take a look at the browser tab. Exiting.');
}

module.exports.app = app;
module.exports.replaceScriptsWithMinScripts = replaceScriptsWithMinScripts;
