module.exports = function (app, connection1) {
  var verifyToken = require('./middleware/awtJwt');
  var dateTime = require('node-datetime');

  app.post("/client/services", verifyToken, (req, res) => {
    var client_id = req.body.client_id;
    // console.log(req.body);
    connection1.query('SELECT `client_service`.*, `categorie`.`segment` as `segment`, `services`.`service` as `ser_name`, `categorie`.`name` as `cat_name`,`services`.`instrument_token` as `instrument_token` FROM `client_service` JOIN `services` ON `services`.`id` = `client_service`.`service_id` JOIN `categorie` ON `categorie`.`id` = `services`.`categorie_id` WHERE `client_service`.`client_id` = ' + client_id, (err, result1) => {


      connection1.query('SELECT * from company_name', (err, company_names) => {
        // console.log("data", company_names[0].name)

        connection1.query('SELECT `strategy_client`.* FROM `strategy_client` LEFT JOIN `client` ON `client`.`id` = `strategy_client`.`client_id` WHERE `strategy_client`.`client_id`=' + client_id + ' AND strategy_client.strategy NOT IN ("' + company_names[0].name + '")', (err, result2) => {

          connection1.query('SELECT id,broker FROM client WHERE id='+client_id,(err,result3)=>{

            // console.log('SELECT id,broker  FROM client WHERE id='+client_id);
            res.send({ services: result1, strategy: result2 ,broker:result3});
          })
        });
      })
    });
  });






  app.post("/client/updateservices", verifyToken, (req, res) => {
    var client_id = req.body.client_id;
    var client_signal = req.body.client_signal;
    var dataa = '';


    const getOrderTypeName = (ordertype) => {
      if (ordertype == 1) {
        return "MARKET"
      } else if (ordertype == 2) {
        return "LIMIT"
      } else if (ordertype == 3) {
        return "STOPLOSS LIMIT"
      } else if (ordertype == 4) {
        return "STOPLOSS MARKET"
      } else {
        return ""
      }
    }

    const getProductTypeName = (producttype) => {
      if (producttype == 1) {
        return "CNC"
      } else if (producttype == 2) {
        return "MIS"
      } else if (producttype == 3) {
        return "BO"
      } else if (producttype == 4) {
        return "CO"
      } else {
        return ""
      }
    }

    const getTradingStatus = (status) => {
      // console.log("status", status)
      if (status == "1") {
        // console.log("status1", status)

        return "ON"
      }
      if (status == "0") {
        // console.log("status0", status)

        return "OFF"
      }
      if (status == "") {
        // console.log("status=", status)

        return ""
      }
    }

    connection1.query('SELECT `client_service`.*, `services`.`service` as `ser_name`, `client`.`status` as `client_status`, `client`.`full_name` as `client_name`, `client`.`created_at` as `s_date`, `client`.`id` as `client_id`, `categorie`.`segment` as `cat_segment`, `categorie`.`name` as `cat_name` FROM `client_service` LEFT JOIN `services` ON `services`.`id` = `client_service`.`service_id` LEFT JOIN `client` ON `client`.`id` = `client_service`.`client_id` LEFT JOIN `categorie` ON `categorie`.`id` = `services`.`categorie_id` WHERE `client_service`.`client_id` =' + client_id, (err, result_previous_data) => {

      // console.log('p data -',result_previous_data);


      // console.log('n data -',client_signal);



      var newData = []

      result_previous_data.forEach((item, i) => {
        if (result_previous_data[i].strategy !== client_signal[i].strategy || result_previous_data[i].qty !== client_signal[i].qty || result_previous_data[i].order_type !== client_signal[i].order_type || result_previous_data[i].product_type !== client_signal[i].product_type || result_previous_data[i].trading !== client_signal[i].trading) {
          newData.push({ "service_id": client_signal[i].service_id, "service_name": client_signal[i].ser_name, "client_id": client_signal[i].client_id, "qty": client_signal[i].qty !== result_previous_data[i].qty ? client_signal[i].qty : "", "strategy": client_signal[i].strategy !== result_previous_data[i].strategy ? client_signal[i].strategy : "", "order_type": client_signal[i].order_type !== result_previous_data[i].order_type ? client_signal[i].order_type : "", "product_type": client_signal[i].product_type !== result_previous_data[i].product_type ? client_signal[i].product_type : "", "trading": client_signal[i].trading !== result_previous_data[i].trading ? client_signal[i].trading : "" })
        }
      })
      // console.log("Item",newData)
      var dt = dateTime.create();
      var ccdate = dt.format('Y-m-d H:M:S');
      newData.forEach(function (item, index) {
        connection1.query('INSERT INTO `trading_status_client` (`service_id`,`service_name`,`client_id`,`qty`,`strategy`,`order_type`,`product_type`,`trading`,`created_at`,`user_status`) VALUES ("' + item.service_id + '","' + item.service_name + '","' + item.client_id + '","' + item.qty + '","' + item.strategy + '","' + getOrderTypeName(item.order_type) + '","' + getProductTypeName(item.product_type) + '","' + getTradingStatus(item.trading) + '","' + ccdate + '","3")', (err, result) => {
          // console.log("err", err);

        })
      })


    });




    client_signal.forEach(function (item, index) {
      // console.log('loop- c l ids ',item.id);
      connection1.query('UPDATE `client_service` SET `qty` = "' + item.qty + '", `trading` = "' + item.trading + '", `strategy` = "' + item.strategy + '", `order_type` = "' + item.order_type + '",`product_type`="' + item.product_type + '" WHERE `id` = "' + item.id + '" AND `service_id` = "' + item.service_id + '" AND `client_id` = "' + client_id + '"', (err, result) => {

        //console.log('result c l - ',result)

      });
    });

    res.send({ services: 'true' });



    // client_signal.forEach(function(item,index){
    //  dataa+='("'+item.service_id+'","'+client_id+'","'+item.start_date+'","'+item.end_date+'","'+item.status+'","'+item.qty+'","'+item.order_type+'","'+item.product_type+'","'+item.created_at+'","'+item.strike+'","'+item.expiry+'","'+item.prod_type+'","'+item.exchange+'","'+item.position+'","'+item.position_put+'","'+item.trading+'","'+item.strategy+'"),';
    // });
    // dataa = dataa.slice(0, -1); 
    // connection1.query('Delete from client_service Where `client_id`='+client_id, (err, result1) => {
    // });

    // connection1.query('INSERT INTO `client_service`(`service_id`, `client_id`, `start_date`, `end_date`, `status`, `qty`, `order_type`, `product_type`, `created_at`, `strike`, `expiry`, `prod_type`, `exchange`, `position`, `position_put`, `trading`, `strategy`) VALUES '+dataa+'', (err, result) => {

    //  console.log(result)
    //    res.send({ services: 'true' });
    //  });

  });
}