module.exports = function (app, connection1) {
  var verifyToken = require('./middleware/awtJwt');
  var dateTime = require('node-datetime');

  app.post("/client/tradehistory", verifyToken, (req, res) => {




    var d = new Date;
    dformat = [d.getFullYear(),
    d.getMonth() + 1,
    d.getDate(),
    ].join('-');
    var symbol = req.body.symbol;
    var strat = req.body.strategy;
    var segment = req.body.segment;
    var todate = req.body.todate;
    var fromdate = req.body.fromdate;
    var client_id = req.body.client_id;

    var where = '';
    var where1 = '';
    if (symbol != '') {
      where += '`signals`.`symbol` = "' + symbol + '" AND';
    }
    if (segment != '') {
      // if(segment == "O" || segment == "o") { 
      //   where+='`signals`.`segment` LIKE "%'+segment+'%" AND'; 
      // }else{
      where += '`signals`.`segment` = "' + segment + '" AND `signals`.`segment` = `categorie`.`segment` AND';

      // }
    } else {
      where += '`signals`.`segment` = `categorie`.`segment` AND';
    }
    if (strat != '') {
      where += '`signals`.`strategy_tag` = "' + strat + '" AND';
    }
    if (todate != '') {
      where += '`signals`.`dt_date` <= "' + String(todate) + '" AND';
    }
    if (fromdate != '') {

      where += '`signals`.`dt_date` >= "' + String(fromdate) + '"';
    } else {

      where += '`signals`.`dt_date` >= "' + String(dformat) + '"';
    }

    connection1.query("SELECT * FROM `client` where `id`='" + client_id + "'"
      , (err, result_client) => {

        var client_key = result_client[0].client_key;
        var web_url = result_client[0].web_url;

        if (web_url == 1) {
          where1 = '`signals`.`client_personal_key` IS NULL';
        } else {
          if (client_key != '') {
            where1 += '`signals`.`client_personal_key` = "' + client_key + '"';
          }
          else {
            where1 += '`signals`.`client_personal_key` IS NULL';
          }
        }
        var Client_CreateAt = result_client[0].created_at
        var dt = dateTime.create(Client_CreateAt);
        var ccdate = dt.format('Y-m-d H:M:S');


        // connection1.query("SELECT `signals`.*, (SUM(`client_transactions`.`qty`*`client_transactions`.`price`)/SUM(`client_transactions`.`qty`)) as `average_client_price` , SUM(`client_transactions`.`qty`) as `average_client_qty` ,`client_service`.`qty` as `quantity` ,`client_transactions`.`price` as c_price, `client_transactions`.`qty` as c_qty  FROM `client_service` LEFT JOIN `services` ON `client_service`.`service_id` = `services`.`id` LEFT JOIN `client` ON `client`.`id` = `client_service`.`client_id` LEFT JOIN `signals` ON `signals`.`symbol` = `services`.`service` LEFT JOIN `client_transactions` ON `client_transactions`.`last_signal_id` = `signals`.`id` LEFT JOIN `categorie` ON `categorie`.`id` = `services`.`categorie_id` WHERE `client_service`.`client_id` = '"+client_id+"' AND "+where1+" AND "+where+" AND `signals`.`segment` = `categorie`.`segment` AND `client_service`.`strategy` = `signals`.`strategy_tag` AND `client_transactions`.`last_signal_id` = `signals`.`id` GROUP BY `client_transactions`.`signal_type` ORDER BY `signals`.`dt_date`, `signals`.`strategy_tag`, `signals`.`trade_symbol`, `signals`.`segment`, `signals`.`option_type`, `signals`.`dt`, `signals`.`signal_id` ASC", (err, result1) => {
        //       console.log('error trade history -',err);
        //        res.send({ tradehistory: result1 });
        //     });



        connection1.query("SELECT `signals`.*, `signals`.`price` as `average_client_price` ,`client_service`.`qty` as `quantity`  FROM `client_service` LEFT JOIN `services` ON `client_service`.`service_id` = `services`.`id` LEFT JOIN `client` ON `client`.`id` = `client_service`.`client_id` LEFT JOIN `signals` ON `signals`.`symbol` = `services`.`service` LEFT JOIN `categorie` ON `categorie`.`CID` = `services`.`categorie_id` WHERE `client_service`.`client_id` = '" + client_id + "' AND  " + where1 + " AND " + where + "  AND `client_service`.`strategy` = `signals`.`strategy_tag` AND `client_service`.`trading` =1 GROUP BY `signals`.`id`  ORDER BY `signals`.`dt_date`, `signals`.`strategy_tag`, `signals`.`trade_symbol`, `signals`.`segment`, `signals`.`option_type`, `signals`.`dt`, `signals`.`signal_id` ASC", (err, result1) => {
          console.log('error trade history -', err);
          res.send({ tradehistory: result1 });
        });




      });
  });


  //     app.post("/client/signals",(req,res) => {
  //      var client_id=req.body.id;
  //      var d = new Date;
  //      dformat = [d.getFullYear(),
  //         d.getMonth()+1,
  //         d.getDate(),
  //         ].join('-');  
  // var symbol=req.body.symbol;
  // var segment=req.body.segment;
  // var todate=req.body.todate;
  // var fromdate=req.body.fromdate;

  // var where='';
  // if(symbol!='')
  // {
  // where+='`signals`.`symbol` = "'+symbol+'" AND';
  // }
  // if(segment!='')
  // {
  // where+='`signals`.`segment` = "'+segment+'" AND';
  // }
  // if(todate!='')
  // {
  // where+='`signals`.`dt_date` <= "'+todate+'" AND';
  // }
  // if(fromdate!='')
  // {
  // where+='`signals`.`dt_date` >= "'+fromdate+'" AND';
  // }else
  // {
  //  where+='`signals`.`dt_date` >= "'+dformat+'" AND';
  // }


  //         connection1.query("SELECT `signals`.*, `client`.`end_date` as `c_last_date`, `categorie`.`segment` as `cat_segment`, `categorie`.`name` as `cat_name`, `client_service`.`strategy` as `client_strategy` FROM `client_service` LEFT JOIN `services` ON `client_service`.`service_id` = `services`.`id` LEFT JOIN `client` ON `client`.`id` = `client_service`.`client_id` LEFT JOIN `signals` ON `signals`.`symbol` = `services`.`service` LEFT JOIN `categorie` ON `categorie`.`id` = `services`.`categorie_id` WHERE `client_service`.`client_id` = "+client_id+" AND "+where+" `signals`.`segment` = `categorie`.`segment` AND `client_service`.`strategy` = `signals`.`strategy_tag` ORDER BY `signals`.`created_at` DESC", (err, result1) => {
  //      console.log("SELECT `signals`.*, `client`.`end_date` as `c_last_date`, `categorie`.`segment` as `cat_segment`, `categorie`.`name` as `cat_name`, `client_service`.`strategy` as `client_strategy` FROM `client_service` LEFT JOIN `services` ON `client_service`.`service_id` = `services`.`id` LEFT JOIN `client` ON `client`.`id` = `client_service`.`client_id` LEFT JOIN `signals` ON `signals`.`symbol` = `services`.`service` LEFT JOIN `categorie` ON `categorie`.`id` = `services`.`categorie_id` WHERE `client_service`.`client_id` = "+client_id+" AND "+where+" `signals`.`segment` = `categorie`.`segment` AND `client_service`.`strategy` = `signals`.`strategy_tag` ORDER BY `signals`.`created_at` DESC");
  //         res.send({signals:result1});  

  //         });
  //     });

  // app.post("/client/symbols",(req,res) => {
  //     var client_id=req.body.id;
  //     connection1.query("SELECT `client_service`.*, `services`.`service` as `client_service` FROM `client_service` JOIN `client` ON `client`.`id` = `client_service`.`client_id` JOIN `services` ON `services`.`id` = `client_service`.`service_id` WHERE `client_service`.`client_id` = "+client_id+"", (err, result1) => {

  //         res.send({symbols:result1});  

  //         });
  // });




  app.post("/client/strategy", (req, res) => {
    var client_id = req.body.client_id;
    connection1.query('SELECT * FROM `company_name`',(err,company_name)=>{
      console.log("=>",company_name[0].name)
      
          connection1.query('SELECT * FROM `strategy_client` WHERE `client_id` = ' + client_id + ' AND `strategy` NOT IN ("'+company_name[0].name+'")', (err, result1) => {
      
            res.send({ strategy: result1 });
      
          });

    })
  });


}