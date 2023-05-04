module.exports = function(app,connection1){
app.get("/mastertrust/access_token", (req, res) => {
    

    var hosts = req.headers.host;
    var axios = require('axios');
    var qs = require('qs');
    var dateTime = require('node-datetime');   

    var state = Buffer.from(req.query.state, 'base64');
    console.log('code', req.query.code);
    console.log("state", state)
    state = JSON.parse(state);
    //res.send(state);
    var panel = state.panel;
    var user_id = state.user_id;
    var redirect_uri = state.url;
   // var connection = eval(panel);
    
   connection1.query('SELECT * from client where `id`="' + user_id + '"', (err, result) => {
        
        if (result.length != 0) {

            var data = qs.stringify({
                'grant_type': 'authorization_code',
                'code': req.query.code,
                'client_id': result[0].app_id,
                'client_secret_post': result[0].api_secret,
                'redirect_uri': `https://${hosts}/mastertrust/access_token`,
                'authorization_response': 'authorization_response'

            });
            var config = {
                method: 'post',
                url: 'https://masterswift-beta.mastertrust.co.in/oauth2/token',
                auth: {
                    username: result[0].app_id,
                    password: result[0].api_secret
                },
                data: data
            };

            axios(config)
                .then(function(response) {

                    var access_token = response.data.access_token;
                    connection1.query('UPDATE `client` SET `access_token` = "' + access_token + '",`trading_type`="on" WHERE `client`.`id`="' + user_id + '"', (err, result) => {

                        var dt = dateTime.create();
                        var ccdate = dt.format('Y-m-d H:M:S');
                        var trading = 'TradingON';
                        connection1.query('INSERT INTO `trading_status_client` (`client_id`,`trading`,`created_at`) VALUES ("' + user_id + '","' + trading + '","' + ccdate + '")', (err, result) => {
                            console.log("err", err);
                        return res.redirect(redirect_uri);


                         })
                       
                       
                    });
                })
                .catch(function(error) {
                    console.log(error);
                });
        }

    });

});
}