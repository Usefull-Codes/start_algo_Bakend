module.exports = function(app,connection1){
  var verifyToken = require('./middleware/awtJwt');
  var dateTime = require('node-datetime');

  var d = new Date,
    dformat = [d.getFullYear(),
               d.getMonth()+1,
               d.getDate(),
               ].join('/')+' '+
              [d.getHours(),
               d.getMinutes(),
               d.getSeconds()].join(':');

              //  var newdate = new Date().toISOString().slice(0, 10)+" "+new Date().toLocaleTimeString().split(" ")[0]
              //  console.log(newdate)
    app.post("/smartalgo/message-broadcast",verifyToken,(req,res) => {
      var newdate = new Date().toISOString().slice(0, 10)+" "+new Date().toLocaleTimeString().split(" ")[0]
        var strategy=req.body.strategy;
        var adminId = req.body.adminId;
        var message = req.body.message;

       
        if(strategy=='' || strategy=== "all")
         {
             connection1.query("SELECT * FROM `strategy_client`", (err, result) => {
             console.log(err);
              
                var dataa=[];
                result.forEach(function(item,index){
     dataa+='("'+item.client_id+'","'+adminId+'","'+message+'","'+strategy+'","'+newdate+'"),';
   });
  //  console.log("data",dataa)
   dataa = dataa.slice(0, -1);
                 connection1.query('INSERT INTO `message_broadcast` (`client_id`,`admin_id`,`message`,`strategy`,`created_at`) VALUES'+dataa+'', (err, result) => {
                   console.log(err);
                    
                   res.send({ messagesBroadcast: result });
              
                   });
              
            });
         }else
         {   
            connection1.query("SELECT * FROM `strategy_client` WHERE `strategy`='"+strategy+"'", (err, result) => {
              
        
               var dataa=[];
               result.forEach(function(item,index){
               
    dataa+='("'+item.client_id+'","'+adminId+'","'+message+'","'+strategy+'","'+newdate+'"),';
  });
  dataa = dataa.slice(0, -1);

  if(dataa.length === 0) {
return res.send({ messagesBroadcast: [] });
  }else{
                connection1.query('INSERT INTO `message_broadcast` (`client_id`,`admin_id`,`message`,`strategy`,`created_at`) VALUES'+dataa+'', (err, result) => {
                  console.log(err);
                     // console.log(result);
                     
                     res.send({ messagesBroadcast: result });
                  });
               
                }
                  
            });
        }
        });


    
      
        
        
        app.get("/smartalgo/msg-added",verifyToken,(req,res) => {
          var newdate = new Date().toISOString().slice(0, 10)+" "+new Date().toLocaleTimeString().split(" ")[0]
          var d1 = (newdate.split(" ")[0]).split("/").join("-")
        // console.log("ddd1",d1)
        var dt = dateTime.create();
        dt.offsetInDays(-1);
        var ccdate = dt.format('Y-m-d H:M:S');
        // console.log("ccdate",ccdate)

        connection1.query("SELECT * FROM message_broadcast WHERE created_at >= '"+ccdate.split(" ")[0]+"'  GROUP BY message,strategy ORDER BY `id` DESC"
          , (err, result) => {
            // console.log("res1",result);            
            res.send({ msg: result });
          })
       
        });

        app.post("/smartalgo/msg-broadcast-delete",verifyToken,(req,res) => {
          var msg = req.body.msg;
          var strategy = req.body.strategy;
        //  console.log('msg -- ',msg);
        //  console.log('strategy -- ',strategy);
          //return
          connection1.query('DELETE from message_broadcast WHERE message="'+msg+'" AND strategy="'+strategy+'"',(err, result) => {
            console.log(err);
            console.log("result",result)
            res.send(result)
          })
        })



         // Get Licence Month Count from 

         app.get("/getlicence/month",(req,res) => {
          var ArrayMonth = []
          connection1.query("SELECT name FROM `company_name` WHERE `id` = 1" , (err, company_name) => {       
        connection1.query("SELECT SUM(licence) as abc FROM `count_licence`" , (err, total) => {
          connection1.query("SELECT SUM(licence) as abc_previous FROM `count_licence` WHERE  MONTH(date_time) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)" , (err, previousMonth) => {
            connection1.query("SELECT SUM(licence) as abc_current FROM `count_licence` WHERE  MONTH(date_time) = MONTH(CURRENT_DATE)" , (err, currentMOnth) => {
              ArrayMonth.push(company_name[0].name,total[0].abc,previousMonth[0].abc_previous,currentMOnth[0].abc_current)         
              console.log("ArrayMonth",ArrayMonth);   
      
               res.send(ArrayMonth);
          })
        })
      })
    })
       
        });



        app.get("/getlicence/month/countApi",(req,res) => {
          var ArrayCountApi = [];
            
                connection1.query("SELECT name FROM `company_name` WHERE `id` = 1" , (err, company_name) => {  
                    
                ArrayCountApi.push(company_name[0].name);
                connection1.query("SELECT `count_broker_apikey`.`client_id`, `client`.`username` FROM `count_broker_apikey` LEFT JOIN `client` ON client.id = count_broker_apikey.client_id GROUP BY `count_broker_apikey`.`client_id`" , (err, all_client_id) => { 
              
                all_client_id.forEach(function(item,index){
                          
                  // console.log('client id -',item.client_id, 'username' ,item.username);
                      
                  connection1.query("SELECT COUNT(api_key) as api_key_count FROM `count_broker_apikey` WHERE `client_id` = '"+item.client_id+"' AND `api_key` IS NOT NULL AND `api_key` != 'undefined'" , (err, api_key_count) => { 
      
                     connection1.query("SELECT COUNT(api_secret) as api_secret_count FROM `count_broker_apikey` WHERE `client_id` = '"+item.client_id+"' AND `api_secret` IS NOT NULL AND `api_secret` != 'undefined'" , (err, api_secret_count) => { 
      
                      connection1.query("SELECT COUNT(broker) as broker_count FROM `count_broker_apikey` WHERE `client_id` = '"+item.client_id+"' AND `broker` IS NOT NULL AND `broker` != 'undefined'" , (err, broker_count) => { 
      
                       // console.log("client id -",item.client_id , 'Api count -',api_key_count[0].api_key_count ,'secret key -',api_secret_count[0].api_secret_count ,'Broker-Count', broker_count[0].broker_count);  
                        //console.log("client id -",item.client_id ,'count -',api_secret_count[0].api_secret_count);  
                      
      
                        ArrayCountApi.push('Username : '+item.username+ '  Api key Count : '+api_key_count[0].api_key_count+'   Api secret Key Count : '+api_secret_count[0].api_secret_count+' Broker Count :'+broker_count[0].broker_count)         
                     
                       // console.log("All details",ArrayCountApi);
                       console.log("index",  index);
      
                        if(all_client_id.length-1 == index){
                          console.log('if');  
                          console.log("ArrayCountApi",ArrayCountApi);                
                          res.send(ArrayCountApi);
                          
                          }else{
                            console.log('else');  
      
                          }
      
                      
                        });  
                  
                     });  
                   });  
                      
                   
              
                 });
                 
                
                 
              }) 
      
             
            }) 
      
           
                    
        });





        app.get("/getlicence/month/AllcountApiKey",(req,res) => { 

          connection1.query("SELECT COUNT(count_broker_apikey.id) as api_key_count FROM `count_broker_apikey` LEFT JOIN `client` ON client.id = count_broker_apikey.client_id WHERE `count_broker_apikey`.`api_key` IS NOT NULL" , (err, AllcountApiKey) => { 
             
            res.send({'AllCountApiKey':AllcountApiKey[0].api_key_count});
  
          }) 
                   
        });

        app.get("/getlicence/month/AllcountSecretKey",(req,res) => { 

          connection1.query("SELECT COUNT(count_broker_apikey.id) as api_secret_count FROM `count_broker_apikey` LEFT JOIN `client` ON client.id = count_broker_apikey.client_id WHERE `count_broker_apikey`.`api_secret` IS NOT NULL" , (err, AllcountSecretKey) => { 
             
            res.send({'AllcountSecretKey':AllcountSecretKey[0].api_secret_count});
  
          }) 
                   
        });

        app.get("/getlicence/month/AllcountBroker",(req,res) => { 

          connection1.query("SELECT COUNT(count_broker_apikey.id) as broker_count FROM `count_broker_apikey` LEFT JOIN `client` ON client.id = count_broker_apikey.client_id WHERE `count_broker_apikey`.`broker` IS NOT NULL" , (err, AllcountBroker) => { 
             
            res.send({'AllcountBroker':AllcountBroker[0].broker_count});
  
          }) 
                   
        });

        
}