module.exports = function(app,connection1){
app.post("/anandrathi/access_token", (req, res) => {
    var hosts = req.headers.host;
    var axios = require('axios');
    var qs = require('qs');
    var dateTime = require('node-datetime');   
   
    console.log('broker - Anandrathi');
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

    var dt = dateTime.create();
    var ccdate = dt.format('Y-m-d H:M:S');

   connection1.query('SELECT * from client where `id`="' + user_id + '"', (err, result) => {

        if (result.length != 0) {

           // res.send(result[0].username);
            

            var data = JSON.stringify({
                "secretKey": result[0].api_secret,
                "appKey": result[0].api_key,
                "source": "WebAPI"
            });

            var config = {
                method: 'post',
                url: 'https://algozy.rathi.com:3000/interactive/user/session',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };
           
          //  console.log('data -',data)
            axios(config)
                .then(function(response) {
                   // console.log(JSON.stringify(response.data));
                    // console.log('type -',response);
                    // console.log('token -',response.data.result.token);
                    // console.log('userid -',response.data.result.userID);
                   

                    //var access_token = response.data.result.access_token;
                   

                   // console.log('ass -',access_token);
                   if(response.data.type == "success"){

                   var access_token = response.data.result.token;
                   var client_code = response.data.result.userID;
                   
                    connection1.query('UPDATE `client` SET `access_token` = "' + access_token + '",`client_code` = "' + client_code + '",`trading_type`="on" WHERE `client`.`id`="' + user_id + '"', (err, result) => {
                        var dt = dateTime.create();
                        var ccdate = dt.format('Y-m-d H:M:S');
                        var trading = 'TradingON';
                        connection1.query('INSERT INTO `trading_status_client` (`client_id`,`trading`,`created_at`) VALUES ("' + user_id + '","' + trading + '","' + ccdate + '")', (err, result) => {
                            console.log("err", err);
                            res.send({ success: 'true' });
                           // return res.redirect(redirect_uri);
                        });
                    });

                }else{
                    res.send({ success: 'true' });
                }
                     
                })
                .catch(function(error) {
                    console.log(error);
                   // console.log('shakiir   ---- ');
                   // console.log('hhh',error.response.data.description)


                    connection1.query('INSERT INTO `broker_response`(`client_id`,`reject_reason`,`trading_status`,`created_at`) VALUES ("' + user_id + '","' + error.response.data.description + '","Trading OFF","' + ccdate + '")', (err1, signal_status) => {
                        // console.log('eroor query -',err1);
                     });
                });
        }

    });
   //  res.send('success');
});
}