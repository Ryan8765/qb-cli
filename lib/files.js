const fs = require('fs');
const path = require('path');

module.exports = {
    //gets current working directory
    getCurrentDirectoryBase : () => {
        return path.basename(process.cwd());
    },

    //checks to see if the directory exists
    directoryExists : (filePath) => {
        try {
            return fs.statSync(filePath).isDirectory();
        } catch (err) {
            return false;
        }
    }
};