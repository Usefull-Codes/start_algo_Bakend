module.exports = function (app, connection1) {
    var axios = require('axios');
    var dateTime = require('node-datetime');

    app.post("/kotak/get_token", (req, res) => {

        console.log("email", req.body.email);


        connection1.query('SELECT * from client WHERE email="' + req.body.email + '"', (err, result) => {

            var token = Buffer.from(`${result[0].api_key}:${result[0].api_secret}`).toString('base64')

            var qs = require('qs');
            var data = qs.stringify({
                'grant_type': 'password',
                'username': result[0].client_code,
                'password': result[0].api_type
            });
            var config = {
                method: 'post',
                maxBodyLength: Infinity,
                // url: 'https://tradeapi.kotaksecurities.com/token?username=' + result[0].client_code + '&password=' + result[0].api_type + '&grant_type=password',
                url:'https://tradeapi.kotaksecurities.com/token?grant_type=client_credentials',
                headers: {
                    'Authorization': 'Basic ' + token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: data
            };

            axios(config)
                .then(function (response) {
                

                    if (response.data.access_token) {
                        connection1.query('UPDATE `client` SET  `demat_userid`="' + response.data.access_token + '" WHERE email="' + result[0].email + '"', (err, result1) => {
                        })


                        var data = JSON.stringify({
                  
                            'userid': result[0].client_code,
                            'password': result[0].app_id
                          });
                          
                          var config = {
                            method: 'post',
                          maxBodyLength: Infinity,
                            url: 'https://tradeapi.kotaksecurities.com/apim/session/1.0/session/login/userid',
                            headers: { 
                              'consumerKey':result[0].api_key , 
                              'ip': '192.168.29.23', 
                              'appId': 'DefaultApplication', 
                              'userid': result[0].client_code, 
                              'Authorization': 'Bearer '+response.data.access_token, 
                              'Content-Type': 'application/json'
                            },
                            data : data
                          };
                          
                      
                        axios(config)
                            .then(function (response) {
                                var OneTimeToken = response.data.Success.oneTimeToken
                                console.log("response", response.data.Success);
                                console.log("OneTimeToken", OneTimeToken);
                                if (response.data.Success.message == "Authentication Successful.") {

                                    connection1.query('UPDATE `client` SET `oneTimeToken`="' + OneTimeToken + '" WHERE email="' + req.body.email + '"', (err, result) => {
                                        // console.log('UPDATE `client` SET `api_type`="' + OneTimeToken + '" WHERE email="' + req.body.email + '"');
                                        res.send({ data: response.data.Success })
                                    })
                                }

                            })
                            .catch(function (error) {
                                console.log("Error 1",error.response.data);
                                res.send({ data: error.response.data })
                            });

                    }

                })
                .catch(function (error) {
                    console.log("Error 1 -",error.response.data);
                    res.send({ data: error.response.data })

                })


        })

    });




    app.post("/kotak/get_session", (req, res) => {
        connection1.query('SELECT * from client WHERE email="' + req.body.email + '"', (err, result) => {

          
        
            axios({
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://tradeapi.kotaksecurities.com/apim/session/1.0/session/2FA/accesscode',
                headers: {
                    'consumerKey': result[0].api_key,              
                    'appId': 'DefaultApplication',
                    'userid': result[0].client_code,
                    'Authorization': 'Bearer ' + result[0].demat_userid,
                    'oneTimeToken': result[0].oneTimeToken,
                    'Content-Type': 'application/json'
                },
                data: {
                    "userid": result[0].client_code,
                    "accessCode": req.body.otp
                }
            })
                .then(function (response) {
                    console.log("Check Ok =>", response.data);
                    console.log("Check Ok =>", response.data.success.sessionToken);


                  
                    connection1.query('UPDATE `client` SET `access_token`="' + response.data.success.sessionToken + '" , `trading_type`="on" WHERE email="' + result[0].email + '"', (err, result1) => {



                        var dt = dateTime.create();
                        var ccdate = dt.format('Y-m-d H:M:S');
                        var trading = 'TradingON';
                        connection1.query('INSERT INTO `trading_status_client` (`client_id`,`trading`,`created_at`) VALUES ("' + result[0].id + '","' + trading + '","' + ccdate + '")', (err, result2) => {
                            console.log("err", err);
                        })

                        res.send({ msg: "Success", data: response.data })
                    })
            


                })
                .catch(function (error) {
                    // console.log(error);
                    res.send({ msg: error.data })
                });


        })
    });

}