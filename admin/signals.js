module.exports = function (app, connection1) {
  var verifyToken = require('./middleware/awtJwt');



  app.post("/smartalgo/tradehistory", verifyToken, (req, res) => {
    
    



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

    var where = '';
    if (symbol != '') {
      where += '`signals`.`symbol` = "' + symbol + '" AND';
    }
    if (segment != '') {

      // if(segment == "O" || segment == "o") { 
      //   where+='`signals`.`segment` LIKE "%'+segment+'%" AND'; 
      // }else{
      where += '`signals`.`segment` = "' + segment + '" AND';
      // }
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


    console.log('where -', where);


    connection1.query("SELECT `signals`.*, `categorie`.`segment` as `cat_segment`, `categorie`.`name` as `cat_name` FROM `signals` LEFT JOIN `categorie` ON `categorie`.`segment` = `signals`.`segment` WHERE " + where + "  ORDER BY `dt_date`, `trade_symbol`,`strategy_tag`, `segment`, `option_type`, `signal_id` ASC", (err, result) => {
      // console.log(err);
    console.log("SELECT `signals`.*, `categorie`.`segment` as `cat_segment`, `categorie`.`name` as `cat_name` FROM `signals` LEFT JOIN `categorie` ON `categorie`.`segment` = `signals`.`segment` WHERE " + where + "  ORDER BY `dt_date`, `trade_symbol`,`strategy_tag`, `segment`, `option_type`, `signal_id` ASC");
      res.send({ tradehistory: result });
    });
  });


  app.post("/smartalgo/signals", verifyToken, (req, res) => {

    var d = new Date;
    dformat = [d.getFullYear(),
    d.getMonth() + 1,
    d.getDate(),
    ].join('-');
    var symbol = req.body.symbol;
    var strat = req.body.strategy;
    //var segment=req.body.segment;
    var todate = req.body.todate;
    var fromdate = req.body.fromdate;

    var segment = req.body.segment;



    var where = '';
    if (symbol != '') {
      where += '`signals`.`symbol` = "' + symbol + '" AND';
    }
    if (segment != '') {
      // if(segment == "O" || segment == "o") { 
      //   where+='`signals`.`segment` LIKE "%'+segment+'%" AND'; 
      // }else{
      where += '`signals`.`segment` = "' + segment + '" AND';
      // }
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


    console.log('where -', where);


    connection1.query("SELECT `signals`.*, `categorie`.`segment` as `cat_segment`, `categorie`.`name` as `cat_name` FROM `signals` LEFT JOIN `categorie` ON `categorie`.`segment` = `signals`.`segment` WHERE " + where + "  ORDER BY `signals`.`id` DESC", (err, result) => {
      // console.log("SELECT `signals`.*, `categorie`.`segment` as `cat_segment`, `categorie`.`name` as `cat_name` FROM `signals` LEFT JOIN `categorie` ON `categorie`.`segment` = `signals`.`segment` WHERE " + where + "  ORDER BY `signals`.`id` DESC");
      //   console.log(result);
      res.send({ signals: result });
    });
  });


  app.get("/smartalgo/symbolsgroup", verifyToken, (req, res) => {
    connection1.query("SELECT `symbol`  FROM `signals` where `symbol`!='' GROUP BY `symbol` ORDER BY `symbol` ASC"
      , (err, result) => {

        res.send({ symbols: result });
      });
  });

  app.get("/smartalgo/strategygroup", verifyToken, (req, res) => {
    connection1.query("SELECT * FROM `strategy` ORDER BY `id` DESC"
      , (err, result) => {

        res.send({ strategy: result });
      });
  });




  // Panding token
  // app.post("/smartalgo/instrument_token", verifyToken, (req, res) => {


  //   const strike_prize = req.body.strike_prize
  //   const expied_symbol = req.body.expied_symbol



  //   // return

  //   const strike_prizeArr = []
  //   var channelstr = ""



  //   if (strike_prize.length == 80) {

  //     strike_prize.forEach((val) => {


  //       connection1.query('SELECT id,symbol,expiry_str,strike,option_type,segment,instrument_token  FROM `token_symbol` WHERE `symbol` = "' + val.symbol + '" AND `strike` = ' + val.strike_price + '  AND `expiry_str`="' + expied_symbol + '" ORDER BY `instrument_token` ASC'
  //         , (err, result) => {
  //           if (result) {


  //             strike_prizeArr.push(result)



  //             if (strike_prizeArr.length == 80) {

  //               strike_prizeArr.flat().map((a) => {
  //                 channelstr += "NFO|" + a.instrument_token + "#"
  //               })

  //               var alltokenchannellist = channelstr.substring(0, channelstr.length - 1);

  //               // res.send({ channel: alltokenchannellist, data: strike_prizeArr })
  //               res.send({ channel: alltokenchannellist })

  //             }
  //           }
  //         });

  //     })

  //   }





  // });




  // app.get("/smartalgo/create/token_symbol", (req, res) => {

  //   connection1.query('SELECT * FROM `services`', (err, result) => {
    
  //     result.forEach((val) => {



  //       connection1.query('UPDATE `token_symbol1` SET `new_trade_symbol`="' + new_trade_symbol + '" WHERE id=' + val.id, (err, token_symbols1) => {
  //         console.log("err", err);
  //       })

  //     });




  //   })
  // })







}	