module.exports = function(app, connection1) {
    var verifyToken = require('./middleware/awtJwt');
    var { CommonEmail } = require(`../Common/SendEmails/CommonEmail.js`);
    const bcrypt = require("bcrypt");


    app.post("/smartalgo/admin/admin-profile", verifyToken, (req, res) => {
        const AdminId = req.body.adminId

        //  console.log("fhg",adminId)
        connection1.query('SELECT * FROM `tbl_users` WHERE `userId` = "' + AdminId + '"', (err, result) => {
            console.log(err)
                // console.log("result", result)
            res.send(result)

        });
    });


    app.post("/smartalgo/admin/changepassword", verifyToken, (req, res) => {
        var { CommonEmail } = require(`../Common/SendEmails/CommonEmail.js`);

        var AdminId = req.body.adminId;
        var old_password = req.body.old_password;
        var new_password = req.body.new_password;
        connection1.query('SELECT * FROM `client_key_prefix_letters` WHERE `id` = "1"', (err, prefix_result) => {

            var panel_name = prefix_result[0].panel_name;
            var domain_url_https = prefix_result[0].domain_url_https;



            connection1.query('SELECT * from `tbl_users` where `userId`="' + AdminId + '"', async(err, result) => {

                var name = result[0].name;
                var email = result[0].email;

                const validPassword = await bcrypt.compare(old_password.toString(), result[0].new_password);

                if (!validPassword) {
                    res.send({ success: 'false', msg: 'old Password Not Match' });
                } else {
                    const salt = await bcrypt.genSalt(10);
                    // now we set user password to hashed password
                    var ByCrypt_password = await bcrypt.hash(new_password.toString(), salt);

                    connection1.query('UPDATE `tbl_users` SET `new_password` = "' + ByCrypt_password + '" WHERE `userId`="' + AdminId + '"', (err, result) => {
                        res.send({ success: 'true', msg: 'Password Changed successFully....' });


                        const toEmail = email;
                        const subjectEmail = "Password Changed  " + name + "  " + panel_name;
                        const htmlEmail = "<p>Dear " + name + "  Your Email  And Password</p><p>User Name / Email ID : " + email + " </p><p> Login Password : " + new_password + "</p><p>Login Url : <a href='" + domain_url_https + "/#/admin/login' target='_blank'>" + domain_url_https + "/#/admin/login</a></p>";

                        CommonEmail(toEmail, subjectEmail, htmlEmail);


                    });

                }

            });

        });
    });


}