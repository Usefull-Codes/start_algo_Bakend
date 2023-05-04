module.exports = function(app,connection1){
app.post("/markethub/access_token", (req, res) => {
  
    var hosts = req.headers.host;
    var axios = require('axios');
    var qs = require('qs');
    var dateTime = require('node-datetime');   
    //console.log('shakir market');
    //console.log('req state 111 - ',req.body.State);
    var state = Buffer.from(req.body.State, 'base64');
    state = JSON.parse(state);
    var panel = state.panel;
    var redirect_uri = state.url;



    console.log('state panel cc', panel);
    console.log('redirect uri -', redirect_uri);
    var user_id = state.user_id;

   // var connection = eval(panel);

   connection1.query('SELECT * from client where `id`="' + user_id + '"', (err, result) => {

        // console.log('market hub -',result);
        var user = result[0].client_code;
        var password = result[0].api_secret;
        var verification = result[0].app_id;
        // console.log('user -',user);
        // console.log('password -',password);
        // console.log('verification -',verification);

        if (result.length != 0) {
            var config = {
                method: 'get',
                url: 'https://trade.markethubonline.com/api/token2?user='+user+'&password='+password+'&verification='+verification
            };


            axios(config)
                .then(function(response) {
                   // console.log('Market hub 1- ', response)
                   
                   var access_token = response.data.token;
                   //console.log('Access Token ', access_token)
             
                   connection1.query('UPDATE `client` SET `access_token` = "' + access_token + '",`trading_type`="on"  WHERE `client`.`id`="' + user_id + '"', (err, result) => {
                        ///return res.redirect(redirect_uri);
                        if (result.length != 0) {
                            var dt = dateTime.create();
                            var ccdate = dt.format('Y-m-d H:M:S');
                            var trading = 'TradingON';
                            connection1.query('INSERT INTO `trading_status_client` (`client_id`,`trading`,`created_at`) VALUES ("' + user_id + '","' + trading + '","' + ccdate + '")', (err, result) => {
                                console.log("err", err);

                                res.send({ success: 'true' });
                            })
                        }
                    });
                })
                .catch(function(error) {
                    console.log(error);
                });
        }

    });

});

}