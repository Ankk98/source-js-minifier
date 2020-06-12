const program = require('commander');

const replaceScript = require('./replaceScriptsWithMinScripts');
// import {app} from './replaceScriptsWithMinScripts';

program
    .version('0.0.2')
    .description('Source JS Minifier');

program
    .command('minify <url>')
    .alias('m')
    .description('Minify it\'s source JS')
    .action((url) => {
        replaceScript.app(url);
    });

program.parse(process.argv);