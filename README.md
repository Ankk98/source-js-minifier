# Source JS Minifier [WIP]
A CLI tool to download source code of a webpage from a URL, replace its JS scripts with minified version & load the webpage in browser.

### Run locally
1. Download source code
2. `npm install`
3. `node src/app.js minify <url>`

Note: 
- Files will be saved to `./downloads/`
- Requires nodeJS, npm
- Dependencies: commander, node-fetch, jssoup, uglify-js, open


### TODOs
1. Replacing functionality: To replace each JS import/script with its minified version
2. Custom Minification functionality