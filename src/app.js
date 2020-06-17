const program = require('commander');

const minifier = require('./minifier');

// CLI tool
program
    .version('0.0.2')
    .description('Source JS Minifier');

program
    .option('--custom', 'Use custom js minifier.', false);

program
    .option('--concatenate', 'Concate all js scripts into one js file.', false);

program
    .command('minify <url>')
    .alias('m')
    .description('Minify it\'s source JS')
    .action((url) => {
        minifier.minifier(url, program.custom, program.concatenate);
    });

program.parse(process.argv);