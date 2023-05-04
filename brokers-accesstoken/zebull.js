const { send } = require('process');

module.exports = function(app,connection1){

    app.post("/zebu/accesstoken", (req, res) => {
       
        var axios = require('axios');
        var dateTime = require('node-datetime');
        const sha256 = require('sha256');
       
        var state = Buffer.from(req.body.State, 'base64');
        state = JSON.parse(state);
        var panel = state.panel;
        var redirect_uri = state.url;


        console.log('state panel cc', panel);
        console.log('redirect uri -', redirect_uri);
        var user_id = state.user_id;


    connection1.query('SELECT * from client where `id`="' + user_id + '"', (err, result) => {

       
  

        if (result.length != 0) {

            var password = result[0].app_id;
            var appkey = result[0].api_key;
            var DOB = result[0].api_secret;
            var uid = result[0].client_code;
        
            var pwd_sha256 = sha256(password);
            var appkey_sha256 = sha256(uid+"|"+appkey);
        
             // APP KEY sha256 uid|appkey
        
             //Example appkey genrate sha 256 uid|app key
         
               var data = {uid:uid,pwd:pwd_sha256,factor2:DOB,apkversion: '1.0.8',imei: '',vc: uid,appkey:appkey_sha256,source: 'API'}
               var raw = "jData="+JSON.stringify(data);
         
             var config = {
               method: 'post',
               url: 'https://go.mynt.in/NorenWClientTP/QuickAuth',
               headers: { 
                 'Content-Type': 'application/x-www-form-urlencoded',
               },
               data : raw
             };
             
             axios(config)
             .then(function (response) {
                 console.log("stat -",JSON.stringify(response.data.stat));
                
             
               if(response.data.stat == "Ok"){
            
                 console.log("response.data.susertoken -",response.data.susertoken);
        
                 connection1.query('UPDATE `client` SET `access_token` = "' + response.data.susertoken + '",`trading_type`="on"  WHERE `client`.`id`="' + user_id + '"', (err, result) => {
                    ///return res.redirect(redirect_uri);
                    if (result.length != 0) {
                        var dt = dateTime.create();
                        var ccdate = dt.format('Y-m-d H:M:S');
                        var trading = 'TradingON';
                        connection1.query('INSERT INTO `trading_status_client` (`client_id`,`trading`,`created_at`) VALUES ("' + user_id + '","' + trading + '","' + ccdate + '")', (err, result) => {
                            console.log("err", err);
        
                            res.send({ status:true});
                        })
                    }
                });
                 
                
        
             
             }else{
                  // res.send("else");
                  console.log("error -- 1");
               
                 res.send({ status:false ,msg:"Invalid request"});

         
               }
         
         
             })
             .catch(function (error) {
              console.log("error -- 2",error.response.data.stat);
              console.log("error -- 2",error.response.data.emsg);
              //console.log("error -- 2",error);

               if(error.response.data.stat == "Not_Ok"){
                res.send({ status:false ,msg:error.response.data.emsg});
               }else{
                res.send({ status:false ,msg:"Invalid request"});

               }
             });

            
           }

    });

   
  });



  
    
    }