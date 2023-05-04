module.exports = function (app, connection1) {
    var dateTime = require('node-datetime');
    var verifyToken = require('./middleware/awtJwt');

    app.post('/client/trading-status', verifyToken, (req, res) => {
        var client_id = req.body.client_id;

        var date = new Date()
        const previous = new Date(date.getTime());
        previous.setDate(date.getDate() - 2);

        var dt = dateTime.create(previous);
        var ccdate = dt.format('Y-m-d');
        console.log("node-datetime", ccdate);

        connection1.query('SELECT * FROM `trading_status_client` Where `client_id` = "' + client_id + '" AND created_at >= "'+ccdate+'" ORDER BY id DESC', (err, result) => {
            console.log("err", err);
            res.send({ tradingStatus: result });
        })
    })

    app.post('/client/trading-status-update', verifyToken, (req, res) => {
        var client_id = req.body.client_id;
        var trading = req.body.trading;
        var dt = dateTime.create();
        var ccdate = dt.format('Y-m-d H:M:S');

        if (client_id && trading) {
            connection1.query('INSERT INTO `trading_status_client` (`client_id`,`trading`,`created_at`) VALUES ("' + client_id + '","' + trading + '","' + ccdate + '")', (err, result) => {
                console.log("err", err);
                if (err) {
                    res.send(err)
                }
                res.send({ success: 'true', msg: [] })
            })
        } else {
            res.send({ success: 'false', msg: [] })
        }
    })


}