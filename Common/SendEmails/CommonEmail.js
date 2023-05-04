var nodemailer = require('nodemailer');

module.exports = function(app, connection1) {
    const CommonEmail = (toEmail, subjectEmail, htmlEmail, textEmail, res) => {
        var id = 1;
        connection1.query('SELECT * FROM `email_config` WHERE `id`=' + id, (err, result) => {


            var companyDetails = result[0]
            const transport = nodemailer.createTransport({
                type: "smtp",
                host: companyDetails.smtphost,
                port: companyDetails.smtpport,
                // ignoreTLS: false,
                secure: true,
                // secure: false,
                // requireTLS: true,
                auth: {
                    user: companyDetails.email,
                    pass: companyDetails.smtp_password
                },
                // tls: {
                //     rejectUnauthorized: false
                // }
                secureConnection: true,
            

            });
            var mailOptions = {
                from: companyDetails.email,
                to: toEmail,
                subject: subjectEmail,
                cc: companyDetails.cc_mail,
                bcc: companyDetails.bcc_mail,
                text: textEmail,
                html: htmlEmail
            };

            // const transport = nodemailer.createTransport({
            //     // service: "mail",
            //     host: "mail.smartalgo.in",
            //     port: 465,
            //     // ignoreTLS: false,
            //     // secure: false,
            //     // secure: false,
            //     // requireTLS: true,
            //     auth: {
            //         user: "info@smartalgo.in",
            //         pass: "wJSEknKJS44M8Vq6"
            //     },
            //     // tls: {
            //     //     // do not fail on invalid certs
            //     //     rejectUnauthorized: false,
            //     // },
            //     secureConnection: true
            // });
            // var mailOptions = {
            //     from: "info@smartalgo.in",
            //     to: toEmail,
            //     subject: subjectEmail,
            //     text: textEmail,
            //     html: htmlEmail
            // };
            console.log("CheckEail")
            transport.verify(function(error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Server is ready to take our messages");
                }
            });
            transport.sendMail(mailOptions, function(err, info) {
                if (err) {
                    console.warn(err);
                    return res.send({ status: 'Failed!!!' })
                } else {
                    console.warn("Email has been sent", info.response);
                    return res.send({ status: 'success', msg: "Mail send successfully" })
                }
            });
        })

    }
    module.exports = { CommonEmail }
}