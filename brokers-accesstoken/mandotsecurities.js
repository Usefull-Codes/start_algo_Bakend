module.exports = function(app,connection1){

  
    app.post("/mandotsecurities/access_token", (req, res) => {
      
     



        var axios = require('axios');
        var dateTime = require('node-datetime');
        const sha256 = require('sha256');
        var CryptoJS = require("crypto-js");
        const crypto = require ("crypto");
        var md5 = require('md5');
 


          
        console.log('req.body.State -', req.body.State);

        var state = Buffer.from(req.body.State, 'base64');  
        state = JSON.parse(state); 
        console.log('state -', state);   
        var panel = state.panel;
        var redirect_uri = state.url;
  
       // console.log('state panel cc', panel);
       // console.log('redirect uri -', redirect_uri);
      
        var user_id = state.user_id;
       // console.log('user_id -', user_id);

        var dt = dateTime.create();
        var ccdate = dt.format('Y-m-d H:M:S');

      
   connection1.query('SELECT * from client where `id`="' + user_id + '"', (err, result) => {


       if (result.length != 0) {

        var user_id = result[0].id;
       
        const appkey  = result[0].api_key;        
        const secretkey = result[0].api_secret;        
         
         
        var data = JSON.stringify({
          "secretKey": secretkey,
          "appKey": appkey,
          "source": "WebAPI"
        });
        
        var config = {
          method: 'post',
          url: 'https://webtrade.mandotsecurities.com/interactive/user/session',
          headers: { 
            'Content-Type': 'application/json'
          },
          data : data
        };
        
        axios(config)
        .then(function (response) {
          //console.log(response.data.type);
          if(response){
          if(response.data.type == "success"){
            
            console.log("okkk token",response.data.result.token);
            console.log("okkk client  code",response.data.result.userID);

            connection1.query('UPDATE `client` SET `access_token` = "' + response.data.result.token + '",`trading_type`="on",`client_code`="'+response.data.result.userID+'" WHERE `client`.`id`="' + user_id + '"', (err, result1) => {
              ///res.send({ success: 'true' });
              if (result1.length != 0) {
                  var dt = dateTime.create();
                  var ccdate = dt.format('Y-m-d H:M:S');
                  var trading = 'TradingON';
                  connection1.query('INSERT INTO `trading_status_client` (`client_id`,`trading`,`created_at`) VALUES ("' + user_id + '","' + trading + '","' + ccdate + '")', (err, result) => {
                      console.log("err", err);
                      res.send({ status: true,msg:"Login Successfully" });
                  })
              }
          }); 


          }else{
            console.log("else");
            res.send({ status: false,msg:"server error" });

            
          }
        
        }


        })
        .catch(function (error) {
          if(error.response){
          console.log("catch error",error.response.data.description);
          
          res.send({ status: false,msg:error.response.data.description });

          }
        });


          
        }


     });
      
       
    
   });







    
    }