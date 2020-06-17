# Source JS Minifier [WIP]
A CLI tool to download source code of a webpage from a URL, replace or concatenate its JS scripts with minified scripts & open the resultant webpage in browser.
[Demonstration Project]

### Install

From npm registry:
`npm install source-js-minifier` 

### Run locally

1. Download source code
2. `npm install` 
3. Run Commands

`node src/app.js minify <url>` 

`node src/app.js minify <url> --custom` => To use custom minifier

`node src/app.js minify <url> --concatenate` => To concatenate all scripts (including downloaded) into one & attach minified version at the end of html body

`node src/app.js minify <url> --concatenate` => Use both together

Note: 

* Files will be saved to `./output/` 
* Requires nodeJS, npm
* Dependencies: commander, node-fetch, uglify-js, open, acorn, astring, parse5-utils

### Custom Minifier

An attempt to develop a custom js minifier.

Functionalities to be developed:

1. Remove whitespaces ---------------------- done
2. Remove comments ------------------------- done
3. Switch to shorthand syntax -------------- done
4. Resolve constant expressions ------------ done
5. Concatenate/Bundle scripts -------------- done 
6. Rename identifiers etc [TODO:]
7. Remove unused variables & dead code [TODO:]
8. if else to terenary --------------------- done
9. assignment operator --------------------- done

Steps req:

1. Parsing js code in AST
2. AST tree traversal using recursion
3. For each node perform modifications using Visitor Pattern
4. Code re-generation

For exploring AST: https://astexplorer.net/ 

For more info on using AST: https://youtu.be/C06MohLG_3s 

Note:

Concepts Required: Abstract Syntax Trees of HTML & JS, DFS traversal, Visitor Pattern, Synchronous code in NodeJS

### TODOs

1. Final complete Readme, Documentation
2. Static type check, Lint, Comments, Best practices/conventions, Logging 
3. Write tests / unit tests
4. More optimizations in custom Minifier
5. Cleanup & more refactor
