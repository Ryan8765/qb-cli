#!/usr/bin/env node

//npm
const clear = require('clear');
const userInput  = require('./lib/userInput');
const Configstore = require('configstore');
const pkg = require('./package.json');
const CLI = require ('clui');
const Spinner = CLI.Spinner;
const minimist = require('minimist');
const chalk = require('chalk');


//custom scripts
const files = require('./lib/files');
const helpers = require('./lib/helpers');
//init configstore
const conf = new Configstore(pkg.name);

//configs
const qbCLIConfName = 'qbcli.json';
const extensionPrefix = 'MCF_';
const extensionPrefixDev = 'MCF_d_';




const run = async () => {

    const args = minimist(process.argv.slice(2));


    //make sure user is running this from the root of their react directory
    if (!files.fileFolderExists(`${qbCLIConfName}`)) {
        console.log(chalk.red('This qbcli command can only be run from the root of your directory.'));
        return;
    } 

    //if running the install
    if( args._.includes('install') ) {
        //clear the screen
        clear();

        const input = await userInput.getInput();
        const repositoryId = input.repositoryId;

        /*
            Save repository ID to local config and everything else to local
        */
        const data = {
            repositoryId
        };
        //save the repository ID to local JSON file
        files.saveJSONToFile(`${qbCLIConfName}`, data);
        //save to local
        conf.set(repositoryId, input);

    //if running the deploy
    } else if (args._.includes('deploy')) {
        //running a spinner
        // const status = new Spinner('Authenticating you, please wait...');
        // status.start();  

        //make sure user is running this from the root of their react directory
        if (!files.fileFolderExists(`${qbCLIConfName}`)) {
            console.log(chalk.red('This qbcli command can only be run from the root of your directory.'));
            return;
        } 

        //make sure build folder exists
        if( !files.fileFolderExists('./build') ) {
            console.log(chalk.red('This qbcli command can only be run from the root of your directory.  You must install qbcli before using it, and your react app must be built (npm run build).'));
            return;
        }

        //get filenames in the build folder
        const fileNamesInBuild = files.getFilesFromDirectory('./build');

        if( !fileNamesInBuild ) {
            console.log(chalk.red('You may have installed the qbcli in the wrong directory.  Please reinstall in the top level directory of your React application.'));
            return;
        }

        const { repositoryId } = files.readJSONFile(`./${qbCLIConfName}`);

        //get configs stored from qbcli install
        const configs = conf.get( repositoryId );

        if( !configs ) {
            console.log(chalk.red('Project may never have been initialized - please run qbcli install.'));
            return;
        }

        //get filenames in the build folder
        const cssFileName = helpers.getFileNameFromExt_h(fileNamesInBuild, '.css');
        const jsFileName = helpers.getFileNameFromExt_h(fileNamesInBuild, '.js');

        if( !cssFileName || !jsFileName ) {
            console.log(chalk.red('Make sure you have run npm run build for your React application'));
            return;
        }

        var qbCSSFileName = null;
        var qbJSFileName = null;
        //create the filenames to be used for QB.
        if( args._.includes('prod') ) {
            qbCSSFileName = `${extensionPrefix}${repositoryId}_index.css`;
            qbJSFileName = `${extensionPrefix}${repositoryId}_index.js`;
        } else if( args._.includes('dev') ) {
            qbCSSFileName = `${extensionPrefixDev}${repositoryId}_index.css`;
            qbJSFileName = `${extensionPrefixDev}${repositoryId}_index.js`;
        } else {
            console.log(chalk.green('Please specify dev or prod deployment.'));
            return;
        }
        console.log( qbCSSFileName );
        console.log( qbJSFileName );


        //get file contents from the build folder
        var cssFileContents = files.getFileContents(`./build/${cssFileName}`);
        var jsFileContents = files.getFileContents(`./build/${jsFileName}`);




        // status.stop();
    }

    

    //running a spinner
    // const status = new Spinner('Authenticating you, please wait...');
    // status.start();     
}

run();





