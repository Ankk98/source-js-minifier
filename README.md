# Source JS Minifier [WIP]
A CLI tool to download source code of a webpage from a URL, replace its JS scripts with minified version & load the webpage in browser.

### Run locally
1. Download source code
2. `npm install`
3. `node src/app.js minify <url>`

Note: 
- Files will be saved to `./output/`
- Requires nodeJS, npm
- Dependencies: commander, node-fetch, jssoup, uglify-js, open


### TODOs
1. Replacing functionality: To replace each JS import/script with its minified version
2. Custom Minification functionality
3. Documentation
4. Comments
5. Lint
6. Static type check
7. Write tests / unit tests
8. Final complete Readme
9. Combine JS content
10. Best practices/conventions
11. Follow style guide
12. Logging