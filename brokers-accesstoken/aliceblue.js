module.exports = function(app,connection1){
  
    app.get("/aliceblue/access_token", (req, res) => {


     
        var axios = require('axios');
        var dateTime = require('node-datetime');
        const sha256 = require('sha256');
       
        console.log("host",req.headers);
       
        var hosts = req.headers.host;
    
        var redirect = hosts.split(':')[0];
       var redirect_uri = '';
        if(redirect == "api.smartalgo.in"){
            redirect_uri = "https://test.smartalgo.in/"    
        }else{
            redirect_uri = `https://${redirect}/`  
        }
    

        // console.log('redirect_uri -',redirect_uri);      
        // console.log('req query -',req.query);
        var emailstr = req.query.email;
    
       // var str = "JavaScript is the programming language of the Web.";
       // this will return string before the word programming
       // var result = str.split('programming')[0]; 
    
         var email = emailstr.split('?authCode=')[0]; 
    
         var authCode = emailstr.split('?authCode=')[1]; 

         connection1.query('SELECT * from client where `email`="' + email + '"', (err, result) => {


            if (result.length != 0) {

        var user_id = result[0].id;
        var apiSecret = result[0].api_secret;
        // console.log('user id ss- ',user_id);
         var userId =  req.query.userId;
    
        //  console.log('email - ',email)
        //  console.log('authCode - ',authCode)
        //  console.log('userId - ',userId)
    
         var Encrypted_data = sha256(userId + authCode + apiSecret);
              
         //   var data=  {
         //         "userId":userId,
         //         "userData":Encrypted_data 
         //      } ;
     
         var data = { "checkSum" : Encrypted_data }
      
     
              var config = {
                 method: 'post',
                 url: 'https://ant.aliceblueonline.com/rest/AliceBlueAPIService/sso/getUserDetails',
                 headers: {
                     'Content-Type': 'application/json'
                 },
                 data: data
             };
       
             axios(config)
                 .then(function(response) {
                    
                     console.log('respons - ',response);
                     response.data.userSession;
              
    
                connection1.query('UPDATE `client` SET `access_token` = "' + response.data.userSession + '",`trading_type`="on",`client_code`="'+userId+'" WHERE `client`.`id`="' + user_id + '"', (err, result1) => {
                       ///return res.redirect(redirect_uri);
                       if (result1.length != 0) {
                           var dt = dateTime.create();
                           var ccdate = dt.format('Y-m-d H:M:S');
                           var trading = 'TradingON';
                           connection1.query('INSERT INTO `trading_status_client` (`client_id`,`trading`,`created_at`) VALUES ("' + user_id + '","' + trading + '","' + ccdate + '")', (err, result) => {
                               console.log("err", err);
    
                               return res.redirect(redirect_uri);
                           })
                       }
                   });     



                 })
                 .catch(function(error) {
                    console.log('access token error ',error);
                 }); 


                }


                });
      
       
    
       });
    

       app.get("/AliceBlue", (req, res) => {
        
        console.log("host",req.headers);
       
        var hosts = req.headers.host;

        const sha256 = require('sha256');
        var axios = require('axios');
        var dateTime = require('node-datetime');

       // var redirect_uri = hosts+'/#/admin/executivetrade';


         

        
        var redirect = hosts.split(':')[0];
       var redirect_uri = '';
        if(redirect == "api.smartalgo.in"){
            redirect_uri = "https://test.smartalgo.in/#/admin/executivetrade"    
        }else{
            redirect_uri = `https://${redirect}/#/admin/executivetrade`  
        }


    
        connection1.query('SELECT * FROM `alicebluetoken` LIMIT 1', (err, alice_blue_token) => {

        //     console.log("check idddd Arr",alice_blue_token[0].id);
        //     return 
        //    var data_admin = JSON.parse(alice_blue_token[0]);
        //    console.log("check idddd ---",typeof data_admin);
        //    //res.send( data_admin)
        //    res.send( data_admin)
        //   //  res.send(alice_blue_token[0].)


        //    return

        var id = alice_blue_token[0].id;

        var apiSecret = alice_blue_token[0].api_secret;
        // console.log('user id ss- ',user_id);
        var userId =  req.query.userId;
        
        var authCode =  req.query.authCode;

         
    
        //  console.log('email - ',email)
        //  console.log('authCode - ',authCode)
        //  console.log('userId - ',userId)
    
         var Encrypted_data = sha256(userId + authCode + apiSecret);
              
         //   var data=  {
         //         "userId":userId,
         //         "userData":Encrypted_data 
         //      } ;


       
     
         var data = { "checkSum" : Encrypted_data }
      
     
              var config = {
                 method: 'post',
                 url: 'https://ant.aliceblueonline.com/rest/AliceBlueAPIService/sso/getUserDetails',
                 headers: {
                     'Content-Type': 'application/json'
                 },
                 data: data
             };
       
             axios(config)
                 .then(function(response) {

                    var dt = dateTime.create();
                    var ccdate = dt.format('Y-m-d H:M:S');
                    
                   console.log('respons fffff- ',response);
               
                 if(response.data.stat == "Ok"){
                 var trading_status = 1;
                   
                connection1.query('UPDATE `alicebluetoken` SET `access_token` = "' + response.data.userSession + '",`trading`="'+trading_status+'",`client_code`="'+userId+'" ,`update_at`="'+ccdate+'" WHERE `id`="' + id + '"', (err, result1) => {

                    //res.send({status:true})
                    return res.redirect(redirect_uri);
                    
                });     
                
            }else{
                      return res.redirect(redirect_uri);
                   // res.send({status:false})
                  }

                 })
                 .catch(function(error) {
                    console.log('access token error ',error);
                 }); 





        });

     

    });
    
    }