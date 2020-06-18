# Source JS Minifier [WIP]
A CLI tool to download source code of a webpage from a URL(validated), then fix relative URLs, then minify the css stylesheets in-place, then replace in-place or concatenate its JS scripts with the minified script, & then open the resultant webpage in browser. 

Implemented in NodeJS. [Demonstration Project]

### Install

From npm registry:
`npm install source-js-minifier` 

### Run locally

1. Download source code
2. `npm install` from repo 
3. Run Command

` `  ` node src/app.js minify <url> `  ` ` 

` `  ` node src/app.js minify <url> --custom `  ` ` => To use custom js minifier

` `  ` node src/app.js minify <url> --concatenate `  ` ` => To concatenate all js scripts (including downloaded) into one & attach minified version at the end of html body.

` `  ` node src/app.js minify <url> --css `  ` ` => To perform in-place css minification.

` `  ` node src/app.js minify <url> --custom --concatenate --css `  ` ` => Use all together

Note: 

* Files will be saved to `./output/` 

### Dependencies: 

* Commander: CLI tool
* Downloading files: node-fetch
* JS Minifier: terser
* HTML Parser, manipulator, generator: parse5-utils
* For cross platform file opening in browser: open
* CSS minifier: clean-css

For Custom Minifier:

* JS Parser: acorn
* JS manipulator: recast
* JS Generator: astring

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

Extremenly helpful guide on AST manipulation: https://lihautan.com/manipulating-ast-with-javascript/ 

Note:

* Concepts Required: Abstract Syntax Trees of HTML & JS, DFS traversal, Visitor Pattern, Synchronous code in NodeJS
* ASTs has been extensively used because it best server the purpose.

### TODOs

1. Static type check, Lint, Comments, Best practices/conventions, Logging
2. Write tests / unit tests
3. More optimizations in Custom Minifier
4. REFACTOR needed
5. Relook error-handling & synchronization
