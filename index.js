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
const Cryptr = require('cryptr');
const cryptoRandomString = require('crypto-random-string');
const fs = require('fs');
const parse = require('parse-gitignore');
const path = require('path');


//custom scripts
const files = require('./lib/files');
const helpers = require('./lib/helpers');
const qb = require('./lib/qb');

//init configstore
const conf = new Configstore(pkg.name);

//configs
const qbCLIConfName = 'qbcli.json';
var extensionPrefix = 'MCF_';
var extensionPrefixDev = 'MCF_d_';
const gitIgnoreFileName = './.gitignore';




const run = async () => {

    const args = minimist(process.argv.slice(2));


    //if running the install
    if( args._.includes('init') ) {

        //clear the screen
        clear();

        const input = await userInput.getInput();
        const repositoryId = input.repositoryId;
        const customPrefix = input.customPrefix;
        const salt = cryptoRandomString(25);

        const cryptr = new Cryptr(salt);

        //encrypt app & usertoken
        input.apptoken = cryptr.encrypt(input.apptoken);
        input.usertoken = cryptr.encrypt(input.usertoken);

        /*
            Save repository ID to local config and everything else to local
        */
        const data = {
            repositoryId,
            salt
        };

        //save the repository ID to local JSON file
        files.saveJSONToFile(`${qbCLIConfName}`, data);
        //save to local
        conf.set(repositoryId, input);

        /*
            Update .gitignore if present to make sure it excludes qbcli.json
        */
        var pathToGitignore = path.join(__dirname, gitIgnoreFileName);
        if (files.fileFolderExists(pathToGitignore)) {
            //gets all contents of gitignore
            const gitIgnoreFilesArray = parse(fs.readFileSync(pathToGitignore));

            //only append if the qbcli.json isn't alrady listed
            if ( gitIgnoreFilesArray.indexOf(`${qbCLIConfName}`) < 0 ) {
                var writeStream = fs.createWriteStream(pathToGitignore, { 'flags': 'a' });
                // use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
                writeStream.write(`\n${qbCLIConfName}`);
                writeStream.end();
            }
        } 

    //if running the deploy
    } else if ( args._.includes('dev') || args._.includes('prod') ) {


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
        const buildCSSFileNames = files.getFilesFromDirectory('./build/static/css');
        const buildJSFileNames = files.getFilesFromDirectory('./build/static/js');

        //concat filenames and return only filenames without .map
        const fileNamesInBuild = buildCSSFileNames.concat(buildJSFileNames).filter((filenames)=>{
            return !filenames.includes('.map');
        });

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
        var { customPrefix } = configs;

        //if there is a customprefix present, use that instead of "MCF_" & "MCF_d_"
        if( customPrefix ) {
            extensionPrefix = `${customPrefix}_`;
            extensionPrefixDev = `${customPrefix}_d_`;
        }

       

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
        try{

            String.prototype.replaceAll = function (search, replacement) {
                var target = this;
                return target.replace(new RegExp(search, 'g'), replacement);
            };
            var cssFileContents = files.getFileContents(`./build/static/css/${cssFileName}`);
            var jsFileContents = files.getFileContents(`./build/static/js/${jsFileName}`);
            //make sure no CDATA's are contained in the jsFIleContents - if there is modify it so the cdata is replaced
            jsFileContents = jsFileContents.replaceAll("]]>", "]]]]><![CDATA[>");
        } catch(err) {
            console.log(chalk.red('Files are not present in build folder.'));
            return;
        }
        

        var { dbid, realm, apptoken, usertoken } = configs;

        //get salt for decryption
        const { salt } = files.readJSONFile(`./${qbCLIConfName}`);
        const cryptr = new Cryptr(salt);

        //decrypt usertoken and password
        usertoken = cryptr.decrypt(usertoken);
        apptoken = cryptr.decrypt(apptoken);

        /*
            Add files to QB
        */

        //start spinner
        const status = new Spinner('Processing request, please wait...');
        status.start();

        //api calls
        Promise.all([
            qb.addUpdateDbPage(dbid, realm, usertoken, apptoken, cssFileContents, qbCSSFileName),
            qb.addUpdateDbPage(dbid, realm, usertoken, apptoken, jsFileContents, qbJSFileName)
        ]).then((res)=>{
            status.stop();
            console.log(chalk.green('Deployment Successful!'));
        }).catch((err)=>{
            status.stop();
            console.log(chalk.red('API call failure.  All files weren\'t deployed successfully'));
        });


    }
  
}

run();





