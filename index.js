//npm
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const userInput  = require('./lib/userInput');
const Configstore = require('configstore');
const pkg = require('./package.json');


//custom scripts
const files = require('./lib/files');
//init configstore
const conf = new Configstore(pkg.name);


//clear the screen
clear();

//use figlet to add a good starting image on console
console.log(
    chalk.yellow(
        figlet.textSync('QB CLI', { horizontalLayout: 'full' })
    )
);



const run = async () => {
    const input = await userInput.getInput();
    conf.set(input.repositoryId, input);
    console.log(conf.get('dbid'));
}

run();





