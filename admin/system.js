module.exports = function (app, connection1) {
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
    app.get("/admin/system_email", verifyToken, (req, res) => {


        var id = 1;
        connection1.query('SELECT * FROM `email_config` WHERE `id`=' + id, (err, result) => {
            res.send({ data: result });

        });
    });

    app.get("/admin/system_company", (req, res) => {

        console.log('shakirrrrr');
        var id = 1;
        connection1.query('SELECT * FROM `company_name` WHERE `id`=' + id, (err, result) => {
            res.send({ data: result });
            // console.log("result",result);

        });
    });

    app.post("/admin/smtp_email_update", verifyToken, (req, res) => {
        var email = req.body.data.email;
        var smtp_password = req.body.data.smtp_password;
        var cc_mail = req.body.data.cc_mail;
        var bcc_mail = req.body.data.bcc_mail;
        var smtphost = req.body.data.smtphost;
        var smtpport = req.body.data.smtpport;

        res.send(req.body.data.smtpport);

        var id = 1;
        connection1.query('UPDATE `email_config` SET `email`="' + email + '",`smtp_password`="' + smtp_password + '",`cc_mail`="' + cc_mail + '",`bcc_mail`="' + bcc_mail + '",`smtphost`="' + smtphost + '",`smtpport`="' + smtpport + '"  WHERE `id`=' + id, (err, result) => {
            res.send({ data: result });
        });
    });

    app.post("/admin/company_details_update", verifyToken, (req, res) => {
        const companyName = req.body.name;
        const companySN = req.body.s_name;
        var id = 1;
        var with_broker = req.body.withbroker
        var versions = req.body.versions

        connection1.query('SELECT * FROM `client_key_prefix_letters` WHERE id = "' + id + '"', (err, res_domain) => {

            var domain_url = res_domain[0].domain_url

            connection1.query('SELECT * FROM `company_name` WHERE id = "' + id + '"', (err, result1) => {

                var exist_company_name = result1[0].name
                console.log('req company name -', companyName);
                console.log('exist company name -', exist_company_name);


                connection1.query('UPDATE `company_name` SET `withbroker`="' + with_broker + '" WHERE `id`=' + id, (err, result) => {
                });
                connection1.query('UPDATE `company_name` SET `versions`="' + versions + '"   WHERE `id`=' + id, (err, result) => {
                });

                connection1.query('UPDATE `strategy` SET `name`="' + companyName + '" WHERE name ="' + exist_company_name + '"', (err, result) => {
                    connection1.query('UPDATE `strategy_client` SET `strategy`="' + companyName + '" WHERE strategy ="' + exist_company_name + '"', (err, result) => {

                        connection1.query('UPDATE `client_service` SET `strategy`="' + companyName + '" WHERE strategy ="' + exist_company_name + '"', (err1, result1) => {

                        });
                    });
                });



            })



            if (req.files !== null && req.files.image) {
                const companyL = req.files.image.name
                const companyLogo = companyL.split(".")[0] + (+new Date()) + "." + companyL.split(".")[1]
                const companyFavicon = req.body.favicon

                req.files.image.mv(`${__dirname}/images/${companyLogo}`, err => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send(err);
                    }
                    fs.move(`${__dirname}/images/${companyLogo}`, `/var/www/${domain_url}/images/${companyLogo}`, function (err) {
                        if (err) return console.error(err)

                        connection1.query('UPDATE `company_name` SET `name`="' + companyName + '",`s_name`="' + companySN + '",`image`="' + companyLogo + '",`favicon`="' + companyFavicon + '"  WHERE `id`=' + id, (err, result) => {
                            console.log('okk', result);
                            res.send({ data: result });
                        });
                    });


                })
            } else if (req.files !== null && req.files.favicon) {
                const companyF = req.files.favicon.name
                const companyFavicon = companyF.split(".")[0] + (+new Date()) + "." + companyF.split(".")[1]
                const companyLogo = req.body.image

                req.files.favicon.mv(`${__dirname}/images/${companyFavicon}`, err => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send(err);
                    }
                    fs.move(`${__dirname}/images/${companyFavicon}`, `/var/www/${domain_url}/images/${companyFavicon}`, function (err) {
                        if (err) return console.error(err)

                        connection1.query('UPDATE `company_name` SET `name`="' + companyName + '",`s_name`="' + companySN + '",`image`="' + companyLogo + '",`favicon`="' + companyFavicon + '"  WHERE `id`=' + id, (err, result) => {
                            console.log('okk', result);
                            res.send({ data: result });
                        });

                    });

                });

            } else if (req.files !== null && req.files.image && req.files.favicon) {
                const companyL = req.files.image.name
                const companyLogo = companyL.split(".")[0] + (+new Date()) + "." + companyL.split(".")[1]
                const companyF = req.files.favicon.name
                const companyFavicon = companyF.split(".")[0] + (+new Date()) + "." + companyF.split(".")[1]
                req.files.image.mv(`${__dirname}/images/${companyLogo}`, err => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send(err);
                    }
                    fs.move(`${__dirname}/images/${companyLogo}`, `/var/www/${domain_url}/images/${companyLogo}`, function (err) {
                        if (err) return console.error(err)
                        req.files.favicon.mv(`${__dirname}/images/${companyFavicon}`, err => {
                            if (err) {
                                console.error(err);
                                return res.status(500).send(err);
                            }
                            fs.move(`${__dirname}/images/${companyFavicon}`, `/var/www/${domain_url}/images/${companyFavicon}`, function (err) {
                                if (err) return console.error(err)

                                connection1.query('UPDATE `company_name` SET `name`="' + companyName + '",`s_name`="' + companySN + '",`image`="' + companyLogo + '",`favicon`="' + companyFavicon + '"  WHERE `id`=' + id, (err, result) => {
                                    console.log('okk', result);
                                    res.send({ data: result });
                                });


                            });

                        });
                    })

                });
            } else {
                const companyLogo = req.body.image
                const companyFavicon = req.body.favicon
                connection1.query('UPDATE `company_name` SET `name`="' + companyName + '",`s_name`="' + companySN + '",`image`="' + companyLogo + '",`favicon`="' + companyFavicon + '"  WHERE `id`=' + id, (err, result) => {
                    console.log('okk', result);
                    res.send({ data: result });
                });

            }

            //   companyLogo.mv(`${__dirname}/images/${companyLogo.name}`, err => {
            //        if (err) {
            //             console.error(err);
            //             return res.status(500).send(err);
            //           }
            //           fs.move(`${__dirname}/images/${companyLogo.name}`, `/var/www/${domain_url}/public/images/${companyLogo.name}`, function (err) {
            //                if (err) return console.error(err)
            //                companyFavicon.mv(`${__dirname}/images/${companyFavicon.name}`, err => {
            //                     if (err) {
            //                          console.error(err);
            //                          return res.status(500).send(err);
            //                        }
            //                        fs.move(`${__dirname}/images/${companyFavicon.name}`, `/var/www/${domain_url}/public/images/${companyFavicon.name}`, function (err) {
            //                          if (err) return console.error(err)

            //                          connection1.query('UPDATE `company_name` SET `name`="'+companyName+'",`s_name`="'+companySN+'",`image`="'+companyLogo.name+'",`favicon`="'+companyFavicon.name+'"  WHERE `id`='+id, (err, result) => {
            //                                console.log('okk',result);
            //                               res.send({ data: result });
            //                          });

            //                     //     res.json({ fileNameLogo: companyLogo.name, filePathLogo: `/images/${companyLogo.name}`,fileNameFavicon: companyFavicon.name, filePathFavicon: `/images/${companyFavicon.name}` 
            //                     //  });
            //              });

            //                // console.log("success!")
            //           });
            //               })

            // });
        })
    })







    app.post('/admin/login/bg_img', (req, res) => {


        if (req.files !== null) {


            var id = 1
            var Background_Image = req.files.image_login.name
            const Background_Image1 = Background_Image.split(".")[0] + (+new Date()) + "." + Background_Image.split(".")[1]
            console.log("Background_Image", Background_Image1);

            connection1.query('SELECT * FROM `client_key_prefix_letters` WHERE id = "' + id + '"', (err, res_domain) => {

                var domain_url = res_domain[0].domain_url
                // var domain_url ='smartalgo_backend'

                console.log("domain_url", domain_url);


                req.files.image_login.mv(`${__dirname}/images/${Background_Image1}`, err => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send(err);
                    }
                    fs.move(`${__dirname}/images/${Background_Image1}`, `/var/www/${domain_url}/images/${Background_Image1}`, function (err) {
                        if (err) return console.error(err)

                        connection1.query('UPDATE `company_name` SET `bg_img`="' + Background_Image1 + '" WHERE `id`=' + id, (err, result) => {
                            console.log('okk', result);
                            res.send({ data: result });
                        });

                    });

                });

            })

        }

    })



    app.post("/admin/theme_status", verifyToken, (req, res) => {
        var theme_id = req.body.theme_id
        console.log('theme_status');
        connection1.query('UPDATE `company_name` SET `theme_status`=' + parseInt(theme_id), (err, result) => {
            res.send({ status: true, data: "success" })
            // console.log("result",result);
        });
    });

}