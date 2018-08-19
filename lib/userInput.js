const inquirer = require('inquirer');
const files = require('./files');

module.exports = {

    getInput: () => {

        const questions = [{
                name: 'dbid',
                type: 'input',
                message: 'Enter the QB application DBID.',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return '\nEnter the QB application DBID.';
                    }
                }
            },
            {
                name: 'apptoken',
                type: 'password',
                message: 'Enter the Application Token:',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return '\nPlease enter your Application Token.';
                    }
                }
            },
            {
                name: 'usertoken',
                type: 'password',
                message: 'Enter the User Token:',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return '\nPlease enter your User Token.';
                    }
                }
            },
            {
                name: 'repositoryId',
                type: 'text',
                message: 'Enter the repository ID',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return '\nPlease enter your prepend text.';
                    }
                }
            }
        ];
        return inquirer.prompt(questions);
    },
}