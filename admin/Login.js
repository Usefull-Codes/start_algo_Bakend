module.exports = function (app, connection1) {
    var { CommonEmail } = require(`../Common/SendEmails/CommonEmail.js`);
    const jwt = require("jsonwebtoken");
    var verifyToken = require('./middleware/awtJwt');
    const bcrypt = require("bcrypt");




    app.post("/smartalgo/admin/login", (req, res) => {
        var email = req.body.email;
        var password = req.body.password;
        connection1.query('SELECT * from tbl_users where `email`="' + email + '"', async (err, result) => {

            if (result.length != 0) {
                var existPassword = await result[0].new_password

                const validPassword = await bcrypt.compare(password, existPassword);
                if (validPassword) {
                    var token = jwt.sign({ id: result[0].userId }, 'shhhhh', {
                        expiresIn: 86400 // 24 hours
                    });





                    var msg = {
                        'name': result[0].name, 'token': token, 'adminId': result[0].userId, 'mobile': result[0].mobile, 'roleId': result[0].roleId, 'createdBy': result[0].createdBy, "add__edit_live": result[0].add__edit_live, "edit_live": result[0].editClient_live, "goto_dashboard": result[0].goto_dashboard, "license_permission": result[0].license_permission, "group_permission": result[0].group_permission, "strategy_permission": result[0].strategy_permission,"groupServicesPermission":result[0].groupServicesPermission
                    };
                    
                    res.send({ success: 'true', msg: msg });

                } else {
                    res.send({ success: 'false', msg: "Password is incorrect" });
                }
            } else {
                res.send({ success: 'false', msg: "email  is incorrect" });
            }
        });
    });

    app.post("/smartalgo/admin/forgotpassword", (req, res) => {
        var { CommonEmail } = require(`../Common/SendEmails/CommonEmail.js`);

        var email = req.body.email;

        connection1.query('SELECT * from tbl_users where `email`="' + email + '"', (err, result) => {
      
            var id = 1;
            connection1.query('SELECT * from client_key_prefix_letters where `id`="' + id + '"', (err, res_domain) => {

                var domain_url_https = res_domain[0].domain_url_https;
                if (result.length === 0) {
                    res.send({ status: false, msg: "This email is not registered with us." });
                } else {

                    const toEmail = email;
                    const subjectEmail = "Forgot Password";
                    const htmlEmail = `<a href="${domain_url_https}/#/admin/reset-password">Reset Password</a>`;
                    const textEmail = '';

                    CommonEmail(toEmail, subjectEmail, htmlEmail, textEmail, res)


                    //     const transport = nodemailer.createTransport({
                    //       host: 'smtp.gmail.com',
                    //       port: 587,
                    //       ignoreTLS: false,
                    //   secure: false,
                    //       // secure: false,
                    //       // requireTLS: true,
                    //       auth: {
                    //         user: '',
                    //         pass: ''
                    //     }
                    //   });
                    //   var mailOptions = {
                    //     from: '',
                    //     to: email,
                    //     subject: "Forgot Password",
                    //     html:"<a href='http://180.149.241.17:3000/admin/reset-password'>Reset Password</a>"
                    // };
                    //   transport.sendMail(mailOptions, function(err, info) {
                    //       if (err) {
                    //           console.warn(err);
                    //           res.send({ status: 'Failed!!!' })
                    //       } else {
                    //           console.warn("Email has been sent", info.response);
                    //           res.send({ status: 'success!!!',msg:"Mail send successfully" })
                    //       }
                    //   });
                }

            });

        });
    });

    app.post("/smartalgo/admin/resetpassword", (req, res) => {
        var email = req.body.email
        var password = req.body.password;

        connection1.query('SELECT email from tbl_users where `email`="' + email + '"', async (err, result) => {
            if (result.length !== 0 && result[0].email == email) {
                const salt = await bcrypt.genSalt(10);
                // now we set user password to hashed password
                var ByCrypt_password = await bcrypt.hash(password.toString(), salt);

                connection1.query('UPDATE tbl_users SET `new_password`="' + ByCrypt_password + '" where `email`="' + email + '"', (err, result) => {
              
                    res.send({ status: true, msg: "Password Updated Successfully.." })

                });
            } else {
                res.send({ status: false, msg: "Your email is not registered" })
            }

        });


    });


    app.post("/smartalgo/admin/LoginStatusUpdate", verifyToken, (req, res) => {
        var id = req.body.adminId;
        var status = 1;
        connection1.query('UPDATE `tbl_users` SET `admin_login_status`= "' + status + '" WHERE `userId`="' + id + '"', (err, result) => {
            res.send(result);

        });
    });

    app.post("/smartalgo/admin/LoginStatusGet", verifyToken, (req, res) => {
        var id = req.body.adminId;
        connection1.query('SELECT admin_login_status from tbl_users where `userId`="' + id + '"', (err, result) => {
   
            res.send(result[0]);

        });
    });

    //For Admin Password Static Bycript

    app.post("/smartalgo/admin/passbycript", async (req, res) => {

        var password = req.body.password;

        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        var ByCrypt_password = await bcrypt.hash(password.toString(), salt);
        res.send({ bycript_pass: ByCrypt_password })
    });

}