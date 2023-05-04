module.exports = function(app,connection1){
app.post("/b2c/access_token", (req, res) => {
    var hosts = req.headers.host;
    var axios = require('axios');
    var qs = require('qs');
    var dateTime = require('node-datetime');   
   
    console.log('s - B2C');
    // res.send('okk');
    console.log('req state 111 - ',req.body.State);
    var state = Buffer.from(req.body.State, 'base64');
    
    state = JSON.parse(state);
    
    var panel = state.panel;
    var redirect_uri = state.url;


    console.log('state panel cc', panel);
    console.log('redirect uri -', redirect_uri);
    var user_id = state.user_id;

// res.send(redirect_uri);
   // var connection = eval(panel);



   connection1.query('SELECT * from client where `id`="' + user_id + '"', (err, result) => {

        if (result.length != 0) {

           // res.send(result[0].username);
            

            var data = JSON.stringify({
                "user_id": result[0].client_code,
                "login_type": "PASSWORD",
                "password": result[0].app_id,
                "second_auth": result[0].api_secret,
                "api_key": result[0].api_key,
                "source": "WEBAPI"
            });

            var config = {
                method: 'post',
                url: 'https://jri4df7kaa.execute-api.ap-south-1.amazonaws.com/prod/interactive/authentication/v1/user/session',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };
           
            console.log('data -',data)
            axios(config)
                .then(function(response) {
                    console.log(JSON.stringify(response.data));

                    var access_token = response.data.data.access_token;

                    console.log('ass -',access_token);
                   
                    connection1.query('UPDATE `client` SET `access_token` = "' + access_token + '",`trading_type`="on" WHERE `client`.`id`="' + user_id + '"', (err, result) => {
                        var dt = dateTime.create();
                        var ccdate = dt.format('Y-m-d H:M:S');
                        var trading = 'TradingON';
                        connection1.query('INSERT INTO `trading_status_client` (`client_id`,`trading`,`created_at`) VALUES ("' + user_id + '","' + trading + '","' + ccdate + '")', (err, result) => {
                            console.log("err", err);
                            res.send({ success: 'true' });
                           // return res.redirect(redirect_uri);
                        });
                    });
                     
                })
                .catch(function(error) {
                    console.log(error);
                });
        }

    });
   //  res.send('success');
});
}