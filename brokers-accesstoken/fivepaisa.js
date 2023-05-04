module.exports = function(app,connection1){
app.get("/fivepaisa/access_token", (req, res) => {

    var hosts = req.headers.host;
    var axios = require('axios');
    var qs = require('qs');
    var dateTime = require('node-datetime');   
   
    var state = Buffer.from(req.query.state, 'base64');
    state = JSON.parse(state);
    var panel = state.panel;
    var user_id = state.user_id;
    var redirect_uri = state.url;

    console.log('user_id',user_id);
    console.log('redirect_uri',redirect_uri);
    console.log('req.query.RequestToken',req.query.RequestToken);
    //var connection = eval(panel);

    connection1.query('SELECT * from client where `id`="' + user_id + '"', (err, result) => {

        console.log('key -',result[0].api_key);
        console.log('user id -',result[0].app_id);

        if (result.length != 0) {

            var data = {
                "head": {
                    "Key": result[0].api_key
                },
                "body": {
                    "RequestToken": req.query.RequestToken,
                    "EncryKey": result[0].api_secret,
                    "UserId": result[0].app_id
                }
            };



            var config = {
                method: 'post',
                url: 'https://openapi.5paisa.com/VendorsAPI/Service1.svc/GetAccessToken',
                data: data
            };

            axios(config)
                .then(function(response) {

                    console.log('aceestoken - ',response);

                    var access_token = response.data.body.AccessToken;
                    var ClientCode = response.data.body.ClientCode;

                    var dt = dateTime.create();
                    var ccdate = dt.format('Y-m-d H:M:S');

                   if(access_token != ''){

                    connection1.query('UPDATE `client` SET `access_token` = "' + access_token + '",`client_code`= "'+ClientCode+'",`trading_type`="on" WHERE `client`.`id`="' + user_id + '"', (err, result) => {
                      
                        var trading = 'TradingON';
                        connection1.query('INSERT INTO `trading_status_client` (`client_id`,`trading`,`created_at`) VALUES ("' + user_id + '","' + trading + '","' + ccdate + '")', (err, result) => {
                            console.log("err", err);

                            return res.redirect(redirect_uri);
                        })
                    });

                }else{

                   
                    connection1.query('INSERT INTO `broker_response`(`client_id`, `order_status`, `reject_reason`, `created_at`) VALUES ("' + user_id + '","Error","' + response.data.body.Message + '","' + ccdate + '")', (err1, signal_status) => {
                        console.log('eroor query -',err1);
                    });   

                }



                })
                .catch(function(error) {
                    console.log(error);
                });
        }

    });

});
}