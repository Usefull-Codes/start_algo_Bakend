module.exports = function(app, connection1) {
    var dateTime = require('node-datetime');
  var verifyToken = require('./middleware/awtJwt');

    app.post("/client/broker-response",verifyToken, (req, res) => {
        var client_id = req.body.client_id;
        var dt = dateTime.create();
        var ccdate = dt.format('Y-m-d');

        connection1.query('SELECT * FROM `broker_response` WHERE  `created_at` >= "' + ccdate + '" AND `client_id`= "'+ client_id +'" ORDER BY created_at DESC', (err, result) => {
     
            // var send_request = Buffer.from(result[0].send_request, 'base64').toString('ascii');
            // var order_status = result[0].order_status;
            // var reject_reason = result[0].reject_reason;
            // var created_at = result[0].created_at;

            // console.log("Hexa", Buffer.from(result[0].send_request, 'base64').toString('hex'));
            // console.log("ASCI", Buffer.from(result[0].send_request, 'base64').toString('ascii'));
            var brokerRes = []
            result.forEach((item) => {
                console.log(item.send_request)
                brokerRes.push({
                    send_request: item.send_request === null ? " ":Buffer.from(item.send_request, 'base64').toString('ascii'),
                    order_status: item.order_status,
                    reject_reason: item.reject_reason,
                    created_at: item.created_at,
                    order_id: item.order_id,
                    symbol: item.symbol,
                    receive_signal: item.receive_signal === null ? " ": Buffer.from(item.receive_signal, 'base64').toString('ascii'),
                    trading_status: item.trading_status,
                    broker_enter: item.broker_enter,
                    token_symbol: item.token_symbol === null ? " ": Buffer.from(item.token_symbol, 'base64').toString('ascii'),
                    open_possition_qty: item.open_possition_qty,
                })
            })


            console.log("err", err);
            res.send({ msg: brokerRes });
        });

    });

}