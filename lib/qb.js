const axios = require('axios');

module.exports = {

    
    addUpdateDbPage: ( dbid, realm, usertoken, apptoken=null, pagebody, pagename )=>{

        const url = `https://${realm}.quickbase.com/db/${dbid}`;
        var apptokenString = '';
        if( apptoken ) {
            apptokenString = `<apptoken>${apptoken}</apptoken>`;
        }
        var data = `
            <qdbapi>
                <pagename>${pagename}</pagename>
                <pagetype>1</pagetype>
                <pagebody>
                    <![CDATA[${pagebody}]]>
                </pagebody>
                <usertoken>${usertoken}</usertoken>
                ${apptokenString}
            </qdbapi>
        `;
        // Send a POST request
        axios({
            method: 'post',
            url: '/user/12345',
            data
        });
    }


}