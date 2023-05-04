module.exports = function(app,connection1){
app.get("/fyers/access_token", (req, res) => {

    var hosts = req.headers.host;
    var axios = require('axios');
    var qs = require('qs');
    var dateTime = require('node-datetime');
    const sha256 = require('sha256'); 

    var state = Buffer.from(req.query.state, 'base64');
    state = JSON.parse(state);
    var panel = state.panel;
    var user_id = state.user_id;
    var redirect_uri = state.url;
   // var connection = eval(panel);

   connection1.query('SELECT * from client where `id`="' + user_id + '"', (err, result) => {

        if (result.length != 0) {
            var sha_string = sha256(result[0].app_id + ':' + result[0].api_secret);;

            var data = JSON.stringify({
                "grant_type": "authorization_code",
                "appIdHash": sha_string,
                "code": req.query.auth_code
            });

            var config = {
                method: 'post',
                url: 'https://api.fyers.in/api/v2/validate-authcode',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };

            axios(config)
                .then(function(response) {
                    console.log(JSON.stringify(response.data));

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