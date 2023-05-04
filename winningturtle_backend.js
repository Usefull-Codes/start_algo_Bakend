const express = require("express");
const fileUpload = require("express-fileupload")
const fs = require('fs');
var bodyparser = require('body-parser');
const https = require('https');
const app = express();
const socketIo = require("socket.io");
const http = require("http");

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
const mysql = require('mysql');
var cors = require('cors');
var dateTime = require('node-datetime');
const corsOpts = {
    origin: '*',

    methods: [
        'GET',
        'POST',
    ],

    allowedHeaders: [
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept", "authorization",
    ],
};
app.use(cors(corsOpts));
app.use(fileUpload());

var privateKey = fs.readFileSync('../crt/privkey.pem', 'utf8');
var certificate = fs.readFileSync('../crt/fullchain.pem', 'utf8');
var credentials = { key: privateKey, cert: certificate };

var httpsServer = https.createServer(credentials, app);
const server = http.createServer(app);
const io = socketIo(httpsServer, {
    cors: {
        origin: "*",
        credentials: true
    }
});
io.on("connection", (socket) => {

    socket.on("message_broadcast", (data) => {
        socket.broadcast.emit("notification_onClient", data);
    });
    socket.on("message_help_center", (data) => {
        socket.broadcast.emit("notifi_onAdmin", data);
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});



// app.post("/getdomain", (req, res) => {

// console.log('domain Name',req.body.domain) ;
//  var database_connect='';
// if(req.body.domain == "smartalgo"){
//  database_connect = 'smartalgo_node';
// }else if(req.body.domain == "quickalgo"){
//  database_connect = "quickalgo_node"; 
// }
 


// console.log("sakir ssss",req.body.domain);

connection1 = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'vLBA}z)/8/>%W/cy',
    database: 'winningturtle_node',
    multipleStatements: true
});

// const connection1 = eval(req.body.domain);

// console.log("sakir");

//connection1.connect((err) => {
//    if (err) throw err;
//    console.log('Connected to MySQL Server SHAKIR ',req.body.domain);
//});
connection1.connect((err) => {
    if (err) throw err;
    console.log(`Connected to MySQL Server SSSS`);
});


// Broker AcessToken
require('./brokers-accesstoken/angelbroking')(app,connection1);
require('./brokers-accesstoken/aliceblue')(app,connection1);
require('./brokers-accesstoken/b2c')(app,connection1);
require('./brokers-accesstoken/fivepaisa')(app,connection1);
require('./brokers-accesstoken/fyers')(app,connection1);
require('./brokers-accesstoken/markethub')(app,connection1);
require('./brokers-accesstoken/mastertrust')(app,connection1);
require('./brokers-accesstoken/zerodha')(app,connection1);
require('./brokers-accesstoken/zebull')(app,connection1);
require('./brokers-accesstoken/anandrathi')(app,connection1);
require('./brokers-accesstoken/mandotsecurities')(app,connection1);
require('./brokers-accesstoken/choiceindia')(app,connection1);
require('./brokers-accesstoken/motilaloswal')(app,connection1);
require('./brokers-accesstoken/kotak')(app,connection1);



//admin
require('./admin/services')(app, connection1);
require('./admin/group-service')(app, connection1);
require('./admin/Login')(app, connection1);
require('./admin/clients')(app, connection1);
require('./admin/signals')(app, connection1);
require('./admin/messageBroadcast')(app, connection1);
require('./admin/dashboard')(app, connection1);
require('./admin/reports')(app, connection1);
require('./admin/strategy')(app, connection1);
require('./admin/system')(app, connection1);
require('./admin/transactionlicence')(app, connection1);
require('./admin/adminprofile')(app, connection1);
require('./admin/cron')(app, connection1);
require('./admin/subAdmin')(app, connection1);
require('./Common/SendEmails/CommonEmail')(app, connection1);
require('./admin/tradingstatus')(app, connection1);
require('./admin/ThemeColorsSet')(app, connection1);
require('./admin/executeTrade')(app, connection1,io)




//client
require('./client/Login')(app, connection1);
require('./client/dashboard')(app, connection1);
require('./client/Signals')(app, connection1);
require('./client/HelpCenter')(app, connection1);
require('./client/Tradehistory')(app, connection1);
require('./client/TradingStatus')(app, connection1);
require('./client/BrokerResponse')(app, connection1);

app.get("/testing", (req, res) => {
  res.send("okkkkkkkkkkkkkkkk");
});

app.get("/smartalgo/tokensymbol/update", (req, res) => {

    
    connection1.query('SELECT * FROM `token_symbol` WHERE (`symbol` = "BANKNIFTY" ||  `symbol` = "NIFTY") AND `segment` = "O" AND `option_type` = "PE"', (err, tokenSymbol) => {
        //console.log(tokenSymbol);

        tokenSymbol.forEach(function(element) {


        // console.log('symbol',element.symbol , 'strike ',element.strike , 'expiry_date_month -',element.expiry_month_year, 'expiry date -',element.expiry_date)

    
         connection1.query('SELECT * FROM (SELECT * FROM `token_symbol` where `symbol` = "'+element.symbol+'" AND `expiry_month_year` = "'+element.expiry_month_year+'" AND `strike` = "'+element.strike+'" AND `option_type` ="'+element.option_type+'" ) as c  ORDER BY expiry_date DESC limit 1', (err, tokenSymbol_match) => {

           
            var id = tokenSymbol_match[0].id;
            var expirystr = tokenSymbol_match[0].expiry_str;
            var symbol = tokenSymbol_match[0].symbol;
            var strike = tokenSymbol_match[0].strike;
            var option_type = tokenSymbol_match[0].option_type;
            

            var moth_str = expirystr.slice(2,5); 

            var year_end = expirystr.slice(-2);

           var  tradesymbol_m_w = symbol+year_end+moth_str+strike+option_type;
           
           connection1.query('UPDATE `token_symbol` SET `tradesymbol_m_w`="' + tradesymbol_m_w + '" WHERE `id`=' + id, (err, result) => {
           // console.log("err", err);
            
          
           });  

           
        });
     
         
        });

        //res.send({ 'status': tokenSymbol }); 
   
    });

});

app.get("/smartalgo/tokensymbol/update/CE", (req, res) => {

    
    connection1.query('SELECT * FROM `token_symbol` WHERE (`symbol` = "BANKNIFTY" ||  `symbol` = "NIFTY") AND `segment` = "O" AND `option_type` = "CE"', (err, tokenSymbol) => {
        //console.log(tokenSymbol);

        tokenSymbol.forEach(function(element) {


        // console.log('symbol',element.symbol , 'strike ',element.strike , 'expiry_date_month -',element.expiry_month_year, 'expiry date -',element.expiry_date)

    
         connection1.query('SELECT * FROM (SELECT * FROM `token_symbol` where `symbol` = "'+element.symbol+'" AND `expiry_month_year` = "'+element.expiry_month_year+'" AND `strike` = "'+element.strike+'" AND `option_type` ="'+element.option_type+'" ) as c  ORDER BY expiry_date DESC limit 1', (err, tokenSymbol_match) => {

           
            var id = tokenSymbol_match[0].id;
            var expirystr = tokenSymbol_match[0].expiry_str;
            var symbol = tokenSymbol_match[0].symbol;
            var strike = tokenSymbol_match[0].strike;
            var option_type = tokenSymbol_match[0].option_type;
            

            var moth_str = expirystr.slice(2,5); 

            var year_end = expirystr.slice(-2);

           var  tradesymbol_m_w = symbol+year_end+moth_str+strike+option_type;
           
           connection1.query('UPDATE `token_symbol` SET `tradesymbol_m_w`="' + tradesymbol_m_w + '" WHERE `id`=' + id, (err, result) => {
           // console.log("err", err);
            
          
           });  

           
        });
     
         
        });

        //res.send({ 'status': tokenSymbol }); 
   
    });

});






app.get("/smartalgo/tokensymbol/update/future", (req, res) => {

     


    connection1.query('SELECT * FROM `token_symbol` WHERE `segment` = "F"', (err, tokenSymbol) => {
        //console.log(tokenSymbol);

        tokenSymbol.forEach(function(element) {


       

           
            var id = element.id;
            var expirystr = element.expiry;
            var symbol = element.symbol;
            var FUT = "FUT";
            

            var moth_str = expirystr.slice(2,4); 
            var month_string =''

            if(moth_str == "01"){
                month_string = "JAN";
            }else if(moth_str == "02"){
                month_string = "FEB";
            }
            else if(moth_str == "03"){
                month_string = "MAR";
            }
            else if(moth_str == "04"){
                month_string = "APR";
            }
            else if(moth_str == "05"){
                month_string = "MAY";
            }
            else if(moth_str == "06"){
                month_string = "JUN";
            }
            else if(moth_str == "07"){
                month_string = "JUL";
            }
            else if(moth_str == "08"){
                month_string = "AUG";
            }
            else if(moth_str == "09"){
                month_string = "SEP";
            }
            else if(moth_str == "10"){
                month_string = "OCT";
            }
            else if(moth_str == "11"){
                month_string = "NOV";
            }
            else if(moth_str == "12"){
                month_string = "DEC";
            }
                 

           var year_end = expirystr.slice(-2);

           var  tradesymbol_m_w = symbol+year_end+month_string+FUT;

           
           
           connection1.query('UPDATE `token_symbol` SET `tradesymbol_m_w`="' + tradesymbol_m_w + '" WHERE `id`=' + id, (err, result) => {
            console.log("err", err);     
          
           });  

           
  
     
         
        });

     res.send({ 'status': 'okkk' }); 
   
    });

});






app.get("/smartalgo/tokensymbol", (req, res) => {



    connection1.query('TRUNCATE TABLE  token_symbol', (err, result) => {});



    var d = new Date();
    dformat = [d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    ].join('/') + ' ' + [d.getHours(),
        d.getMinutes(),
        d.getSeconds()
    ].join(':');
    var axios = require('axios');
    var config = {
        method: 'get',
        url: 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json',
    };

    axios(config)
        .then(function(response) {

            // res.send(response.data);


            response.data.forEach(function(element) {
                //  var option_type = element.symbol.substr(-2, 2);
                //console.log('okkk',option_type);


                //var option_type = element.symbol;
                var option_type = element.symbol.slice(-2);

                //  console.log('okk-',element.symbol);
                //   console.log('sss- ',option_type);


                if (element.instrumenttype == 'FUTSTK') {

                    var expiry_s = element.expiry

                    var expiry_s = dateTime.create(expiry_s);
                    var expiry = expiry_s.format('dmY');

                    var strike_s = parseInt(element.strike);
                    var strike = parseInt(strike_s.toString().slice(0, -2));
                    //console.log(element.token);



                    connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`, `strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`) VALUES ("' + element.name + '","' + expiry + '","' + strike + '","","F","' + element.token + '","' + element.lotsize + '","' + element.symbol + '")', (err, result) => {

                    });

                } else if (element.instrumenttype == 'FUTIDX') {

                    var expiry_s = element.expiry

                    var expiry_s = dateTime.create(expiry_s);
                    var expiry = expiry_s.format('dmY');

                    var strike_s = parseInt(element.strike);
                    var strike = parseInt(strike_s.toString().slice(0, -2));
                    //console.log(element.token);



                    connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`, `strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`) VALUES ("' + element.name + '","' + expiry + '","' + strike + '","","F","' + element.token + '","' + element.lotsize + '","' + element.symbol + '")', (err, result) => {

                    });

                } else if (element.instrumenttype == 'FUTCOM') {

                    var expiry_s = element.expiry
                    var expiry_s = dateTime.create(expiry_s);
                    var expiry = expiry_s.format('dmY');

                    var strike_s = parseInt(element.strike);
                    var strike = parseInt(strike_s.toString().slice(0, -2));
                    // console.log(element.token);

                    var option_type = element.symbol.slice(-2);




                    connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`, `strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`) VALUES ("' + element.name + '","' + expiry + '","' + strike + '","' + option_type + '","MF","' + element.token + '","' + element.lotsize + '","' + element.symbol + '")', (err, result) => {

                    });

                } else if (element.instrumenttype == 'OPTIDX') {

                    var expiry_s = element.expiry
                    var expiry_s = dateTime.create(expiry_s);
                    var expiry = expiry_s.format('dmY');

                    var strike_s = parseInt(element.strike);
                    var strike = parseInt(strike_s.toString().slice(0, -2));
                    //console.log(element.token);

                    var option_type = element.symbol.slice(-2);




                    connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`, `strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`) VALUES ("' + element.name + '","' + expiry + '","' + strike + '","' + option_type + '","O","' + element.token + '","' + element.lotsize + '","' + element.symbol + '")', (err, result) => {

                    });

                } else if (element.instrumenttype == 'OPTSTK') {

                    var expiry_s = element.expiry
                    var expiry_s = dateTime.create(expiry_s);
                    var expiry = expiry_s.format('dmY');

                    var strike_s = parseInt(element.strike);
                    var strike = parseInt(strike_s.toString().slice(0, -2));
                    // console.log(element.token);

                    var option_type = element.symbol.slice(-2);




                    connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`, `strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`) VALUES ("' + element.name + '","' + expiry + '","' + strike + '","' + option_type + '","O","' + element.token + '","' + element.lotsize + '","' + element.symbol + '")', (err, result) => {

                    });

                } else if (element.instrumenttype == 'OPTFUT') {

                    var expiry_s = element.expiry
                    var expiry_s = dateTime.create(expiry_s);
                    var expiry = expiry_s.format('dmY');

                    var strike_s = parseInt(element.strike);
                    var strike = parseInt(strike_s.toString().slice(0, -2));
                    //  console.log(element.token);

                    var option_type = element.symbol.slice(-2);




                    connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`, `strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`) VALUES ("' + element.name + '","' + expiry + '","' + strike + '","' + option_type + '","MO","' + element.token + '","' + element.lotsize + '","' + element.symbol + '")', (err, result) => {

                    });

                } else if (element.instrumenttype == 'OPTCOM') {

                    var expiry_s = element.expiry
                    var expiry_s = dateTime.create(expiry_s);
                    var expiry = expiry_s.format('dmY');

                    var strike_s = parseInt(element.strike);
                    var strike = parseInt(strike_s.toString().slice(0, -2));
                    //console.log(element.token);

                    var option_type = element.symbol.slice(-2);




                    connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`, `strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`) VALUES ("' + element.name + '","' + expiry + '","' + strike + '","' + option_type + '","MO","' + element.token + '","' + element.lotsize + '","' + element.symbol + '")', (err, result) => {

                    });

                }




            });
        });

    return "test";
});










app.get("/smartalgo/category", (req, res) => {
    connection1.query('SELECT * from categorie ORDER BY name ASC', (err, result) => {
        res.send({ category: result });
    });
});

app.get("/update-services", (req, res) => {

    var d = new Date();
    dformat = [d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    ].join('/') + ' ' + [d.getHours(),
        d.getMinutes(),
        d.getSeconds()
    ].join(':');
    var axios = require('axios');
    var config = {
        method: 'get',
        url: 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json',
    };

    axios(config)
        .then(function(response) {

            // res.send(response.data);


            response.data.forEach(function(element) {
                var option_type = element.symbol.substr(-2, 2);

                if (element.symbol.slice(-3) == '-EQ') {
                    console.log('EQ');
                    connection1.query('SELECT *  FROM `services` WHERE `categorie_id` = 24 AND `service` LIKE "' + element.name + '#"', (err, result) => {

                        if (result.length == 0) {
                            console.log('inside EQ');
                            connection1.query('INSERT INTO `services`(`categorie_id`, `service`, `status`, `created_at`, `instrument_token`, `zebu_token`) VALUES (24,"' + element.name + '#","","' + dformat + '","' + element.token + '","' + element.symbol + '")', (err, result) => {
                                console.log(err);
                                console.log(result);
                            });
                        }
                    });

                }

                if (element.instrumenttype == 'FUTSTK' || element.instrumenttype == 'FUTIDX') {

                    connection1.query('SELECT *  FROM `services` WHERE `categorie_id` = 25 AND `service` LIKE "' + element.name + '"', (err, result) => {
                        console.log('SELECT *  FROM `services` WHERE `categorie_id` = 25 AND `service` LIKE "' + element.name + '"');
                        if (result.length == 0) {
                            connection1.query('INSERT INTO `services`(`categorie_id`, `service`, `status`, `created_at`, `instrument_token`, `zebu_token`) VALUES (25,"' + element.name + '","","' + dformat + '","' + element.token + '","' + element.symbol + '")', (err, result) => {

                            });
                        }
                    });
                }

                if (element.instrumenttype == 'FUTCUR') {

                    connection1.query('SELECT *  FROM `services` WHERE `categorie_id` = "37" AND `service` LIKE "' + element.name + '"', (err, result) => {

                        if (result.length == 0) {
                            connection1.query('INSERT INTO `services`(`categorie_id`, `service`, `status`, `created_at`, `instrument_token`, `zebu_token`) VALUES (37,"' + element.name + '","","' + dformat + '","' + element.token + '","' + element.symbol + '")', (err, result) => {

                            });
                        }
                    });
                }

                if (element.instrumenttype == 'FUTCOM') {

                    connection1.query('SELECT *  FROM `services` WHERE `categorie_id` = "34" AND `service` LIKE "' + element.name + '"', (err, result) => {
                        if (result.length == 0) {
                            connection1.query('INSERT INTO `services`(`categorie_id`, `service`, `status`, `created_at`, `instrument_token`, `zebu_token`) VALUES (34,"' + element.name + '","","' + dformat + '","' + element.token + '","' + element.symbol + '")', (err, result) => {

                            });
                        }
                    });
                }


                if (element.instrumenttype == 'OPTSTK' || element.instrumenttype == 'OPTIDX') {

                    connection1.query('SELECT *  FROM `services` WHERE `categorie_id` = "26" AND `service` LIKE "' + element.name + '"', (err, result) => {
                        if (result.length == 0) {
                            connection1.query('INSERT INTO `services`(`categorie_id`, `service`, `status`, `created_at`, `instrument_token`, `zebu_token`) VALUES (26,"' + element.name + '","","' + dformat + '","' + element.token + '","' + element.symbol + '")', (err, result) => {

                            });
                        }
                    });
                }

                if (element.instrumenttype == 'OPTCUR') {

                    connection1.query('SELECT *  FROM `services` WHERE `categorie_id` = 36 AND `service` LIKE "' + element.name + '"', (err, result) => {
                        if (result.length == 0) {
                            connection1.query('INSERT INTO `services`(`categorie_id`, `service`, `status`, `created_at`, `instrument_token`, `zebu_token`) VALUES (36,"' + element.name + '","","' + dformat + '","' + element.token + '","' + element.symbol + '")', (err, result) => {

                            });
                        }
                    });
                }

                if (element.instrumenttype == 'OPTFUT') {

                    connection1.query('SELECT *  FROM `services` WHERE `categorie_id` = 35 AND `service` LIKE "' + element.name + '"', (err, result) => {
                        if (result.length == 0) {
                            connection1.query('INSERT INTO `services`(`categorie_id`, `service`, `status`, `created_at`, `instrument_token`, `zebu_token`) VALUES (35,"' + element.name + '","","' + dformat + '","' + element.token + '","' + element.symbol + '")', (err, result) => {

                            });
                        }
                    });
                }
            });
        });

    return "test";
});
 
// res.send('domain get success');

// });


httpsServer.listen(3011, () => {
    console.log('Server is winningturtle_node running at port 3011');
});