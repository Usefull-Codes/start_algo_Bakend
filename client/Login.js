module.exports = function (app, connection1) {
    var verifyToken = require('./middleware/awtJwt');
    const jwt = require("jsonwebtoken");
    var { CommonEmail } = require(`../Common/SendEmails/CommonEmail.js`);
    const path = require('path');
    const bcrypt = require("bcrypt");
    
    var dateTime = require('node-datetime');
    var dt = dateTime.create();
    var ccdate = dt.format('Y-m-d H:M:S');



    app.post("/smartalgo/client/login", (req, res) => {
        var username = req.body.username;
        var password = req.body.password;
        connection1.query('SELECT * from client where `username`="' + username + '"', async (err, result) => {

            if (result.length !== 0) {
                var existPassword = await result[0].new_password

                const validPassword = await bcrypt.compare(password, existPassword);

                // connection1.query('SELECT * from client where `username`="' + username + '" AND `new_password`="' + validPassword + '"', (err, result) => {
                if (validPassword) {
                    var token = jwt.sign({ id: result[0].id }, 'shhhhh', {
                        expiresIn: 86400 // 24 hours
                    });


                    var end_date_live = dateTime.create(result[0].end_date);
                    var end_date = end_date_live.format('Y-m-d');
                    var msg = { 'name': result[0].username, 'full_name': result[0].full_name, 'user_id': result[0].id, 'token': token, 'is_term': result[0].is_term, 'mobile': result[0].mobile, 'status': result[0].status, 'expiry': end_date, "expiry_status": result[0].expiry_status };
                    res.send({ success: 'true', msg: msg });

                } else {
                    res.send({ success: 'false', msg: "Password is incorrect" });
                }

                // });
            } else {
                res.send({ success: 'false', msg: "Username  is incorrect" });
            }
        });
    });

    app.post("/client/profile", verifyToken, (req, res) => {

        var id = req.body.client_id;

        connection1.query('SELECT * from client where `id`="' + id + '"', (err, result) => {

            if (result.length != 0) {

                res.send({ success: 'true', msg: result[0] });
            }

        });
    });


    app.post("/smartalgo/client/LoginStatusUpdate", (req, res) => {
        var id = req.body.client_id;
        var status = 1;
        connection1.query('UPDATE `client` SET `login_status`= "' + status + '" WHERE `id`="' + id + '"', (err, result) => {
            res.send(result);

        });

    });

    app.post("/smartalgo/client/LoginStatusGet", (req, res) => {
        var id = req.body.client_id;
        connection1.query('SELECT login_status from client where `id`="' + id + '"', (err, result) => {
            res.send(result[0]);

        });

    });


    app.post("/smartalgo/client/expiry-status-update", verifyToken, (req, res) => {
        var id = req.body.client_id;

        connection1.query('UPDATE `client` SET `expiry_status`= "0" WHERE `id`="' + id + '"', (err, result) => {

            res.send({ success: 'true', msg: [] });

        });
    });


    app.post("/client/profile/broker_detail", verifyToken, (req, res) => {
        var id = req.body.client_id;


        connection1.query('SELECT broker from client where `id`="' + id + '"', (err, result) => {

            if (result.length != 0) {

                res.send({ success: 'true', msg: result[0] });
            }

        });
    });

    app.post("/smartalgo/client/setnewpassword", (req, res) => {
        var password = req.body.newPassword;
        var username = req.body.username;
        var id = req.body.client_id;

        connection1.query('SELECT * FROM `client_key_prefix_letters` WHERE `id` = "1"', async (err, prefix_result) => {
            var panel_name = prefix_result[0].panel_name;
            var domain_url_https = prefix_result[0].domain_url_https;

            const salt = await bcrypt.genSalt(10);
            // now we set user password to hashed password
            var ByCryptpassword = await bcrypt.hash(password.toString(), salt);

            connection1.query('UPDATE `client` SET `new_password` = "' + ByCryptpassword + '",`is_term`="1" WHERE `id`="' + id + '"', (err, result) => {
                if (result.length != 0) {

                    connection1.query('SELECT * from client where `id`="' + id + '"', (err, client_result) => {

                        var name = client_result[0].full_name;
                        var email = client_result[0].email;
                        var username = client_result[0].username;

                        const toEmail = email;
                        const subjectEmail = "User ID and Password";
                        const htmlEmail = "<p>Dear " + name + "  Your Username  And Password</p><p>User Name / User ID : " + username + " </p><p> Login Password : " + password + "</p>";
                        const subject2Email = "" + name + "  Accept Terms and Conditions of '" + panel_name + "'";
                        const html2Email = "<p>Dear " + name + "</p><p>All subscription fees paid to '" + panel_name + "' is Non refundable. We do not provide trading tips not we are investment adviser. Our service is solely restricted to automated trading application development, deployment and maintenance. All algorithms are based on backtested data but we do not provide any guarantee for their performance in future. The algorithm running in an automated system is agreed with the user prior deployment and we do not take any liability for any loss generated by the same. Past performance of advise/strategy/model does not indicate the future performance of any current or future strategy/model or advise by  '" + panel_name + "'  Trades and actual returns may differ       significantly from that depicted herein due to various factors including but not limited to impact costs, expense charged, timing of entry/exit, timing of additional flows/redemptions, individual client mandates, specific portfolio construction characteristics etc. There is no assurance or guarantee that the objectives of any strategy/model or advice provided by  '" + panel_name + "'  Trades will be achieved.  '" + panel_name + "'  Trades or any of its partner/s or principal officer/employees do not assure/give guarantee for any return on the investment in strategies/models/advice given to the Investor. The value of investment can go up/down depending on factors & forces affecting securities markets '" + panel_name + "' Trades or its associates are not liable or responsible for any loss or shortfall arising from operations and affected by the market condition.</p><p>Assuring you of our best services at all times<br>Best regards</p><p>**************************************************************************</p><p>This is a system generated mail, so please do not reply to this email id.</p><p>**************************************************************************</p>"

                        CommonEmail(toEmail, subjectEmail, htmlEmail);
                        CommonEmail(toEmail, subject2Email, html2Email);

                    });



                    res.send({ success: 'true', msg: [] });
                }

            });

        });
    });



    app.post("/client/tradingoff", verifyToken, (req, res) => {
        var id = req.body.client_id;

        connection1.query('UPDATE `client` SET `access_token` = " ", `trading_type` = "off" WHERE `id`="' + id + '"', (err, result) => {
            // console.log(result);
            if (result.length != 0) {

                res.send({ success: 'true', msg: result[0] });
            }

        });
    });


    app.post("/client/ChangePassword", verifyToken, (req, res) => {
        // console.log("dhfjhg", JSON.stringify(JSON.parse(req.body.data), null, 2))
        var id = req.body.client_id;
        var old_password = req.body.data.old_password;
        var new_password = req.body.data.new_password;
        connection1.query('SELECT * FROM `client_key_prefix_letters` WHERE `id` = "1"', (err, prefix_result) => {

            var panel_name = prefix_result[0].panel_name;
            var domain_url_https = prefix_result[0].domain_url_https;

            connection1.query('SELECT * from client where `id`="' + id + '"', async (err, result) => {

                var email = result[0].email;
                var username = result[0].username;
                var name = result[0].full_name;

                const validPassword = await bcrypt.compare(old_password.toString(), result[0].new_password);

                if (!validPassword) {
                    res.send({ success: 'false', msg: 'old Password Not Match' });
                } else {
                    const salt = await bcrypt.genSalt(10);
                    // now we set user password to hashed password
                    var ByCrypt_password = await bcrypt.hash(new_password.toString(), salt);

                    connection1.query('UPDATE `client` SET `new_password` = "' + ByCrypt_password + '" WHERE `id`="' + id + '"', (err, result) => {



                        const toEmail = email;
                        const subjectEmail = "Password Changed  " + username + "  " + panel_name;
                        const htmlEmail = "<p>Dear " + name + "  Your Username  And Password</p><p>User Name / User ID : " + username + " </p><p> Login Password : " + new_password + "</p><p>Login Url : <a href='" + domain_url_https + "' target='_blank'>" + domain_url_https + "</a></p>";

                        CommonEmail(toEmail, subjectEmail, htmlEmail);


                        res.send({ success: 'true', msg: 'Password Changed successFully....' });
                    });

                }

            });
        });
    });


    app.post("/client/forgotpassword", (req, res) => {
        var email = req.body.email;

        connection1.query('SELECT * from client where `email`="' + email + '"', (err, result) => {

            var id = 1;
            connection1.query('SELECT * from client_key_prefix_letters where `id`="' + id + '"', (err, res_domain) => {

                var domain_url_https = res_domain[0].domain_url_https;

                // console.log("dsgjh",result)
                if (result.length === 0) {
                    res.send({ status: 'false', msg: "This email is not registered with us." });
                } else {

                    // var id = 1;
                    // connection1.query('SELECT * FROM `email_config` WHERE `id`=' + id, (err, result) => {

                    //     var companyDetails = result[0]

                    const toEmail = email;
                    const subjectEmail = "Forgot Password";
                    const htmlEmail = `<a href="${domain_url_https}/#/client/resetpassword">Reset Password</a>`;
                    const textEmail = ''


                    CommonEmail(toEmail, subjectEmail, htmlEmail, textEmail, res);
                    // res.send({ msg: "Mail send successfully" })6


                    // const transport = nodemailer.createTransport({
                    //     host: companyDetails.smtphost,
                    //     port: companyDetails.smtpport,
                    //     ignoreTLS: false,
                    //     secure: false,
                    //     // secure: false,
                    //     // requireTLS: true,
                    //     auth: {
                    //         user: companyDetails.email,
                    //         pass: companyDetails.smtp_password
                    //     }
                    // });
                    // var mailOptions = {
                    //     from: companyDetails.email,
                    //     to: email,
                    //     subject: "Forgot Password",
                    //     html: "<a href='http://180.149.241.17:3000/client/resetpassword'>Reset Password</a>"
                    // };
                    // transport.sendMail(mailOptions, function(err, info) {
                    //     if (err) {
                    //         console.warn(err);
                    //         res.send({ status: 'Failed!!!' })
                    //     } else {
                    //         console.warn("Email has been sent", info.response);
                    //         res.send({ status: 'success!!!', msg: "Mail send successfully" })
                    //     }
                    // });
                    // });
                }

            });

        });
    });


    app.post("/client/resetpassword", (req, res) => {
        var email = req.body.email
        var password = req.body.password;

        connection1.query('SELECT email from client where `email`="' + email + '"', async (err, result) => {

            if (result.length !== 0 && result[0].email == email) {
                const salt = await bcrypt.genSalt(10);
                // now we set user password to hashed password
                var ByCrypt_password = await bcrypt.hash(password.toString(), salt);


                connection1.query('UPDATE client SET `new_password`="' + ByCrypt_password + '" where `email`= "' + email + '"', (err, result) => {
                    console.log(err);
                    res.send({ status: true, msg: "Password Updated Successfully.." });
                });
            } else {
                res.send({ status: false, msg: "Your email is not registered" })
            }
        })
    });

    app.post("/client/updatedeatils", verifyToken, (req, res) => {
        var client_id = req.body.client_id
        var reandomClientKey = req.body.reandomClientKey
        var web_url = req.body.data.web_url
        var userdata = req.body.data;


        var dt = dateTime.create();
        var ccdate = dt.format('Y-m-d H:M:S');
        // cheack
        // console.log("web_url", web_url);
        // console.log("web_url typeof", typeof web_url);

        console.log("client_id", client_id);
        var web_u = '';
        if (web_url == 1) {
            web_u = "Update Admin Web Url";
        } else if (web_url == 2) {
            web_u = "Update Individual Web Url";
        } else {
            web_u = ""
        }

        connection1.query('SELECT * FROM `client` WHERE `id` = "' + client_id + '"', (err, db_exist_service) => {

            connection1.query('UPDATE client SET `api_key`="' + userdata.api_key + '",`api_secret`="' + userdata.api_secret + '",`app_id`="' + userdata.app_id + '",`demat_userid`="'+userdata.demat_userid+'",`client_code`="' + userdata.client_code + '",`api_type`="' + userdata.api_type + '",`web_url`="' + userdata.web_url + '",`client_key`="' + reandomClientKey + '" where `id`="' + client_id + '"', (err, result) => {
                // console.log("db_exist_service :-", db_exist_service[0].api_key);
                // console.log("db_exist_service web url", db_exist_service[0].web_url);

                if (db_exist_service[0].api_key != userdata.api_key) {

                    connection1.query('INSERT INTO `count_broker_apikey`  (`client_id`,`api_key`,`created_at`) VALUES ("' + userdata.id + '","' + userdata.api_key + '","' + ccdate + '")', (err, result) => {

                    });

                }

                if (db_exist_service[0].demat_userid != userdata.demat_userid) {

                    connection1.query('INSERT INTO `count_broker_apikey`  (`client_id`,`api_key`,`created_at`) VALUES ("' + userdata.id + '","' + userdata.demat_userid + '","' + ccdate + '")', (err, result) => {

                    });

                }

                if (db_exist_service[0].api_secret != userdata.api_secret) {

                    connection1.query('INSERT INTO `count_broker_apikey`  (`client_id`,`api_secret`,`created_at`) VALUES ("' + userdata.id + '","' + userdata.api_secret + '","' + ccdate + '")', (err, result) => {
                    });

                }

                if (db_exist_service[0].web_url != web_url) {
                    connection1.query('INSERT INTO `trading_status_client`  (`client_id`,`service_name`,`created_at`,`trading`) VALUES ("' + client_id + '","' + web_u + '","' + ccdate + '","")', (err, result) => {
                      
                    });

                }




                console.log(err)
                res.send({ status: true, msg: "Details Updated Successfully.." })

            });
        })
    });

}