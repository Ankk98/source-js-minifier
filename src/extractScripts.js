const jssoup = require("jssoup").default;
const download = require("./downloadContent");

async function extractJS(body) {
    console.log('Extracting all the scripts present in the webpage & from the src links of scripts...');
    let soup = new jssoup(body);
    scripts = soup.findAll('script');

    let scriptURLs = [];

    scripts.forEach(element => {
        if (element.attrs.src != null) {
            scriptURLs.push(element.attrs.src);
        }
    });
    let scriptTexts = [];
    scripts.forEach(element => {
        if (element.text != (null | '')) {
            scriptTexts.push(element.text);
        }
    });

    for (let i = 0; i < scriptURLs.length; i++) {
        let temp = await download(scriptURLs[i]);
        scriptTexts.push(temp);
    }

    return scriptTexts;
}

module.exports = extractJS;



// function replaceAll() {
//     var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
//     var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
//     var string = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

//     var results = [];
//     var strainer = new SoupStrainer(name, attrs, string);

//     var descendants = this.descendants;
//     for (var i = 0; i < descendants.length; ++i) {
//         if (descendants[i] instanceof SoupTag) {
//             var tag = strainer.match(descendants[i]);
//             if (tag) {
//                 results.push(tag);
//             }
//         }
//     }

//     return results;
// }

// function replaceAll(soup, keyword) {
//     var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
//     var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
//     var string = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

//     var results = [];

//     // while(1){
//     //     element = soup.find('script');
//     //     if(element != ('' | null)){
//     //         results.push(element);
//     //     }
//     //     else{
//     //         break;
//     //     }

//     // }

//     var strainer = new SoupStrainer(name, attrs, string);

//     var descendants = this.descendants;
//     for (var i = 0; i < descendants.length; ++i) {
//         if (descendants[i] instanceof SoupTag) {
//             var tag = strainer.match(descendants[i]);
//             if (tag) {
//                 results.push(tag);
//             }
//         }
//     }

//     return results;
// }
// const { SoupStrainer, SoupTag } = require("jssoup");
// // scripts = replaceAll(soup, 'script');
    // console.log(scripts);