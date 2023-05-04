module.exports = function (app, connection1) {
  var verifyToken = require('./middleware/awtJwt');


  app.get("/admin/strategy", verifyToken, (req, res) => {
    connection1.query('SELECT * from strategy',(err, result) => {
         console.log("strategy",result)
        res.send({ strategy: result });
      });
  });

  app.post("/admin/strategy/delete", verifyToken, (req, res) => {
    var id = req.body.id;
    var name = req.body.name;

    connection1.query('SELECT * FROM `strategy_client` WHERE `strategy` = "' + name + '"', (err, strtegy_result) => {

      if (strtegy_result.length > 0) {
        res.send({ status: 'strtegy_error', msg: 'This Strategy is Already Assign Please Remove this Strategy from All Clients' })
      } else {

        connection1.query('SELECT `name` FROM `company_name` WHERE `id` = 1', (err, re) => {
          var company_name = re[0].name;

          connection1.query('Delete from `strategy_client` Where `strategy`="' + name + '"', (err, resultss) => {
            connection1.query('Delete from strategy Where `id`=' + id, (err, result) => {

              connection1.query('UPDATE `client_service` SET `strategy` = "' + company_name + '" WHERE `strategy` = "' + name + '"', (err, resultss) => {
                res.send({ status: 'true', msg: 'Strategy Deleted Successfully...' })
              });

            });

          });
        });

      }


    });

  });


  app.post("/admin/strategy/add", verifyToken, (req, res) => {
    var d = new Date();
    dformat = [d.getFullYear(),
    d.getMonth() + 1,
    d.getDate(),
    ].join('/') + ' ' +
      [d.getHours(),
      d.getMinutes(),
      d.getSeconds()].join(':');
    var strategyName = req.body.strategy
    console.log("stra", strategyName)
    connection1.query('INSERT INTO strategy (`name`,`created_at`,`updated_at`) VALUES ("' + strategyName + '","' + dformat + '","' + dformat + '")', (err, result) => {
      console.log("err", err)
      res.send({ services: 'true' });
    });
  });

  // app.post("/admin/strategy/edit",(req,res) => {
  //   var d = new Date();
  //   dformat = [d.getFullYear(),
  //              d.getMonth()+1,
  //              d.getDate(),
  //              ].join('/')+' '+
  //             [d.getHours(),
  //              d.getMinutes(),
  //              d.getSeconds()].join(':');
  //   var strategyUpdate = req.body.strategy
  //   connection1.query('UPDATE `strategy` SET `name`="'+strategyUpdate+'",`updated_at`="'+dformat+'" WHERE id="'+id
  //   , (err, result) => {
  //    console.log("strategy",result)
  //      res.send({ strategy: result });
  //   });
  // });

  app.post("/admin/strategy/clients", verifyToken, (req, res) => {
    var strat_id = req.body.strat_id;

    var d = new Date();
    dformat = [d.getFullYear(),
    d.getMonth() + 1,
    d.getDate()
    ].join('-')

    connection1.query('SELECT * FROM `strategy` WHERE id = "' + strat_id + '"'
      , (err, result) => {

        var Strat_Name = result[0].name
        connection1.query("SELECT `strategy_client`.`strategy`,`client`.`username`,`strategy_client`.`client_id` FROM `strategy_client`,`client` where  `client`.`id`=`strategy_client`.`client_id` AND `strategy_client`.`strategy`='" + Strat_Name + "' AND `client`.`end_date`>='" + dformat + "' ;SELECT * FROM `client` where `end_date`>='" + dformat + "' AND `username` IS NOT NULL", [1, 2], (err, result) => {
          res.send({ sclient: result[0], client: result[1] });
        });

      });
  });


  app.post("/admin/strategy/strategy-to-clients", verifyToken, (req, res) => {
    var strat_id = req.body.strat_id;
    var clientsIds = req.body.selectedClients
    var d = new Date();
    dformat = [d.getFullYear(),
    d.getMonth() + 1,
    d.getDate()
    ].join('-')

    connection1.query('SELECT * FROM `strategy` WHERE id = "' + strat_id + '"'
      , (err, result) => {

        var Strat_Name = result[0].name



        connection1.query('SELECT `strategy_client`.*, `client`.`full_name` as `client_name` FROM `strategy_client` JOIN `client` ON `client`.`id` = `strategy_client`.`client_id` JOIN `strategy` ON `strategy`.`name` = `strategy_client`.`strategy` WHERE `strategy_client`.`strategy` = "' + Strat_Name + '"', (err, re) => {



          var db_exist_client_ids = [];
          re.forEach(function (item, index) {
            db_exist_client_ids.push(item.client_id);
          });

          // console.log('exist client ids',db_exist_client_ids); 
          //  console.log(' new client ids',req.body.selectedClients); 

          var add_client_strategy = [];
          req.body.selectedClients.forEach(function (item, index) {
            if (!db_exist_client_ids.includes(item)) {
              add_client_strategy.push(item);
            }
          });
          // console.log(' add_client_strategy - ',add_client_strategy);


          var delete_client_strategy = [];
          db_exist_client_ids.forEach(function (item, index) {
            if (!req.body.selectedClients.includes(item)) {
              delete_client_strategy.push(item);
            }

          });
          //console.log('delete_client_strategy - ',delete_client_strategy); 


          delete_client_strategy.forEach(function (item, index) {
            connection1.query('Delete from `strategy_client` Where `strategy`="' + Strat_Name + '" AND `client_id`=' + item, (err, result) => {
              // console.log("result",result);
            })
          });



          var dataa = [];
          add_client_strategy.forEach(function (item, index) {
            dataa += '("' + item + '","' + Strat_Name + '","' + strat_id + '","' + dformat + '"),';
          });
          dataa = dataa.slice(0, -1);
          connection1.query('INSERT INTO `strategy_client`  (`client_id`,`strategy`,`strategy_id`,`created_at`) VALUES' + dataa + '', (err, result) => {
            console.log(err);
            // console.log(result);
            res.send("Clients Added to Strategy")


          })


        });
      });
  });


  app.post("/admin/strategy/strategyname", verifyToken, (req, res) => {
    var strat_id = req.body.strat_id;
    connection1.query('SELECT * FROM `strategy` WHERE id = "' + strat_id + '"'
      , (err, result) => {
        res.send({ Strat_Name: result[0].name })
      })
  });


  app.post("/admin/strategy/update", verifyToken, (req, res) => {
    var strat_id = req.body.strat_id;
    var StrategyName = req.body.StrategyName;
    // console.log('strat id ',strat_id);
    //  console.log('StrategyName ',StrategyName);

    connection1.query('SELECT * FROM `strategy` WHERE id = "' + strat_id + '"'
      , (err, exist) => {

        //console.log('exist strat name',res[0].name);
        var exist_startegy = exist[0].name;

        // console.log("exist_startegy",exist_startegy);

        connection1.query('UPDATE `strategy` SET `name`="' + StrategyName + '" WHERE id =' + strat_id
          , (err, result) => {

            connection1.query('UPDATE `strategy_client` SET `strategy`="' + StrategyName + '" WHERE strategy_id =' + strat_id
              , (err, result) => {

                connection1.query('UPDATE `strategy_client` SET `strategy`="' + StrategyName + '" WHERE strategy ="' + exist_startegy + '"'
                  , (err, result) => {


                    connection1.query('UPDATE `client_service` SET `strategy`="' + StrategyName + '" WHERE strategy ="' + exist_startegy + '"'
                      , (err1, result1) => {

                        res.send("Strategy Updated");
                      });
                  });
              });
          });
      });
  });



  app.post("/admin/strategy/clientlist", verifyToken, (req, res) => {
    var strategy_name = req.body.strategy_name;
    
    connection1.query('SELECT `client_service`.`client_id`,`client_service`.`id`,`client_service`.`strategy`  ,`client`.`id`,`client`.username,`client`.`email`,`client`.licence_type FROM `client_service` JOIN `client` ON `client_service`.`client_id` = `client`.id  WHERE `client_service`.`strategy`="'+strategy_name+'" GROUP BY `client_service`.`client_id`', (err, client_list) => {
      
   
      console.log("clients",client_list);

      res.send({ data: client_list })

    });

  });



}
