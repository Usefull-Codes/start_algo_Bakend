module.exports = function(app,connection1){
    
  
app.get("/angelbroking/access_token", (req, res) => {
    
    var axios = require('axios');
    var dateTime = require('node-datetime');
   
    console.log("host",req.headers);
   
    var hosts = req.headers.host;

    var redirect = hosts.split(':')[0];
    var redirect_uri = '';
    if(redirect == "api.smartalgo.in"){
        redirect_uri = "https://test.smartalgo.in/"    
    }else{
        redirect_uri = `https://${redirect}/`  
    }

     
    if(req.query.email !=undefined){

    console.log('redirect_uri -',redirect_uri);
    
    console.log('req query -',req.query);
   
    var emailstr = req.query.email;

   // var str = "JavaScript is the programming language of the Web.";
   // this will return string before the word programming
   // var result = str.split('programming')[0]; 

     var email = emailstr.split('?auth_token=')[0]; 

     var auth_token = emailstr.split('?auth_token=')[1]; 

    //  console.log('email - ',email)
    //  console.log('auth_token - ',auth_token)
    
       connection1.query('SELECT * from client where `email`="' + email + '"', (err, result) => {
          // res.send('okkkksss');
           if (result.length != 0) {

            var user_id = result[0].id;
            
            var api_key = result[0].api_key;
             
            console.log('user id ss- ',user_id);

            var config = {
                method: 'get',
                url: 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/user/v1/getProfile',
                headers: { 
                    'Authorization': 'Bearer '+auth_token, 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json', 
                    'X-UserType': 'USER', 
                    'X-SourceID': 'WEB', 
                    'X-ClientLocalIP': 'CLIENT_LOCAL_IP', 
                    'X-ClientPublicIP': 'CLIENT_PUBLIC_IP', 
                    'X-MACAddress': 'MAC_ADDRESS', 
                    'X-PrivateKey': api_key
                  },
            };
            axios(config)
            .then(function(response) {
              
                console.log('respnse - ',response.data.status);

               if(response.data.status == true){

                console.log('respnse - ',response.data.data.clientcode);
                console.log('respnse - ',response.data.data.name);
               
                var clientcode = response.data.data.name +'(' + response.data.data.clientcode + ')';
                
                connection1.query('UPDATE `client` SET `access_token` = "' + auth_token + '",`client_code` = "' + clientcode + '",`trading_type`="on"  WHERE `client`.`id`="' + user_id + '"', (err, result1) => {
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
              }

            })
            .catch(function(error) {
               // console.log(error);
            });
              

             
           }

       });


    }else{
        return res.redirect(redirect_uri); 
    }

   });

}