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
const qb = require('./lib/qb');

//init configstore
const conf = new Configstore(pkg.name);

//configs
const qbCLIConfName = 'qbcli.json';
const extensionPrefix = 'MCF_';
const extensionPrefixDev = 'MCF_d_';




const run = async () => {

    const args = minimist(process.argv.slice(2));



    //if running the install
    if( args._.includes('init') ) {
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
    } else if ( args._.includes('dev') || args._.includes('prod') ) {
        //running a spinner
        // const status = new Spinner('Authenticating you, please wait...');
        // status.start();  
        
        //make sure user is running this from the root of their react directory
        if (!files.fileFolderExists(`${qbCLIConfName}`)) {
            console.log(chalk.red('This qbdeploy command can only be run from the root of your directory.'));
            return;
        } 

        //make sure user is running this from the root of their react directory
        if (!files.fileFolderExists(`${qbCLIConfName}`)) {
            console.log(chalk.red('This qbdeploy command can only be run from the root of your directory.'));
            return;
        } 

        //make sure build folder exists
        if( !files.fileFolderExists('./build') ) {
            console.log(chalk.red('This qbdeploy command can only be run from the root of your directory.  You must install qbcli before using it, and your react app must be built (npm run build).'));
            return;
        }

        //get filenames in the build folder
        const fileNamesInBuild = files.getFilesFromDirectory('./build');

        if( !fileNamesInBuild ) {
            console.log(chalk.red('You may have installed the qbdeploy in the wrong directory.  Please reinstall in the top level directory of your React application.'));
            return;
        }

        const { repositoryId } = files.readJSONFile(`./${qbCLIConfName}`);

        //get configs stored from qbcli install
        const configs = conf.get( repositoryId );

        if( !configs ) {
            console.log(chalk.red('Project may never have been initialized - please run qbdeploy install.'));
            return;
        }

        //get filenames in the build folder
        const cssFileName = helpers.getFileNameFromExt_h(fileNamesInBuild, '.css');
        const jsFileName = helpers.getFileNameFromExt_h(fileNamesInBuild, '.js');

        if( !cssFileName || !jsFileName ) {
            console.log(chalk.red('Make sure you have run npm run build for your React application'));
            return;
        }

        //create the filenames to be used for QB.
        var qbCSSFileName = null;
        var qbJSFileName = null;
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
       


        //get file contents from the build folder
        var cssFileContents = files.getFileContents(`./build/${cssFileName}`);
        var jsFileContents = files.getFileContents(`./build/${jsFileName}`);

        var { dbid, realm, apptoken, usertoken } = configs;
        //add files to QB
        Promise.all([
            qb.addUpdateDbPage(dbid, realm, usertoken, apptoken, cssFileContents, qbCSSFileName),
            qb.addUpdateDbPage(dbid, realm, usertoken, apptoken, jsFileContents, qbJSFileName)
        ]).then((res)=>{
            console.log(chalk.green('Deployment Successful!'));
        }).catch((err)=>{
            console.log(chalk.red('API call failure.'));
        });


        // status.stop();
    }

    

    //running a spinner
    // const status = new Spinner('Authenticating you, please wait...');
    // status.start();     
}

run();





