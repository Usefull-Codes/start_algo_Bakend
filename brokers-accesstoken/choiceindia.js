module.exports = function(app,connection1){
   
    var dateTime = require('node-datetime');
  
    app.post("/choiceindia/access_token", (req, res) => {
       
       

        var axios = require('axios');
        var dateTime = require('node-datetime');
        const sha256 = require('sha256');
        var CryptoJS = require("crypto-js");
        const crypto = require ("crypto");
  
          
    
       
        console.log('req.body.State -', req.body.State);

        var state = Buffer.from(req.body.State, 'base64');  
        console.log('state -', state);   
        state = JSON.parse(state); 
        var panel = state.panel;
        var redirect_uri = state.url;
  
        console.log('state panel cc', panel);
        console.log('redirect uri -', redirect_uri);
      
        var user_id = state.user_id;
        console.log('user_id -', user_id);

        var dt = dateTime.create();
        var ccdate = dt.format('Y-m-d H:M:S');
        
        connection1.query('SELECT * from client where `id`="' + user_id + '"', (err, result) => {


       if (result.length != 0) {

        var user_id = result[0].id;
       
        const algorithm = "aes-256-cbc"; 
        // generate 16 bytes of random data
        const EncryptionIV  = result[0].api_type;        
        // protected data
        const password = result[0].app_id;        
        // secret key generate 32 bytes of random data
        const EncryptionSecretKey  = result[0].api_secret;         
        // the cipher function
        const cipher  =  crypto.createCipheriv(algorithm, EncryptionSecretKey, EncryptionIV);
                let encryptedData = cipher.update(password, "utf-8", "base64");
        encryptedData += cipher.final('base64');
        console.log("encryptedData Password -",encryptedData);





        // const decipher = crypto.createDecipheriv(algorithm, EncryptionSecretKey, EncryptionIV);
        // let decryptedData = decipher.update(encryptedData, "base64", "utf-8");
        // decryptedData += decipher.final("utf8");
        // console.log("Decrypted message: " + decryptedData);
        
     

         var data = JSON.stringify({
            "UserId": result[0].demat_userid,
            "Pwd":encryptedData
          });
     
          console.log('USERID- ',result[0].demat_userid);
          console.log('Pwd- ',encryptedData);
        // var data = JSON.stringify({
        //     "UserId": "IBG393",
        //     "Pwd":"FaI50gjlg5xF"
        //   });
      
     
              var config = {
                 method: 'post',
                 url: 'https://finx.choiceindia.com/api/OpenAPI/Login',
                 headers: {
                     'VendorId': result[0].client_code,
                     'VendorKey': result[0].api_key,
                     'Content-Type': 'application/json'
                 },
                 data: data
             };
       
             axios(config)
                 .then(function(response) {
                    
                     console.log('respons Choise India Token- ',response);
                   
                    
                    // res.send(response);

              if(response.data.Status == "Success"){


                  console.log('respons if - ',response.data.Status);
               //   console.log('Acceess token -',response.data.Response.SessionId);

                    connection1.query('UPDATE `client` SET `access_token` = "' + response.data.Response.SessionId + '",`trading_type`="on" WHERE `client`.`id`="' + user_id + '"', (err, result1) => {
                       ///res.send({ success: 'true' });
                       if (result1.length != 0) {
                           var dt = dateTime.create();
                           var ccdate = dt.format('Y-m-d H:M:S');
                           var trading = 'TradingON';
                           connection1.query('INSERT INTO `trading_status_client` (`client_id`,`trading`,`created_at`) VALUES ("' + user_id + '","' + trading + '","' + ccdate + '")', (err, result) => {
                               console.log("err", err);
    
                               res.send({ success: 'true' });
                           })
                       }
                   }); 



                }else{
                    console.log('respons else - ',response.data.Status);

                    if(response.data.Response == null){
                        console.log(' incorrect client password - ',response.data.Reason);

                        connection1.query('INSERT INTO `broker_response`(`client_id`,`reject_reason`,`trading_status`,`created_at`) VALUES ("' + user_id + '","' + response.data.Reason + '","'+response.data.Status+'","' + ccdate + '")', (err1, signal_status) => {
                            // console.log('eroor query -',err1);
                            res.send({ success: 'true' });
                         });
                        
                    }else{
                        console.log('masg incorrect client id - ',response.data.Response.LogonMessage);

                        connection1.query('INSERT INTO `broker_response`(`client_id`,`reject_reason`,`trading_status`,`created_at`) VALUES ("' + user_id + '","' + response.data.Response.LogonMessage + '","'+response.data.Status+'","' + ccdate + '")', (err1, signal_status) => {
                            // console.log('eroor query -',err1);
                          res.send({ success: 'true' });
                         });
                    }
                }
    
                


                 })
                 .catch(function(error) {
                   console.log('access token error ',error);
                    console.log('ss -',error);
                   if(error.response){
                    connection1.query('INSERT INTO `broker_response`(`client_id`,`reject_reason`,`trading_status`,`created_at`) VALUES ("' + user_id + '","' + error.response.data + '","Error","' + ccdate + '")', (err1, signal_status) => {
                        // console.log('eroor query -',err1);
                     });
                    }

                 }); 


                }


                });
      
       
    
       });



   

    //    setInterval(function () {

    //     var dt = dateTime.create();
    //     var ccdate = dt.format('Y-m-d');

    //     console.log('ccdate',ccdate);
          
    //     connection1.query('SELECT * FROM `client` WHERE `broker` = "14"', (err, all_client) => {
         
    //         all_client.forEach(element => {
    //             console.log('ids -',element.id);   
    //             console.log('client_code  -',element.client_code);   

               
        
    //             console.log('ccdate 2',ccdate);

    //             connection1.query('SELECT `order_id`,`client_id`,`created_at` FROM `broker_response` WHERE `client_id` = "'+element.id+'" AND `order_id` IS NOT NULL AND `order_id` != "" AND `order_id`!= "undefined" AND `created_at` >= "'+ccdate+'"', (err, client_order_id) => {

    //               console.log('ee-','SELECT `order_id`,`client_id` FROM `broker_response` WHERE `client_id` = "'+element.id+'" AND `order_id` IS NOT NULL AND `order_id` != "" AND `order_id`!= "undefined" AND `created_at` >= "'+ccdate+'"');


             
                  
    //                 if(client_order_id.length > 0 ){

    //                     client_order_id.forEach(element1 => {
                            
    //                         console.log('ids -',element.id);
    //                         console.log('client_order_id -',element1.order_id);

    //                         var axios = require('axios');

    //                         var config = {
    //                             method: 'get',
    //                             url: 'https://uat.jiffy.in/api/OpenAPI/OrderBook',
    //                             headers: { 
    //                                 'VendorId': element.client_code, 
    //                                 'VendorKey': element.api_key, 
    //                                 'Authorization':'Bearer '+element.access_token,
    //                                 'Content-Type': 'application/json'
    //                               }
    //                           };
                              
                              
    //                           axios(config)
    //                           .then(function (response) {
                             
    //                             response.data.Response.Orders.forEach(element2 => {
    //                                 console.log(element2.ClientOrderNo);
                            
    //                                 if(element2.ClientOrderNo == element1.order_id){
    //                                     console.log("ErrorString -",element2.ErrorString);
    //                                     console.log("OrderStatus -",element2.OrderStatus);
                
                
                
                                       
                
    //                                     connection1.query('UPDATE `broker_response` SET `order_status`="'+element2.OrderStatus+'" ,`reject_reason`="'+element2.ErrorString+'"  WHERE `order_id`=' + element1.order_id, (err, result) => {
    //                                      //console.log("err", err);
    //                                     });
                                         
                                
                
                
                
    //                                 }
                            
                                    
    //                              });
                            
    //                           })
    //                           .catch(function (error) {
    //                             console.log(error);
    //                           });

                            
    //                     });
                              
      
    //                 }else{
    //                  // console.log('ids -',client_order_id[0].client_id);
    //                 }
      
    //               });

       
    //      });           


    //     });

    // },30*1000);


    // setInterval(function () {

    //     var dt = dateTime.create();
    //     var ccdate = dt.format('Y-m-d');

    //     console.log('ccdate',ccdate);
          
    //     connection1.query('SELECT `client`.*, `broker_response`.`order_status`,`broker_response`.`order_id`,`broker_response`.`client_id` FROM `client` LEFT JOIN `broker_response` ON `broker_response`.`client_id` = `client`.`id` WHERE `client`.`broker` = "14" AND `broker_response`.`order_id` IS NOT NULL AND `broker_response`.`order_id` != "" AND `broker_response`.`order_id`!= "undefined" AND `broker_response`.`created_at` >= "'+ccdate+'" AND `broker_response`.`order_status` IS NULL GROUP BY `broker_response`.`client_id`', (err, all_client) => {

    //         // console.log('ee -','SELECT `client`.*,`broker_response`.`order_status`, `broker_response`.`order_id`,`broker_response`.`client_id` FROM `client` LEFT JOIN `broker_response` ON `broker_response`.`client_id` = `client`.`id` WHERE `client`.`broker` = "14" AND `broker_response`.`order_id` IS NOT NULL AND `broker_response`.`order_id` != "" AND `broker_response`.`order_id`!= "undefined" AND `broker_response`.`created_at` >= "'+ccdate+'" AND `broker_response`.`order_status` IS NULL')
         
    //         if(all_client.length > 0 ){
    //         all_client.forEach(element => {
    //             console.log('ids -',element.id);   
    //             console.log('client_code  -',element.client_code);   



                 
    //                                  var axios = require('axios');

    //                                     var config = {
    //                                         method: 'get',
    //                                         url: 'https://uat.jiffy.in/api/OpenAPI/OrderBook',
    //                                         headers: { 
    //                                             'VendorId': element.client_code, 
    //                                             'VendorKey': element.api_key, 
    //                                             'Authorization':'Bearer '+element.access_token,
    //                                             'Content-Type': 'application/json'
    //                                           }
    //                                       };
                                          
                                          
    //                                       axios(config)
    //                                       .then(function (response) {
                                         
    //                                         response.data.Response.Orders.forEach(element2 => {
    //                                             console.log(element2.ClientOrderNo);
                                        
    //                                            // if(element2.ClientOrderNo == element.order_id){
    //                                                 console.log("ErrorString -",element2.ErrorString);
    //                                                 console.log("OrderStatus -",element2.OrderStatus);
    //                                                 console.log("order_id -",element2.ClientOrderNo);
                            
                                                                
                            
    //                                                 connection1.query('UPDATE `broker_response` SET `order_status`="'+element2.OrderStatus+'" ,`reject_reason`="'+element2.ErrorString+'"  WHERE `order_id`= "'+ element2.ClientOrderNo+'"', (err, result) => {
    //                                                     console.log("Update err", err);
    //                                                     console.log("resultr", result);
    //                                                 });
                                                                         
                            
                            
    //                                          //   }
                                        
                                                
    //                                          });
                                        
    //                                       })
    //                                       .catch(function (error) {
    //                                         console.log(error);
    //                                       });




                   

                 

       
    //        });           

    //     }

    //     });

    // },30000);





    
    }