module.exports = function(app, connection1) {
    var dateTime = require('node-datetime');
    var verifyToken = require('./middleware/awtJwt');


    app.post("/admin/themecolorupdate", verifyToken, (req, res) => {
        var headerColor = req.body.headerColor;
        var backgroundColor = req.body.backgroundColor;
        var fontColor = req.body.fontColor;

        var dt = dateTime.create();
        var ccdate = dt.format('Y-m-d H:M:S');

        var id = 1;
        connection1.query('UPDATE `theme_color_code` SET `header_color`="' + headerColor + '",`background_color`="' + backgroundColor + '",`font_color`="' + fontColor + '",`updated_at`="' + ccdate + '"  WHERE `id`=' + id, (err, result) => {
            res.send({ status: true, msg: 'update theme sucessfully' });
        });
    });

    app.get("/admin/themecolors", (req, res) => {
        connection1.query('SELECT * FROM `theme_color_code`', (err, result) => {
            res.send({ theme_color_code: result });
        });
    });

}