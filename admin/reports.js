module.exports = function (app, connection1) {
   var verifyToken = require('./middleware/awtJwt');

   app.get("/admin/reports", verifyToken, (req, res) => {
      var d = new Date;
      const dformat = [d.getFullYear(),
      d.getMonth() + 1,
      d.getDate()
      ].join('-');
      connection1.query('SELECT *  FROM client where licence_type = 2 order by `full_name` ASC;SELECT * FROM client where licence_type = 2 AND end_date >= "' + dformat + '" order by `full_name` ASC;SELECT * FROM client where licence_type = 2 AND end_date < "' + dformat + '" order by `full_name` ASC;SELECT * FROM client where licence_type = 1 order by `full_name` ASC;SELECT * FROM client where licence_type = 1 AND end_date >= "' + dformat + ' order by `full_name` ASC";SELECT *  FROM client where licence_type = 1 AND end_date < "' + dformat + '" order by `full_name` ASC;SELECT *  FROM client where licence_type = 2 OR licence_type = 1 order by `full_name` ASC;SELECT * FROM client where licence_type = 2 AND to_month > 0 AND twoday_service=1;SELECT * FROM `client` WHERE licence_type=2 AND twoday_service =1;SELECT * FROM client where licence_type = 2 AND twoday_service=1 AND to_month = 0 AND end_date >= "' + dformat + '"', [1, 2, 3, 4, 5, 6, 7, 8,9], (err, result) => {
         console.log('888',result[7]);
         res.send({ total_live: result[0], active_live: result[1], expire_live: result[2], total_demo: result[3], active_demo: result[4], expire_demo: result[5], total: result[6],two_dayconvert:result[7],two_dayTotal:result[8],two_dayActive:result[9]});
      });
   });


   app.post("/reports/strategies", verifyToken, (req, res) => {
      var id = req.body.user_id;
      connection1.query('SELECT `client_service`.*, `services`.`service` as `ser_name`, `client`.`status` as `client_status`, `client`.`full_name` as `client_name`, `client`.`created_at` as `s_date`, `client`.`id` as `client_id`, `categorie`.`segment` as `cat_segment`, `categorie`.`name` as `cat_name` FROM `client_service` LEFT JOIN `services` ON `services`.`id` = `client_service`.`service_id` LEFT JOIN `client` ON `client`.`id` = `client_service`.`client_id` LEFT JOIN `categorie` ON `categorie`.`id` = `services`.`categorie_id` WHERE `client_service`.`client_id` = "' + id + '"', (err, result) => {
         res.send({ response: result });
      });
   });

} 