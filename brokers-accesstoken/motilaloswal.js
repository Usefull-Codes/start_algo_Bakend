module.exports = function(app,connection1){
  
    app.get("/motilaloswal/access_token", (req, res) => {
    
        var dateTime = require('node-datetime');
       
        // console.log("host",req.headers);

        // console.log("params",req.params);

        console.log("query",req.query);


       
        var hosts = req.headers.host;
    
        var redirect = hosts.split(':')[0];
       var redirect_uri = '';
        if(redirect == "api.smartalgo.in"){
            redirect_uri = "https://test.smartalgo.in/"    
        }else{
            redirect_uri = `https://${redirect}/`  
        }
    
    
      
    
    
       console.log('redirect_uri -',redirect_uri);
        
       // console.log('req query -',req.query);
       
     
     
     var usernamestr = req.query.email;
    
    console.log("datq",usernamestr)



//     var username = usernamestr.split('?authtoken=')[0]; 
    
//     var authtoken = usernamestr.split('?authtoken=')[1]; 

//    console.log('username - ',username)
//    console.log('authtoken - ',authtoken  )

    //  return
    
       // var str = "JavaScript is the programming language of the Web.";
       // this will return string before the word programming
       // var result = str.split('programming')[0]; 
    
         var email = usernamestr.split('?authtoken=')[0]; 
    
         var authtoken = usernamestr.split('?authtoken=')[1]; 
    
        // console.log('username - ',username)
        console.log('authtoken - ',authtoken  ) 
       
         if(authtoken !=''){
           connection1.query('SELECT * from client where `email`="' + email + '"', (err, result) => {
              // res.send('okkkksss');
               if (result.length != 0) {
    
                var user_id = result[0].id;
                 
                //console.log('user id ss- ',user_id);
    
                connection1.query('UPDATE `client` SET `access_token` = "' + authtoken + '",`trading_type`="on"  WHERE `client`.`id`="' + user_id + '"', (err, result1) => {
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
    
            });

        }
    
       });
    
    }