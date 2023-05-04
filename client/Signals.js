module.exports = function (app, connection1) {
  var verifyToken = require('./middleware/awtJwt');

  app.post("/client/signals", verifyToken, (req, res) => {
    var client_id = req.body.client_id;
    var d = new Date;
    dformat = [d.getFullYear(),
    d.getMonth() + 1,
    d.getDate(),
    ].join('-');
    var symbol = req.body.symbol;
    var segment = req.body.segment;
    var todate = req.body.todate;
    var fromdate = req.body.fromdate;

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


    if (todate != '') {
      where += '`signals`.`dt_date` <= "' + todate + '" AND';
    }
    if (fromdate != '') {
      where += '`signals`.`dt_date` >= "' + fromdate + '" AND';
    } else {
      where += '`signals`.`dt_date` >= "' + dformat + '" AND';
    }


    connection1.query("SELECT * FROM `client` where `id`='" + client_id + "'"
      , (err, result_client) => {
        console.log('client result -', result_client[0].client_key);

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

        connection1.query("SELECT `signals`.*, `client`.`end_date` as `c_last_date`, `categorie`.`segment` as `cat_segment`, `categorie`.`name` as `cat_name`, `client_service`.`strategy` as `client_strategy` FROM `client_service` LEFT JOIN `services` ON `client_service`.`service_id` = `services`.`id` LEFT JOIN `client` ON `client`.`id` = `client_service`.`client_id` LEFT JOIN `signals` ON `signals`.`symbol` = `services`.`service` LEFT JOIN `categorie` ON `categorie`.`CID` = `services`.`categorie_id` WHERE `client_service`.`client_id` = " + client_id + " AND " + where1 + " AND " + where + "  `client_service`.`strategy` = `signals`.`strategy_tag` ORDER BY `signals`.`created_at` DESC", (err, result1) => {
          console.log("SELECT `signals`.*, `client`.`end_date` as `c_last_date`, `categorie`.`segment` as `cat_segment`, `categorie`.`name` as `cat_name`, `client_service`.`strategy` as `client_strategy` FROM `client_service` LEFT JOIN `services` ON `client_service`.`service_id` = `services`.`id` LEFT JOIN `client` ON `client`.`id` = `client_service`.`client_id` LEFT JOIN `signals` ON `signals`.`symbol` = `services`.`service` LEFT JOIN `categorie` ON `categorie`.`CID` = `services`.`categorie_id` WHERE `client_service`.`client_id` = " + client_id + " AND " + where1 + " AND " + where + "  `client_service`.`strategy` = `signals`.`strategy_tag` ORDER BY `signals`.`created_at` DESC");
          res.send({ signals: result1 });

        });

      });
  });


  app.post("/client/symbols", verifyToken, (req, res) => {
    var client_id = req.body.client_id;
    connection1.query("SELECT `client_service`.*, `services`.`service` as `client_service` FROM `client_service` JOIN `client` ON `client`.`id` = `client_service`.`client_id` JOIN `services` ON `services`.`id` = `client_service`.`service_id` WHERE `client_service`.`client_id` = " + client_id + "", (err, result1) => {

      res.send({ symbols: result1 });

    });
  });

}