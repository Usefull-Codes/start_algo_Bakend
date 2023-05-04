module.exports = function(app, connection1) {

    var verifyToken = require('./middleware/awtJwt');

    var fs = require('fs-extra')

    var d = new Date,
        dformat = [d.getFullYear(),
            d.getMonth() + 1,
            d.getDate(),
        ].join('/') + ' ' + [d.getHours(),
            d.getMinutes(),
            d.getSeconds()
        ].join(':');



    app.get("/admin/transaction_all_licence",verifyToken, (req, res) => {


        connection1.query('SELECT `licence`, `this_month_licence`, `modifydate_licence` FROM `tbl_users`', (err, result) => {
            res.send({ data: result });
        });
    });


    app.get("/admin/count_licence", verifyToken,(req, res) => {


        connection1.query('SELECT `count_licence`.*, `client`.`full_name` as `client_name`, `client`.`username` as `client_username` FROM `count_licence` LEFT JOIN `client` ON `count_licence`.`client_id`=`client`.`id` ORDER BY `count_licence`.`date_time` DESC', (err, result) => {
            res.send({ data: result });
        });
    });

   


}