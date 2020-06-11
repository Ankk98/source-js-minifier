const program = require('commander');
const app = require('./minify');

program
    .version('0.0.1')
    .description('Source JS Minifier');

program
    .command('minify <url>')
    .alias('m')
    .description('Minify it\'s source JS')
    .action((url) => {
        app(url);
    });

program.parse(process.argv);