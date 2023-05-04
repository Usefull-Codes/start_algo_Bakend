module.exports = function (app, connection1) {
    var dateTime = require('node-datetime');
    const FileDownload = require('js-file-download');
    const bcrypt = require("bcrypt");


    app.get("/admin/subadmins", (req, res) => {
        var roleId = 4;
        connection1.query("SELECT * from `tbl_users` WHERE `roleId`='" + roleId + "' ORDER BY userId DESC", (err, result) => {
         
            res.send({ subadmins: result })
        })
    })


    app.post("/admin/subadmin/add", (req, res) => {
        var { CommonEmail } = require(`../Common/SendEmails/CommonEmail.js`);
        var dt = dateTime.create();
        var ccdate = dt.format('Y-m-d H:M:S');

        var AdminId = req.body.adminId;
        var name = req.body.name;
        var email = req.body.email;
        var mobile = req.body.mobile;
        var password = req.body.password;

        var add_live = req.body.add__edit_live;
        var edit_live = req.body.editClient_live;
        var goto_dashboard = req.body.goto_dashboard;
        var license_permission = req.body.license_permission;
        var group_permission = req.body.group_permission;
        var strategy_permission = req.body.strategy_permission;
        var groupServicesPermission =req.body.groupServicesPermission

        var SubAdmin_strategy = req.body.store_strategy


        const roleId = 4;


        connection1.query('SELECT * FROM `tbl_users` WHERE `email` = "' + email + '"', (err, email_result) => {

            connection1.query('SELECT * FROM `client_key_prefix_letters` WHERE `id` = "1"', async (err, prefix_result) => {
   
                var panel_name = prefix_result[0].panel_name;
                var domain_url_https = prefix_result[0].domain_url_https;

                if (email_result.length > 0) {

                    res.send({ status: 'email_error', msg: 'Email is Already Exist...' })

                } else {

                    const salt = await bcrypt.genSalt(10);
                    // now we set user password to hashed password
                    var ByCrypt_password = await bcrypt.hash(password.toString(), salt);

                    connection1.query('SELECT * from `tbl_users` WHERE `userId`="' + AdminId + '"', (err, result) => {
                        var modifiDate = dateTime.create(result[0].modifydate_licence).format('Y-m-d H:M:S');



                        connection1.query('INSERT INTO `tbl_users` (`email`,`password`,`new_password`,`name`,`mobile`,`roleId`,`createdBy`,`createdDtm`,`licence`,`this_month_licence`,`modifydate_licence`,`add__edit_live`, `editClient_live`, `goto_dashboard`, `license_permission`, `group_permission`, `strategy_permission`,`groupServicesPermission`) VALUES ("' + email + '","' + password + '","' + ByCrypt_password + '","' + name + '","' + mobile + '","' + roleId + '","' + AdminId + '","' + ccdate + '","' + result[0].licence + '","' + result[0].this_month_licence + '","' + modifiDate + '","' + add_live + '","' + edit_live + '","' + goto_dashboard + '","' + license_permission + '","' + group_permission + '","' + strategy_permission + '","'+groupServicesPermission+'")', (err, result) => {
                         
                            var SubInsertId = result.insertId

                            if (SubAdmin_strategy.length > 0) {
                                SubAdmin_strategy.forEach((val) => {
                                    connection1.query('SELECT * FROM `strategy` WHERE name="' + val + '"', (err, SearchStrategy) => {
                                        connection1.query('INSERT INTO `subadmin_strategy`( `subadmin_id`, `strategy_id`, `strategy`) VALUES (' + SubInsertId + ',' + SearchStrategy[0].id + ',"' + SearchStrategy[0].name + '")', (err, AddStg) => {


                                        })
                                    })
                                })
                            }




                            const toEmail = email;
                            const subjectEmail = "SubAdmin User Id And Password";
                            const htmlEmail = "<p>Dear '" + name + "'</p><p>Thank you for choosing " + panel_name + " for Algo Platform. We are pleased to inform that the password of your <br> Algo Platform has been resetted as per details mentioned below:</p><p>Login Details:</p><p>Email Id : <b>'" + email + "'</b><br>Login Password : <b>'" + password + "'</b></p><p>Note : Please Change Your Login Password as per your choice.</p><p>Login Url : <a href='" + domain_url_https + "/#/admin/login' target='_blank'>" + domain_url_https + "/#/admin/login</a></p>";

                            CommonEmail(toEmail, subjectEmail, htmlEmail);

                            res.send({ msg: "Added sucessfully" })
                        })

                    });

                }

            });

        });

    })

    app.post("/admin/subadmin/update", (req, res) => {
        var dt = dateTime.create();
        var ccdate = dt.format('Y-m-d H:M:S');

        var adminId = req.body.adminId;
        var subAdminId = req.body.subAdminId;
        var name = req.body.name;
        var email = req.body.email;
        var mobile = req.body.mobile;
        var password = req.body.password;

        var add_live = req.body.add__edit_live;
        var edit_live = req.body.editClient_live;
        var goto_dashboard = req.body.goto_dashboard;
        var license_permission = req.body.license_permission;
        var group_permission = req.body.group_permission;
        var strategy_permission = req.body.strategy_permission;
        var groupServicesPermission =req.body.groupServicesPermission

        var SubAdmin_strategy = req.body.store_strategy
        // const roleId = 4;
        var new_startegy = []



        connection1.query('UPDATE  `tbl_users` SET `email`="' + email + '",`name`="' + name + '",`mobile`="' + mobile + '",`updatedBy`="' + adminId + '",`updatedDtm`="' + ccdate + '", `add__edit_live`="' + add_live + '", `editClient_live`="' + edit_live + '", `goto_dashboard`="' + goto_dashboard + '", `license_permission`="' + license_permission + '", `group_permission`="' + group_permission + '", `strategy_permission`="' + strategy_permission + '" ,`groupServicesPermission`="'+groupServicesPermission+'" WHERE `userId`="' + subAdminId + '"', (err, result) => {
         


            if (SubAdmin_strategy.length > 0) {


                connection1.query('DELETE FROM `subadmin_strategy` WHERE subadmin_id =' + subAdminId, (err, result) => { })

                SubAdmin_strategy.forEach((val) => {
                    connection1.query('SELECT * FROM `strategy` WHERE name="' + val + '"', (err, result) => {
                      
                        connection1.query('INSERT INTO `subadmin_strategy`( `subadmin_id`, `strategy_id`, `strategy`) VALUES (' + subAdminId + ',' + result[0].id + ',"' + result[0].name + '")', (err, result1) => {

                        })
                    })
                })



            }

            res.send({ msg: "Updated successfully" })
        })
    })









    app.post("/admin/subadmin/delete", (req, res) => {
        var SubAdminId = req.body.subAdminId

        connection1.query('SELECT * FROM `client` WHERE subadmin_id=' + SubAdminId, (err, result1) => {
            if (result1.length > 0) {
                res.send({ status: "failed", msg: "Subadmin cannot be deleted Subadmin has clients" });
            } else {
                connection1.query('DELETE from `tbl_users` WHERE `userId`="' + SubAdminId + '"', (err, result) => {
                
                    res.send({ status: "success", msg: "Deleted Sucessfully.." });
                })
            }
        })




    })


    app.post("/admin/subAdminRoleId", (req, res) => {
        var adminId = req.body.adminId

        connection1.query('SELECT roleId FROM `tbl_users` WHERE `userId` = "' + adminId + '"', (err, result) => {
         
            res.send({ data: result });
        })

    })


    app.post("/subadmin/clientlist", (req, res) => {
        var adminId = req.body.adminId

        // connection1.query('SELECT * FROM `client` WHERE `subadmin_id` = "' + adminId + '"', (err, result) => {
        connection1.query('SELECT * FROM `client` WHERE `subadmin_id` = "' + adminId + '" ORDER BY `id` DESC', (err, result) => {

            res.send({ data: result });
        })


    })

    app.post("/subadmins/get", (req, res) => {
        var userId = req.body.userId;

        connection1.query('SELECT * from `tbl_users` WHERE userId=' + userId, (err, result) => {
        
            res.send({ subadmins: result })
        })
    })

  

    app.post("/admin/subadmin/strategy", (req, res) => {

        var SubadminId = req.body.SubadminId


        connection1.query('SELECT * FROM `subadmin_strategy` WHERE subadmin_id=' + SubadminId, (err, result) => {

            res.send({ Strategy: result })
        })


    })


}