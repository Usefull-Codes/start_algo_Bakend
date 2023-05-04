module.exports = function(app, connection1) {
    var cron = require('node-cron');
    var dateTime = require('node-datetime');
    var moment = require('moment');

    cron.schedule('0 0 * * *', () => {
    
        console.log('cron running at every 12 : 00 midnight.. ');
        ClientLoginStatus();
        AdminLoginStatus();
        setExpiryStatus();
        statusNullTradingOff();
       // TokenSymbolUpdate();

    
      });

    


    // app.get("/admin/cron/show-expery-msg", (req, res) => {
    const setExpiryStatus = () => {
        connection1.query('SELECT * FROM `client` where `licence_type`="2"', (err, result) => {
            result.forEach((item) => {

                    // console.log("item", item.full_name, "-", item.end_date)
                    var end_date_live = dateTime.create(item.end_date);
                    var end_date = end_date_live.format('Y-m-d');

                    var dt = dateTime.create();
                    var ccdate = dt.format('Y-m-d');
                    var diffInMs = Math.abs(new Date(ccdate) - new Date(end_date));
                    var day1 = diffInMs / (1000 * 60 * 60 * 24);

                    if (day1 == 2) {

                        connection1.query('UPDATE `client` SET `expiry_status`="3" WHERE `id`=' + item.id, (err, result) => {})

                    } else if (day1 == 1) {

                        connection1.query('UPDATE `client` SET `expiry_status`="2" WHERE `id`=' + item.id, (err, result) => {})

                    } else if (day1 == 0) {
                        connection1.query('UPDATE `client` SET `expiry_status`="1" WHERE `id`=' + item.id, (err, result) => {})


                    }
                    // console.log("licence", item.licence_type)
                    // res.send({ clientNme: item.full_name, Expiry: end_date, days: day1 });

                })
                // res.send({ clientNme: result });
        });
        // });
    }


    const statusNullTradingOff = () => {

        var dt = dateTime.create();
        var ccdate = dt.format('Y-m-d H:M:S');

        connection1.query('UPDATE `client` SET `access_token` = " ", `trading_type` = "off"', (err, result) => {

            connection1.query(' SELECT `id` FROM `client` WHERE `access_token` != "" AND `trading_type` = "on"', (err, trading_on_client) => {
           
             if(trading_on_client.length){
             
                trading_on_client.forEach(element => {
                      
                    connection1.query('INSERT INTO `trading_status_client` (`client_id`,`trading`,`created_at`) VALUES ("' + id + '","TradingOFF","' + ccdate + '")', (err, tradinf_status) => { });
                });
             }


        })
     })
    }

    const ClientLoginStatus = () => {
        var zero = 0;
        connection1.query('UPDATE `client` SET `login_status` = ' + zero, (err, result) => {
            console.log("resulkt", result)
        })
    }

    const AdminLoginStatus = () => {
        var zero = 0;
        connection1.query('UPDATE `tbl_users` SET `admin_login_status` = ' + zero, (err, result) => {
            console.log("resulkt", result)
        })
    }

    const TokenSymbolUpdate = () => {


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

                    // console.log('okk-',element.symbol);
                    // console.log('sss- ',option_type);


                    if (element.instrumenttype == 'FUTSTK') {

                        var expiry_s = element.expiry
                        var expiry_s = dateTime.create(expiry_s);
                        var expiry = expiry_s.format('dmY');
    
    
    
    
    
                        var strike_s = parseInt(element.strike);
                        var strike = parseInt(strike_s.toString().slice(0, -2));
                        //console.log(element.token);
    
                        var option_type = element.symbol.slice(-2);
    
                       
    
                        var day_month = element.expiry.slice(0,-4);  
                        
                        var year_end = element.expiry.slice(-2);
    
                       var  day_start =element.expiry.slice(0,2);
    
                       var moth_str = element.expiry.slice(2,5); 
    
                        const Dat = new Date(element.expiry);
                        console.log("Dat",Dat)
                    
                        var moth_count = Dat.getMonth() + 1 
                      
    
    
                       var lastWednesd =  moment().endOf('month').day('wednesday')
                       var dt = dateTime.create(lastWednesd);
                       var lastWednesday_date = dt.format('dmY');
    
    
                       var expiry_month_year = expiry.slice(2);
    
                       var expiry_date =  expiry.slice(0, -6);
    
                        var tradesymbol_m_w;
                  
                        tradesymbol_m_w = element.name+year_end+moth_count+day_start+strike+option_type;   
                  
                    
                       connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`,`expiry_month_year`,`expiry_date`, `expiry_str`,`strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`,`tradesymbol_m_w`) VALUES ("' + element.name + '","' + expiry + '","' + expiry_month_year + '","' + expiry_date + '","'+element.expiry+'","' + strike + '","' + option_type + '","F","' + element.token + '","' + element.lotsize + '","' + element.symbol + '","'+tradesymbol_m_w+'")', (err, result) => {
    
                    });

                    } else if (element.instrumenttype == 'FUTIDX') {

                        var expiry_s = element.expiry
                        var expiry_s = dateTime.create(expiry_s);
                        var expiry = expiry_s.format('dmY');
    
    
    
    
    
                        var strike_s = parseInt(element.strike);
                        var strike = parseInt(strike_s.toString().slice(0, -2));
                        //console.log(element.token);
    
                        var option_type = element.symbol.slice(-2);
    
                       
    
                        var day_month = element.expiry.slice(0,-4);  
                        
                        var year_end = element.expiry.slice(-2);
    
                       var  day_start =element.expiry.slice(0,2);
    
                       var moth_str = element.expiry.slice(2,5); 
    
                        const Dat = new Date(element.expiry);
                        console.log("Dat",Dat)
                    
                        var moth_count = Dat.getMonth() + 1 
                      
    
    
                       var lastWednesd =  moment().endOf('month').day('wednesday')
                       var dt = dateTime.create(lastWednesd);
                       var lastWednesday_date = dt.format('dmY');
    
    
                       var expiry_month_year = expiry.slice(2);
    
                       var expiry_date =  expiry.slice(0, -6);
    
                        var tradesymbol_m_w;
                  
                        tradesymbol_m_w = element.name+year_end+moth_count+day_start+strike+option_type;   
                  
                    
                       connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`,`expiry_month_year`,`expiry_date`, `expiry_str`,`strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`,`tradesymbol_m_w`) VALUES ("' + element.name + '","' + expiry + '","' + expiry_month_year + '","' + expiry_date + '","'+element.expiry+'","' + strike + '","' + option_type + '","F","' + element.token + '","' + element.lotsize + '","' + element.symbol + '","'+tradesymbol_m_w+'")', (err, result) => {
    
                    });

                    } else if (element.instrumenttype == 'FUTCOM') {

                        var expiry_s = element.expiry
                        var expiry_s = dateTime.create(expiry_s);
                        var expiry = expiry_s.format('dmY');
    
    
    
    
    
                        var strike_s = parseInt(element.strike);
                        var strike = parseInt(strike_s.toString().slice(0, -2));
                        //console.log(element.token);
    
                        var option_type = element.symbol.slice(-2);
    
                       
    
                        var day_month = element.expiry.slice(0,-4);  
                        
                        var year_end = element.expiry.slice(-2);
    
                       var  day_start =element.expiry.slice(0,2);
    
                       var moth_str = element.expiry.slice(2,5); 
    
                        const Dat = new Date(element.expiry);
                        console.log("Dat",Dat)
                    
                        var moth_count = Dat.getMonth() + 1 
                      
    
    
                       var lastWednesd =  moment().endOf('month').day('wednesday')
                       var dt = dateTime.create(lastWednesd);
                       var lastWednesday_date = dt.format('dmY');
    
    
                       var expiry_month_year = expiry.slice(2);
    
                       var expiry_date =  expiry.slice(0, -6);
    
                        var tradesymbol_m_w;
                  
                        tradesymbol_m_w = element.name+year_end+moth_count+day_start+strike+option_type;   
                  
                    
                       connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`,`expiry_month_year`,`expiry_date`, `expiry_str`,`strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`,`tradesymbol_m_w`) VALUES ("' + element.name + '","' + expiry + '","' + expiry_month_year + '","' + expiry_date + '","'+element.expiry+'","' + strike + '","' + option_type + '","MF","' + element.token + '","' + element.lotsize + '","' + element.symbol + '","'+tradesymbol_m_w+'")', (err, result) => {
    
                    });

                    }  else if (element.instrumenttype == 'OPTIDX') {

                        var expiry_s = element.expiry
                        var expiry_s = dateTime.create(expiry_s);
                        var expiry = expiry_s.format('dmY');
    
    
    
    
    
                        var strike_s = parseInt(element.strike);
                        var strike = parseInt(strike_s.toString().slice(0, -2));
                        //console.log(element.token);
    
                        var option_type = element.symbol.slice(-2);
    
                       
    
                        var day_month = element.expiry.slice(0,-4);  
                        
                        var year_end = element.expiry.slice(-2);
    
                       var  day_start =element.expiry.slice(0,2);
    
                       var moth_str = element.expiry.slice(2,5); 
    
                        const Dat = new Date(element.expiry);
                        console.log("Dat",Dat)
                    
                        var moth_count = Dat.getMonth() + 1 
                      
    
    
                       var lastWednesd =  moment().endOf('month').day('wednesday')
                       var dt = dateTime.create(lastWednesd);
                       var lastWednesday_date = dt.format('dmY');
    
    
                       var expiry_month_year = expiry.slice(2);
    
                       var expiry_date =  expiry.slice(0, -6);
    
                        var tradesymbol_m_w;
                  
                        tradesymbol_m_w = element.name+year_end+moth_count+day_start+strike+option_type;   
                  
                    
                       connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`,`expiry_month_year`,`expiry_date`, `expiry_str`,`strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`,`tradesymbol_m_w`) VALUES ("' + element.name + '","' + expiry + '","' + expiry_month_year + '","' + expiry_date + '","'+element.expiry+'","' + strike + '","' + option_type + '","O","' + element.token + '","' + element.lotsize + '","' + element.symbol + '","'+tradesymbol_m_w+'")', (err, result) => {
    
                    });
    
                    } else if (element.instrumenttype == 'OPTSTK') {
    
                        var expiry_s = element.expiry
                        var expiry_s = dateTime.create(expiry_s);
                        var expiry = expiry_s.format('dmY');
    
                        var strike_s = parseInt(element.strike);
                        var strike = parseInt(strike_s.toString().slice(0, -2));
                        // console.log(element.token);
    
                        var option_type = element.symbol.slice(-2);
    
    
                        var moth_str = element.expiry.slice(2,5); 
    
                        var day_month = element.expiry.slice(0,-4);  
                        
                        var year_end = element.expiry.slice(-2);
    
                       var  day_start =element.expiry.slice(0,2);
    
                        const Dat = new Date(element.expiry);

                    
                       var moth_count = Dat.getMonth() + 1 
                       
                       var lastWednesd =  moment().endOf('month').day('wednesday')
                       var dt = dateTime.create(lastWednesd);
                       var lastWednesday_date = dt.format('dmY');
    
    
                       var expiry_month_year = expiry.slice(2);
    
                       var expiry_date =  expiry.slice(0, -6);
    
    
    
                        var tradesymbol_m_w;
                      
                        tradesymbol_m_w = element.name+year_end+moth_count+day_start+strike+option_type;   
                
                
                      connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`,`expiry_month_year`,`expiry_date`, `expiry_str`,`strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`,`tradesymbol_m_w`) VALUES ("' + element.name + '","' + expiry + '","' + expiry_month_year + '","' + expiry_date + '","'+element.expiry+'","' + strike + '","' + option_type + '","O","' + element.token + '","' + element.lotsize + '","' + element.symbol + '","'+tradesymbol_m_w+'")', (err, result) => {
    
                        });

                    } else if (element.instrumenttype == 'OPTFUT') {

                        var expiry_s = element.expiry
                        var expiry_s = dateTime.create(expiry_s);
                        var expiry = expiry_s.format('dmY');
    
                        var strike_s = parseInt(element.strike);
                        var strike = parseInt(strike_s.toString().slice(0, -2));
                        // console.log(element.token);
    
                        var option_type = element.symbol.slice(-2);
    
    
                        var moth_str = element.expiry.slice(2,5); 
    
                        var day_month = element.expiry.slice(0,-4);  
                        
                        var year_end = element.expiry.slice(-2);
    
                       var  day_start =element.expiry.slice(0,2);
    
                        const Dat = new Date(element.expiry);

                    
                       var moth_count = Dat.getMonth() + 1 
                       
                       var lastWednesd =  moment().endOf('month').day('wednesday')
                       var dt = dateTime.create(lastWednesd);
                       var lastWednesday_date = dt.format('dmY');
    
    
                       var expiry_month_year = expiry.slice(2);
    
                       var expiry_date =  expiry.slice(0, -6);
    
    
    
                        var tradesymbol_m_w;
                      
                        tradesymbol_m_w = element.name+year_end+moth_count+day_start+strike+option_type;   
                
                
                      connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`,`expiry_month_year`,`expiry_date`, `expiry_str`,`strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`,`tradesymbol_m_w`) VALUES ("' + element.name + '","' + expiry + '","' + expiry_month_year + '","' + expiry_date + '","'+element.expiry+'","' + strike + '","' + option_type + '","MO","' + element.token + '","' + element.lotsize + '","' + element.symbol + '","'+tradesymbol_m_w+'")', (err, result) => {
    
                        });

                    } else if (element.instrumenttype == 'OPTCOM') {

                        var expiry_s = element.expiry
                        var expiry_s = dateTime.create(expiry_s);
                        var expiry = expiry_s.format('dmY');
    
                        var strike_s = parseInt(element.strike);
                        var strike = parseInt(strike_s.toString().slice(0, -2));
                        // console.log(element.token);
    
                        var option_type = element.symbol.slice(-2);
    
    
                        var moth_str = element.expiry.slice(2,5); 
    
                        var day_month = element.expiry.slice(0,-4);  
                        
                        var year_end = element.expiry.slice(-2);
    
                       var  day_start =element.expiry.slice(0,2);
    
                        const Dat = new Date(element.expiry);

                    
                       var moth_count = Dat.getMonth() + 1 
                       
                       var lastWednesd =  moment().endOf('month').day('wednesday')
                       var dt = dateTime.create(lastWednesd);
                       var lastWednesday_date = dt.format('dmY');
    
    
                       var expiry_month_year = expiry.slice(2);
    
                       var expiry_date =  expiry.slice(0, -6);
    
    
    
                        var tradesymbol_m_w;
                      
                        tradesymbol_m_w = element.name+year_end+moth_count+day_start+strike+option_type;   
                
                
                      connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`,`expiry_month_year`,`expiry_date`, `expiry_str`,`strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`,`tradesymbol_m_w`) VALUES ("' + element.name + '","' + expiry + '","' + expiry_month_year + '","' + expiry_date + '","'+element.expiry+'","' + strike + '","' + option_type + '","MO","' + element.token + '","' + element.lotsize + '","' + element.symbol + '","'+tradesymbol_m_w+'")', (err, result) => {
    
                        });

                    } else if (element.instrumenttype == 'OPTCUR') {

                        var expiry_s = element.expiry
                        var expiry_s = dateTime.create(expiry_s);
                        var expiry = expiry_s.format('dmY');
    
                        var strike_s = parseInt(element.strike);
                        var strike = parseInt(strike_s.toString().slice(0, -2));
                        // console.log(element.token);
    
                        var option_type = element.symbol.slice(-2);
    
    
                        var moth_str = element.expiry.slice(2,5); 
    
                        var day_month = element.expiry.slice(0,-4);  
                        
                        var year_end = element.expiry.slice(-2);
    
                       var  day_start =element.expiry.slice(0,2);
    
                        const Dat = new Date(element.expiry);

                    
                       var moth_count = Dat.getMonth() + 1 
                       
                       var lastWednesd =  moment().endOf('month').day('wednesday')
                       var dt = dateTime.create(lastWednesd);
                       var lastWednesday_date = dt.format('dmY');
    
    
                       var expiry_month_year = expiry.slice(2);
    
                       var expiry_date =  expiry.slice(0, -6);
    
    
    
                        var tradesymbol_m_w;
                      
                        tradesymbol_m_w = element.name+year_end+moth_count+day_start+strike+option_type;   
                
                
                      connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`,`expiry_month_year`,`expiry_date`, `expiry_str`,`strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`,`tradesymbol_m_w`) VALUES ("' + element.name + '","' + expiry + '","' + expiry_month_year + '","' + expiry_date + '","'+element.expiry+'","' + strike + '","' + option_type + '","CO","' + element.token + '","' + element.lotsize + '","' + element.symbol + '","'+tradesymbol_m_w+'")', (err, result) => {
    
                        });

                    } else if (element.instrumenttype == 'FUTCUR') {

                        var expiry_s = element.expiry
                        var expiry_s = dateTime.create(expiry_s);
                        var expiry = expiry_s.format('dmY');
    
                        var strike_s = parseInt(element.strike);
                        var strike = parseInt(strike_s.toString().slice(0, -2));
                        // console.log(element.token);
    
                        var option_type = element.symbol.slice(-2);
    
    
                        var moth_str = element.expiry.slice(2,5); 
    
                        var day_month = element.expiry.slice(0,-4);  
                        
                        var year_end = element.expiry.slice(-2);
    
                       var  day_start =element.expiry.slice(0,2);
    
                        const Dat = new Date(element.expiry);

                    
                       var moth_count = Dat.getMonth() + 1 
                       
                       var lastWednesd =  moment().endOf('month').day('wednesday')
                       var dt = dateTime.create(lastWednesd);
                       var lastWednesday_date = dt.format('dmY');
    
    
                       var expiry_month_year = expiry.slice(2);
    
                       var expiry_date =  expiry.slice(0, -6);
    
    
    
                        var tradesymbol_m_w;
                      
                        tradesymbol_m_w = element.name+year_end+moth_count+day_start+strike+option_type;   
                
                
                      connection1.query('INSERT INTO `token_symbol`(`symbol`, `expiry`,`expiry_month_year`,`expiry_date`, `expiry_str`,`strike`,`option_type`,`segment`, `instrument_token`, `lotsize`, `tradesymbol`,`tradesymbol_m_w`) VALUES ("' + element.name + '","' + expiry + '","' + expiry_month_year + '","' + expiry_date + '","'+element.expiry+'","' + strike + '","' + option_type + '","CF","' + element.token + '","' + element.lotsize + '","' + element.symbol + '","'+tradesymbol_m_w+'")', (err, result) => {
    
                        });

                    }




                });
            });

        return "test";

    }

  


}