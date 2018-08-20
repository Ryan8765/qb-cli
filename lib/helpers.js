
module.exports = {
    /**
     * @param {String} extension The Extension of the file you are looking for
     * @param {Array} array Array of file names from a given directory.
     */
    getFileNameFromExt_h : (array, extension) => {
        const length = array.length;
        var name = false;
        for( var i = 0; i < length; i++ ) {
            if( array[i].includes(extension) ) {
                name = array[i];
            }
        }
        return name;
    },

};