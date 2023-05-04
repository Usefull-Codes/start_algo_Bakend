module.exports = function (app, connection1) {
    var verifyToken = require('./middleware/awtJwt');

    var dateTime = require('node-datetime');
    app.get('/admin/trading-status', verifyToken, (req, res) => {
        var dt = dateTime.create();
        var ccdate = dt.format('Y-m-d');

        connection1.query('SELECT trading_status_client.*, client.username as username,client.full_name as fname FROM `trading_status_client` LEFT JOIN client ON client.id = trading_status_client.client_id WHERE `trading_status_client`.`created_at`>= "' + ccdate + '" AND `trading_status_client`.`trading` IS NOT NULL AND `trading_status_client`.`trading` != ""  AND`trading_status_client`.`client_id` =  `client`.`id` GROUP BY client.id ORDER BY `trading_status_client`.`created_at` DESC ', (err, result) => {
            console.log("err", err);
            res.send({ tradingStatus: result });
        })
    })

    app.post('/admin/trading-status-client', verifyToken, (req, res) => {
        var dt = dateTime.create();
        var ccdate = dt.format('Y-m-d');
        var client_id = req.body.client_id;
        console.log("Client ID", client_id);
        connection1.query('SELECT trading_status_client.*, client.username as username,client.full_name as fname FROM `trading_status_client` LEFT JOIN client ON client.id = trading_status_client.client_id WHERE `trading_status_client`.`created_at`>= "' + ccdate + '" AND `trading_status_client`.`trading` IS NOT NULL AND `trading_status_client`.`trading` != "" AND `trading_status_client`.`client_id` = "' + client_id + '" ORDER BY `trading_status_client`.`created_at` DESC', (err, result) => {

            console.log("err", err)
            res.send({ tradingStatus: result })
            console.log({ tradingStatus: result });
        })
    })

    app.post('/admin/tradingStatusSubadmin', verifyToken, (req, res) => {
        var admin_id = req.body.admin_id;
        var dt = dateTime.create();
        var ccdate = dt.format('Y-m-d');
        connection1.query('SELECT trading_status_client.*, client.username as username,client.full_name as fname FROM `trading_status_client` LEFT JOIN client ON client.id = trading_status_client.client_id WHERE `trading_status_client`.`created_at`>= "' + ccdate + '" AND `trading_status_client`.`trading` IS NOT NULL AND `trading_status_client`.`trading` != "" AND `client`.`subadmin_id` = "' + admin_id + '" ORDER BY `trading_status_client`.`created_at` DESC', (err, result) => {
            console.log("err", err);
            res.send({ tradingStatus: result });
        })
    })




    app.get('/admin/newtrading-status', verifyToken, (req, res) => {
        var dt = dateTime.create();
        var ccdate = dt.format('Y-m-d');

        connection1.query('SELECT id,full_name,email,username,mobile,end_date,licence_type,trading_type,login_status FROM `client` WHERE end_date >="' + ccdate + '" AND licence_type=2', (err, result) => {
            console.log("err", err);
            res.send({ tradingStatus: result });
        })
    })



    app.get('/admin/trade/execution', (req, res) => {

        var dt = dateTime.create();
        var ccdate = dt.format('Y-m-d');

        var brokerRes1 = []
        var brokerRes = []

        connection1.query('SELECT broker_response.id,broker_response.created_at,broker_response.client_id,broker_response.symbol,broker_response.order_status,broker_response.reject_reason,broker_response.trading_status,client.username,client.broker ,broker_response.receive_signal FROM `broker_response` JOIN `client` ON client.id =broker_response.client_id WHERE ( `broker_response`.`order_status` NOT IN ("complete","Fully Executed") OR `broker_response`.`order_status` IS NULL )  AND `broker_response`.`created_at` LIKE "%' + ccdate + '%" GROUP BY broker_response.receive_signal;', (err, result) => {

            const ArrLength = result.length

            result.forEach((val) => {

                brokerRes.push({
                    id: val.id,
                    username: val.username,
                    symbol: val.symbol,
                    broker: val.broker,
                    order_status: val.order_status,
                    reject_reason: val.reject_reason,
                    receive_signal: val.receive_signal === null ? " " : Buffer.from(val.receive_signal, 'base64').toString('ascii'),
                    created_at: val.created_at,
                    trading_status:val.trading_status

                })

            })
            // console.log("brokerRes",brokerRes)


            connection1.query('SELECT broker_response.id,broker_response.created_at,broker_response.client_id,broker_response.symbol,broker_response.order_status,broker_response.reject_reason,broker_response.trading_status,client.username,client.broker ,broker_response.receive_signal FROM `broker_response` JOIN `client` ON client.id =broker_response.client_id WHERE ( `broker_response`.`order_status` NOT IN ("complete","Fully Executed") OR `broker_response`.`order_status` IS NULL )  AND `broker_response`.`created_at` LIKE "%' + ccdate + '%" ', (err, result1) => {




                result1.forEach((item) => {

                    brokerRes1.push({
                        id: item.id,
                        username: item.username,
                        symbol: item.symbol,
                        broker: item.broker,
                        order_status: item.order_status,
                        reject_reason: item.reject_reason,
                        receive_signal: item.receive_signal === null ? " " : Buffer.from(item.receive_signal, 'base64').toString('ascii'),
                        created_at: item.created_at,
                        trading_status:item.trading_status

                    })

                })


                connection1.query('SELECT count(*) FROM `broker_response` WHERE `created_at` LIKE "%' + ccdate + '%" GROUP BY client_id', (err, ClientCount) => {

                    var lenghtClient = ClientCount.length

                    if (brokerRes.length == ArrLength) {
    
                        res.send({ tradeExecution: brokerRes, tradeExecution1: brokerRes1 ,ClientCount:lenghtClient});
                    }
                })


            })






        })
    })







}