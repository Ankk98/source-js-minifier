const program = require('commander');

const minifier = require('./minifier');

// CLI tool
program
    .version('0.0.4')
    .description(`A CLI tool to download source code of a webpage from a URL(validated), 
then fix relative URLs, then minify the css stylesheets in-place, 
then replace in-place or concatenate its JS scripts with the minified script, & 
then open the resultant webpage in browser. 
Implemented in NodeJS. [Demonstration Project]`);

program
    .option('--custom', 'Use custom JS minifier. Default is Terser.', false);

program
    .option('--concatenate', `Concate all JS scripts into one JS file. Default is in-place replacement.`, false);

program
    .option('--css', 'Minify CSS stylesheet in-place.', false);

program
    .command('minify <url>')
    .alias('m')
    .description('Minify it\'s source JS & CSS')
    .action((url) => {
        minifier.minifier(url, program.custom, program.concatenate, program.css);
    });

program.parse(process.argv);