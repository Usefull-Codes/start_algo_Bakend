module.exports = function(app,connection1){
  
app.get("/zerodha/access_token", (req, res) => {

   
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


    //res.send(redirect_uri);


    console.log('redirect_uri -',redirect_uri);
    
    console.log('req query -',req.query);
   
 
 
 var emailstr = req.query.email;



   // var str = "JavaScript is the programming language of the Web.";
   // this will return string before the word programming
   // var result = str.split('programming')[0]; 

     var email = emailstr.split('?request_token=')[0]; 

     //var request_token = emailstr.split('?request_token=')[1]; 
     var request_token = req.query.request_token; 

   //  console.log('email - ',email)
   //  console.log('request_token - ',request_token)

   //  res.send({"request_token":request_token,"email":email});
    

       connection1.query('SELECT * from client where `email`="' + email + '"', (err, result) => {
          // res.send('okkkksss');
           if (result.length != 0) {

            var user_id = result[0].id;

            var api_key = result[0].api_key;
            var api_secret = result[0].api_secret;

            console.log('api_key - ',api_key); 
            console.log('request_token - ',request_token); 
            console.log('api_secret - ',api_secret); 


           var checksum = sha256(api_key + request_token + api_secret);


          var data = 'api_key='+api_key+'&request_token='+request_token+'&checksum='+checksum;

          var config = {
            method: 'post',
            url: 'https://api.kite.trade/session/token',
            headers: {
                'X-Kite-Version': '3'
            },
            data: data
        };
  
        axios(config)
            .then(function(response) {
               
                console.log('respons - ',response); 
                console.log('status  - ',response.data.status); 
                console.log('acess token - ',response.data.data.access_token); 

             if(response.data.status == "success"){   
         
            connection1.query('UPDATE `client` SET `access_token` = "' + response.data.data.access_token + '",`trading_type`="on" ,`client_code`="'+response.data.data.public_token+'" WHERE `client`.`id`="' + user_id + '"', (err, result1) => {
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
               console.log('access token error ',error);
            }); 
         

             
           }

       });

   });

}