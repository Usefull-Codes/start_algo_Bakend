module.exports = function (app, connection1,io) {
    var verifyToken = require('./middleware/awtJwt');



    var axios = require('axios');
    var fs = require("fs");

    var dateTime = require('node-datetime');
    var dt = dateTime.create();
    var ccdate = dt.format('Y-m-d');

    //var $ = require("jquery");
    const WebSocket = require('ws');
    var CryptoJS = require("crypto-js");
    const path = require('path');

   //------------Targetstoploss_check_status----------//
   app.get('/TargetstoplosStutus',function(req,res){
    targetstoploss_check_status(io,"SBIN");

    connection1.query('SELECT `status` FROM `targetstoploss_check_status`', (err, result) => {
      res.send({status:result[0].status})
    }); 
   })

   app.get('/TargetstoplosStutusUpdate',function(req,res){
    connection1.query('UPDATE `targetstoploss_check_status` SET `status` = "' + 0 + '"  WHERE `id` = "1"', (err, result) => {
        res.send({status:true})
    }); 
   })

   ////////////////////////////
  



    //---------------------Start Cron Stop loss target -------------------------//



    app.get("/exitstoplosstarget", function (req, res) {

        connection1.query('SELECT `panel_key` FROM `client_key_prefix_letters` LIMIT 1', (err, panel_key) => {


            var panelKey = panel_key[0].panel_key

            connection1.query('SELECT * FROM `exucated_all_trade` WHERE `squareoff`= "0" AND `previous_trade_id` IS NULL', (err, exitstoplosstarget_result) => {

                exitstoplosstarget_result.forEach(element => {

                    if (element.type == "SE") {

                        fs.readFile("AllTokenJsonFile/" + element.token + ".json", "utf8", (err, jsonString) => {

                            const token_live_price = JSON.parse(jsonString);
                            // console.log("token_live_price - ", token_live_price.lp);
                            // console.log("stoploss_price - ", element.stoploss_price);
                            // console.log("target_price - ", element.target_price);
                            var live_price = token_live_price.lp
                            // if(token_live_price.lp != undefined){


                            if (parseFloat(live_price) > parseFloat(element.stoploss_price)) {

                                if (element.srtoploss_status == 1) {

                                    var type = "";
                                    if (element.type == "LE") {
                                        type = "LX";
                                    }
                                    else if (element.type == "SE") {
                                        type = "SX";
                                    }


                                    var request = "id:12@@@@@input_symbol:" + element.input_symbol + "@@@@@type:" + type + "@@@@@price:" + element.stoploss_price + "@@@@@dt:1668504000@@@@@qty_percent:100@@@@@order_type:Market@@@@@client_key:" + panelKey + "@@@@@exchange:NFO@@@@@product_type:MIS@@@@@strike:" + element.strike_price + "@@@@@segment:O@@@@@option_type:" + element.option_type + "@@@@@expiry:" + element.expiry + "@@@@@strategy:" + element.strategy_tag + "@@@@@sq_value:00.00@@@@@sl_value:00.00@@@@@tr_price:00.00@@@@@tsl:00.00@@@@@token:" + element.token + "@@@@@entry_trade_id:" + element.id + "@@@@@tradesymbol:" + element.tradesymbol + "@@@@@demo:demo";

                                    ExitStopLossAndTargetSendRequest(request);

                                }

                            }

                            else if (parseFloat(element.target_price) > parseFloat(live_price)) {

                                if (element.target_status == 1) {
                                    var type = "";
                                    if (element.type == "LE") {
                                        type = "LX";
                                    }
                                    else if (element.type == "SE") {
                                        type = "SX";
                                    }


                                    var request = "id:12@@@@@input_symbol:" + element.input_symbol + "@@@@@type:" + type + "@@@@@price:" + element.target_price + "@@@@@dt:1668504000@@@@@qty_percent:100@@@@@order_type:Market@@@@@client_key:" + panelKey + "@@@@@exchange:NFO@@@@@product_type:MIS@@@@@strike:" + element.strike_price + "@@@@@segment:O@@@@@option_type:" + element.option_type + "@@@@@expiry:" + element.expiry + "@@@@@strategy:" + element.strategy_tag + "@@@@@sq_value:00.00@@@@@sl_value:00.00@@@@@tr_price:00.00@@@@@tsl:00.00@@@@@token:" + element.token + "@@@@@entry_trade_id:" + element.id + "@@@@@tradesymbol:" + element.tradesymbol + "@@@@@demo:demo";

                                    ExitStopLossAndTargetSendRequest(request);
                                }

                            }





                            //}


                        });

                    } else if (element.type == "LE") {

                        fs.readFile("AllTokenJsonFile/" + element.token + ".json", "utf8", (err, jsonString) => {

                            const token_live_price = JSON.parse(jsonString);
                            // console.log("token_live_price - ", token_live_price.lp);
                            // console.log("stoploss_price - ", element.stoploss_price);
                            // console.log("target_price - ", element.target_price);
                            var live_price = token_live_price.lp
                            // if(token_live_price.lp != undefined){
                            var live_price = 1176;

                            if (parseFloat(element.stoploss_price) > parseFloat(live_price)) {


                                if (element.srtoploss_status == 1) {

                                    // console.log("srtoploss_status - ", live_price);


                                    var type = "";
                                    if (element.type == "LE") {
                                        type = "LX";
                                    }
                                    else if (element.type == "SE") {
                                        type = "SX";
                                    }


                                    var request = "id:12@@@@@input_symbol:" + element.input_symbol + "@@@@@type:" + type + "@@@@@price:" + element.stoploss_price + "@@@@@dt:1668504000@@@@@qty_percent:100@@@@@order_type:Market@@@@@client_key:" + panelKey + "@@@@@exchange:NFO@@@@@product_type:MIS@@@@@strike:" + element.strike_price + "@@@@@segment:O@@@@@option_type:" + element.option_type + "@@@@@expiry:" + element.expiry + "@@@@@strategy:" + element.strategy_tag + "@@@@@sq_value:00.00@@@@@sl_value:00.00@@@@@tr_price:00.00@@@@@tsl:00.00@@@@@token:" + element.token + "@@@@@entry_trade_id:" + element.id + "@@@@@tradesymbol:" + element.tradesymbol + "@@@@@demo:demo";

                                    ExitStopLossAndTargetSendRequest(request);
                                }

                            } else if (parseFloat(live_price) > parseFloat(element.target_price)) {

                                if (element.target_status == 1) {

                                    // console.log("target_status - ", live_price);

                                    var type = "";
                                    if (element.type == "LE") {
                                        type = "LX";
                                    }
                                    else if (element.type == "SE") {
                                        type = "SX";
                                    }


                                    var request = "id:12@@@@@input_symbol:" + element.input_symbol + "@@@@@type:" + type + "@@@@@price:" + element.target_price + "@@@@@dt:1668504000@@@@@qty_percent:100@@@@@order_type:Market@@@@@client_key:" + panelKey + "@@@@@exchange:NFO@@@@@product_type:MIS@@@@@strike:" + element.strike_price + "@@@@@segment:O@@@@@option_type:" + element.option_type + "@@@@@expiry:" + element.expiry + "@@@@@strategy:" + element.strategy_tag + "@@@@@sq_value:00.00@@@@@sl_value:00.00@@@@@tr_price:00.00@@@@@tsl:00.00@@@@@token:" + element.token + "@@@@@entry_trade_id:" + element.id + "@@@@@tradesymbol:" + element.tradesymbol + "@@@@@demo:demo";

                                    ExitStopLossAndTargetSendRequest(request);

                                }

                            }



                            //}


                        });

                    }

                });



                res.send({ data: exitstoplosstarget_result });

            })
        })


    });


    function ExitStopLossAndTargetSendRequest(request) {

        var config = {
            method: 'post',
            url: 'https://api.smartalgo.in:3002/broker-signals',
            headers: {
                'Content-Type': 'text/plain'
            },
            data: request
        };

        axios(config)
            .then(function (response) {

            })
            .catch(function (error) {
                console.log(error);
            });


    }


    //---------------------End Cron Stop loss target -------------------------//

    app.get("/api/alicebluetoken", (req, res) => {


        connection1.query('SELECT * FROM `alicebluetoken` WHERE `update_at` >= "' + ccdate + '" LIMIT 1', (err, alice_blue_token) => {

            if (alice_blue_token.length > 0) {
                res.send({ 'status': 'true', 'data': alice_blue_token })
            } else {
                res.send({ 'status': 'false', 'data': [] })
            }

        })
    });



    app.get("/api/alicebluetoken/getBrokerKey", (req, res) => {


        connection1.query('SELECT * FROM `alicebluetoken` LIMIT 1', (err, alice_blue_token) => {

            if (alice_blue_token.length > 0) {
                res.send({ 'status': 'true', 'data': alice_blue_token })
            } else {
                res.send({ 'status': 'false', 'data': [] })
            }

        })
    });



    app.get("/api/alicebluetoken/tradingOff", (req, res) => {

        connection1.query('UPDATE `alicebluetoken` SET `access_token` = "" , `trading` = "' + 0 + '"  WHERE `id` = "1"', (err, getToken) => {

            res.send({ status: true, msg: "Trading Off Successfully" })

        });

    });



    app.get("/api/getTokenTradingApi", (req, res) => {


        connection1.query('SELECT * FROM `alicebluetoken`  LIMIT 1', (err, alice_blue_token) => {

            if (alice_blue_token.length > 0) {
                res.send({ 'status': 'true', 'data': alice_blue_token })
            } else {
                res.send({ 'status': 'false', 'data': [] })
            }

        })
    });



    // Panding token
    app.post("/smartalgo/instrument_token", verifyToken, (req, res) => {

        const strike_prize = req.body.strike_prize
        const expied_symbol = req.body.expied_symbol

        // return

        const strike_prizeArr = []
        var channelstr = ""

        if (strike_prize.length == 80) {

            strike_prize.forEach((val) => {


                connection1.query('SELECT id,symbol,expiry_str,strike,option_type,segment,instrument_token  FROM `token_symbol` WHERE `symbol` = "' + val.symbol + '" AND `strike` = ' + val.strike_price + '  AND `expiry_str`="' + expied_symbol + '" ORDER BY `instrument_token` ASC'
                    , (err, result) => {
                        if (result) {


                            strike_prizeArr.push(result)

                            if (strike_prizeArr.length == 80) {

                                strike_prizeArr.flat().map((a) => {
                                    channelstr += "NFO|" + a.instrument_token + "#"
                                })

                                var alltokenchannellist = channelstr.substring(0, channelstr.length - 1);

                                // res.send({ channel: alltokenchannellist, data: strike_prizeArr })
                                res.send({ channel: alltokenchannellist })

                            }
                        }
                    });
            })
        }
    });


    /// only Smart Algo 
    app.get("/smartalgo/channel/alldata", (req, res) => {

        connection1.query('SELECT first_channel,second_channel FROM `channel_list`', (err, channel_list) => {

            connection1.query('SELECT  `banknifty_price`, `nifty_price` FROM `strike_price`', (err, strike_price1) => {

                connection1.query('SELECT * FROM `all_round_token` ORDER BY `strike_price` ASC', (err, all_round_token) => {

                    connection1.query('SELECT * FROM `last_expiry` ORDER BY `expiry_date` ASC LIMIT 4', (err, all_expiry) => {

                        res.send({ channel_list: channel_list, strike_price: strike_price1, all_round_token: all_round_token, all_expiry: all_expiry })
                    })
                })
            })
        })
    })


    /// only Smart Algo 
    app.post("/all_round_token/filter", function (req, res) {

        var symbol = req.body.symbol;
        var expiry = req.body.expiry;

        var where = '';

        if (symbol != '' && expiry != '') {
            where += '`symbol` = "' + symbol + '" AND `expiry` = "' + expiry + '"';
        }


        connection1.query('SELECT * FROM `all_round_token` WHERE ' + where + ' ORDER BY `strike_price` ASC', (err, all_round_token) => {
            connection1.query('SELECT `token` FROM `exucated_possition` WHERE `executed_qty_possition` != `exit_qty_possition`', (err, open_position_token) => {

                var tokenstring = "";

                all_round_token.forEach((element) => {

                    tokenstring += 'NFO|' + element.call_token + '#NFO|' + element.put_token + '#'

                });

                var alltokenlist = tokenstring.substring(0, tokenstring.length - 1);

                returnstring = alltokenlist


                // ------------------------------

                var openpositiontokenstring = "";

                open_position_token.forEach((element1) => {

                    openpositiontokenstring += 'NFO|' + element1.token + '#'

                });

                var returnopenpositiontokenstring = openpositiontokenstring.substring(0, openpositiontokenstring.length - 1);

                returnopenpositiontokenstring = returnopenpositiontokenstring;

                //-----------------------------

                // console.log("query", 'SELECT * FROM `all_round_token` WHERE ' + where + '')
                res.send({ length: all_round_token.length, all_round_token: all_round_token, channellist: returnstring, openpositionchannel: returnopenpositiontokenstring })
            })
        })


    })



    app.get("/smartalgo/panelkey", (req, res) => {

        connection1.query('SELECT `panel_key` FROM `client_key_prefix_letters`', (err, result) => {

            res.send({ PanelKey: result })
        })
    })



    app.get("/openposition", function (req, res) {



        connection1.query('SELECT * FROM `exucated_all_trade` WHERE `squareoff` = 0 AND (`type` = "LE" || `type` = "SE")', (err, openposition) => {

            if (openposition.length > 0) {

                res.send({ status: true, data: openposition })


            } else {
                res.send({ status: false, data: [] });
            }

        });




    });


    app.get("/closeposition", function (req, res) {


         

        connection1.query('SELECT * FROM `exucated_all_trade` WHERE (`squareoff` = 1 || `previous_trade_id` IS NOT NULL)', (err, closeposition) => {



            if (closeposition.length > 0) {

                var final_array = [];

                var entry_array = [];

                var exit_array = [];

                closeposition.forEach(element => {



                    if (element.previous_trade_id == null) {
                        console.log('element.id not null -', element.id)
                        entry_array.push(element);
                    }

                    if (element.previous_trade_id != null) {
                        console.log('element.id is null -', element.id)
                        exit_array.push(element);
                    }


                });


                var exist_entry_exit_id = [];

                entry_array.forEach(entry => {
                    exit_array.forEach(exit => {

                        if (!exist_entry_exit_id.includes(entry.id)) {
                            if (!exist_entry_exit_id.includes(exit.id)) {

                                if (entry.id == exit.previous_trade_id) {

                                    final_array.push(entry);
                                    final_array.push(exit);

                                }

                            }
                        }

                    });

                });





                // console.log("rr- ", final_array)
                if (final_array.length == closeposition.length) {
                    res.send({ status: true, data: final_array })
                } else {
                    console.log("elseeeee")
                }



            } else {
                res.send({ status: false, data: [] });
            }

        });




    });





    // app.get("/expiry_store", function (req, res) {

    //     connection1.query('TRUNCATE TABLE last_expiry;', (err, result) => { })
    //     var config = {
    //         method: 'get',
    //         url: 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json',
    //     };
    //     axios(config)
    //         .then(function (response) {
    //             var channelstr = ""

    //             var exist_expiry = [];

    //             response.data.forEach(function (element) {
    //                 if ((element.instrumenttype == 'OPTIDX' && element.exch_seg == "NFO")) {
    //                     if (element.name == 'BANKNIFTY') {


    //                         if (!exist_expiry.includes(element.expiry)) {

    //                             exist_expiry.push(element.expiry)

    //                             console.log("ss -- ", element.expiry)

    //                             var expiry_s = dateTime.create(element.expiry);
    //                             var expiry = expiry_s.format('dmY');
    //                             var expiry_date = expiry_s.format('Y-m-d');

    //                             var dt = dateTime.create();
    //                             var ccdate = dt.format('Y-m-d H:M:S');


    //                             connection1.query('INSERT INTO `last_expiry`( `expiry`, `expiry_date`,`expiry_str`,`created_at`) VALUES ("' + expiry + '","' + expiry_date + '","' + element.expiry + '","' + ccdate + '")', (err, result) => {
    //                                 console.log("err", err);
    //                                 console.log("INSERT last_expiry");
    //                             })
    //                         }
    //                     }
    //                 }
    //             });

    //         })
    //         .catch(function (error_broker) {
    //             console.log('error_broker -', error_broker);
    //         });
    // })




    // app.post("/smartalgo/get_expiry_token", verifyToken, (req, res) => {

    //     const symbol = req.body.symbol
    //     const expied_symbol = req.body.expied_symbol


    //     connection1.query('SELECT * FROM `all_round_token` WHERE `symbol`="BANKNIFTY"', (err, getToken) => {

    //     })

    //     return

    //     const strike_prizeArr = []
    //     var channelstr = ""

    //     if (strike_prize.length == 80) {

    //         strike_prize.forEach((val) => {


    //             connection1.query('SELECT id,symbol,expiry_str,strike,option_type,segment,instrument_token  FROM `token_symbol` WHERE `symbol` = "' + val.symbol + '" AND `strike` = ' + val.strike_price + '  AND `expiry_str`="' + expied_symbol + '" ORDER BY `instrument_token` ASC'
    //                 , (err, result) => {
    //                     if (result) {


    //                         strike_prizeArr.push(result)

    //                         if (strike_prizeArr.length == 80) {

    //                             strike_prizeArr.flat().map((a) => {
    //                                 channelstr += "NFO|" + a.instrument_token + "#"
    //                             })

    //                             var alltokenchannellist = channelstr.substring(0, channelstr.length - 1);

    //                             // res.send({ channel: alltokenchannellist, data: strike_prizeArr })
    //                             res.send({ channel: alltokenchannellist })

    //                         }
    //                     }
    //                 });
    //         })
    //     }
    // });





    app.post("/updateAdminBrokerKey", verifyToken, (req, res) => {

        var app_id = req.body.app_id
        var api_secret = req.body.api_secret


        connection1.query('UPDATE `alicebluetoken` SET `app_id` = "' + app_id + '" , `api_secret` = "' + api_secret + '"  WHERE `id` = "1"', (err, getToken) => {

            res.send({ status: true, msg: "Data Update Successfully" })

        });
    });







    app.post("/UpdateStopLossAndTargetPrice", (req, res) => {
       

        // console.log("condition - ", req.body.condition)
        // console.log("priceArray - ", req.body.priceArray)

        var condition = req.body.condition;

        if (condition == "stoploss") {
            var priceArray = req.body.priceArray;
            priceArray.forEach(element => {

                // console.log("id",element.id);
                //  console.log("id",element.StopLossPrice);


                //  console.log("arraay - target",element);
                const jsonString = fs.readFileSync('./TargetAndStoppLossJson/target.json');
                //  console.log("jsonString -",jsonString)

                const bufferData = Buffer.from(jsonString);
                const jsonData = bufferData.toJSON();

                //console.log("jsonData -",jsonData.data)
                if (jsonData.data.length > 0) {
                    // console.log('if ll');

                    const data = JSON.parse(jsonString);
                    // Set a value conditionally

                    // find the object that you want to update
                    const objToUpdate = data.find(obj => obj.id === element.id);

                    //  console.log('objToUpdate - check id ',objToUpdate);


                    if (objToUpdate == undefined) {
                        // console.log("new data add");

                        const newItem = { element };
                        // const newItem = { id: element.id, TargetPrice: parseFloat(element.TargetPrice)};
                        data.push(element);

                        const jsonString = JSON.stringify(data);

                        fs.writeFileSync('./TargetAndStoppLossJson/target.json', jsonString);

                    } else {

                        // console.log("exist  data update");


                        // update the properties of the object
                        objToUpdate.StopLossPrice = parseFloat(element.StopLossPrice);

                        // convert the updated JavaScript object back to JSON
                        const jsonData = JSON.stringify(data);

                        //write the updated JSON to the file
                        // fs.writeFile('./TargetAndStoppLossJson/target.json', jsonData, (err) => {
                        //   if (err) throw err;
                        //   console.log('Data updated successfully!');

                        // });

                        fs.writeFileSync('./TargetAndStoppLossJson/target.json', jsonData);



                    }




                } else {

                    //  console.log("else ll");

                    // Convert the modified data structure back to a JSON string
                    const updatedJsonString = JSON.stringify(priceArray);

                    // Write the updated JSON string back to the JSON file
                    fs.writeFileSync('./TargetAndStoppLossJson/target.json', updatedJsonString);
                }




                connection1.query('UPDATE `exucated_all_trade` SET  `stoploss_price` = "' + parseFloat(element.StopLossPrice) + '" , `srtoploss_status`="' + 1 + '"  WHERE `id` = "' + element.id + '"', (err, priceArray_result) => {

                });
            });


        } else if (condition == "target") {
            var priceArray = req.body.priceArray;


            priceArray.forEach(element => {

                //  console.log("arraay - target",element);
                const jsonString = fs.readFileSync('./TargetAndStoppLossJson/target.json');
                //  console.log("jsonString -",jsonString)

                const bufferData = Buffer.from(jsonString);
                const jsonData = bufferData.toJSON();

                //console.log("jsonData -",jsonData.data)
                if (jsonData.data.length > 0) {
                    console.log('if ll');

                    const data = JSON.parse(jsonString);
                    // Set a value conditionally

                    // find the object that you want to update
                    const objToUpdate = data.find(obj => obj.id === element.id);

                    //    console.log('objToUpdate - check id ',objToUpdate);


                    if (objToUpdate == undefined) {
                        console.log("new data add");

                        const newItem = { element };
                        // const newItem = { id: element.id, TargetPrice: parseFloat(element.TargetPrice)};
                        data.push(element);

                        const jsonString = JSON.stringify(data);

                        fs.writeFileSync('./TargetAndStoppLossJson/target.json', jsonString);

                    } else {

                        // console.log("exist  data update");


                        // update the properties of the object
                        objToUpdate.TargetPrice = parseFloat(element.TargetPrice);

                        // convert the updated JavaScript object back to JSON
                        const jsonData = JSON.stringify(data);

                        //write the updated JSON to the file
                        // fs.writeFile('./TargetAndStoppLossJson/target.json', jsonData, (err) => {
                        //   if (err) throw err;
                        //   console.log('Data updated successfully!');

                        // });

                        fs.writeFileSync('./TargetAndStoppLossJson/target.json', jsonData);



                    }




                } else {

                    //  console.log("else ll");

                    // Convert the modified data structure back to a JSON string
                    const updatedJsonString = JSON.stringify(priceArray);

                    // Write the updated JSON string back to the JSON file
                    fs.writeFileSync('./TargetAndStoppLossJson/target.json', updatedJsonString);
                }


                //   console.log("id",element.id);
                //  console.log("id",element.TargetPrice);

                connection1.query('UPDATE `exucated_all_trade` SET `target_price` = "' + parseFloat(element.TargetPrice) + '" , `target_status`="' + 1 + '" WHERE `id` = "' + element.id + '"', (err, priceArray_result) => {

                });
            });


        }


        res.send({ status: true })

    })



    app.get("/socket-api", (req, res) => {

        //  console.log("dawdadd",req);
        // console.log("userid",req.query.userid);
        // console.log("usersession",req.query.usersession);

        connection1.query('SELECT * FROM `exucated_all_trade` WHERE `squareoff`= "0" AND `previous_trade_id` IS NULL', (err, exitstoplosstarget_result) => {

            var tokenstring = "";
            exitstoplosstarget_result.forEach(element => {
                // console.log("token", element.token)

                tokenstring += 'NFO|' + element.token + '#'
            });

            var alltokenlist = tokenstring.substring(0, tokenstring.length - 1);
            //  res.send(alltokenlist)      
            connect(req.query.userid, req.query.usersession, alltokenlist);
            res.send("okk")
        })

    });



    var BASEURL = "https://a3.aliceblueonline.com/rest/AliceBlueAPIService/";
    let AuthorizationToken;
    let type = "API";


    function TokenAndClientCode(alltokenlist) {

        console.log("ssss")

        var client_code = "438760";
        var access_token = "R7hh8jt3jQFQZ5cf13qiR55K7F1JRu1gVJ6AMu50YEsUH6Q1s5AQQElcYh9miF2qphj214D5ScpAzEEIvNzTkepDTPbZXoq5dSEqLjvLvQeMQ1bXC2mYlo3VxOOmjFnTGZ2iNZXOQzea3DR7TxBhuNXGJIJenS3T4Xpu94bOI4d8yieeCrfss26JZ6xyer7C5OGUOU7vtbqf9XH4WlStLZtMh80PWtmbNaSAyqZOYmYI8mcxQlZIG3Sn6hpYvKGW";
        invalidateSession(client_code, access_token, alltokenlist);
    }



    // ==========================================================================
    function invalidateSession(userId, userSession, alltokenlist) {
        console.log("Run invalidateSession....");

        var data = JSON.stringify({
            "loginType": "API"
        });

        var config = {
            method: 'post',
            url: 'https://a3.aliceblueonline.com/rest/AliceBlueAPIService/api/ws/invalidateSocketSess',
            headers: {
                'Authorization': 'Bearer ' + userId + ' ' + userSession,
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                // console.log(JSON.stringify(response.data));
                if (response.data.stat == "Ok") {
                    createSession(userId, userSession, alltokenlist);
                } else {
                    console.log("NOt Okk InvalidateSession")
                }

            })
            .catch(function (error) {
                console.log(error);
            });


    }


    // ======================================================
    function createSession(userId, userSession, alltokenlist) {
        console.log("Run createSession....");

        var data = JSON.stringify({
            "loginType": "API"
        });

        var config = {
            method: 'post',
            url: 'https://a3.aliceblueonline.com/rest/AliceBlueAPIService/api/ws/createWsSession',
            headers: {
                'Authorization': 'Bearer ' + userId + ' ' + userSession,
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                // console.log(JSON.stringify(response.data));
                if (response.data.stat == "Ok") {
                    connect(userId, userSession, alltokenlist);
                } else {
                    console.log("NOt Okk InvalidateSession")
                }

            })
            .catch(function (error) {
                console.log(error);
            });

    }

    const url = "wss://ws1.aliceblueonline.com/NorenWS/";
    let socket;

    function connect(userId, userSession, token = "") {

        socket = new WebSocket(url);
        socket.onopen = function () {
            connectionRequest(userId, userSession);
            //  alert('okk socket open')
            // console.log("okk socket open")


        };
        socket.onmessage = function (msg) {
            var response = JSON.parse(msg.data);
            // console.log("okk socket open  1 ",response)


            if (response.tk) {
                // console.log("File has been Createed");
                if (response.lp != undefined) {
                    fs.writeFile("./AllTokenJsonFile/" + response.tk + ".json", JSON.stringify(response, null, 4), (err) => {
                        if (err) { console.error(err); return; };
                        //console.log("File has been Createed File Token");
                    });

                }
            }
            if (response.s == "OK") {


                //    console.log("response socket okkkkkkkk")

                var channel = token;
                let json = {
                    k: channel,
                    t: 't'
                };
                socket.send(JSON.stringify(json))

            }

        };
    }

    function connectionRequest(userId, userSession) {
        var encrcptToken = CryptoJS.SHA256(
            CryptoJS.SHA256(userSession).toString()
        ).toString();
        // alert(encrcptToken);
        var initCon = {
            susertoken: encrcptToken,
            t: "c",
            actid: userId + "_" + type,
            uid: userId + "_" + type,
            source: type,
        };
        // console.log('initCon', JSON.stringify(initCon));
        socket.send(JSON.stringify(initCon));
    }







    ///-------------------------------------Taget And Stop Loss-------------------------------////


    setInterval(() => {

    
        // console.log('HELLO SHAKIR');
        var fs = require("fs");
        const path = require('path');


        const jsonString = fs.readFileSync('./TargetAndStoppLossJson/target.json');

        const bufferData = Buffer.from(jsonString);
        const jsonData = bufferData.toJSON();

        if (jsonData.data.length > 0) {

            // Parse the contents of the JSON file into a JavaScript object
            const data = JSON.parse(jsonString);

            // console.log("data  target  price- ", data);

            if (data.length > 0) {

                data.forEach(element => {

                    //     console.log("element id",element.id ,"token -",element.token);

                    //     const jsonTokenLiveData = fs.readFileSync('./AllTokenJsonFile/'+element.token+'.json');

                    //     console.log("jsonTokenLiveData ",jsonTokenLiveData );
                    //   //  const TokenLiveData = JSON.parse(jsonTokenLiveData);

                    //     const bufferData = Buffer.from(jsonTokenLiveData);
                    //     const jsonData = bufferData.toJSON();

                    //     console.log("TokenLiveData jsonData",jsonData);
                    //   //  console.log("TokenLiveData",TokenLiveData);


                    var directoryfilePath = path.join(__dirname + './../AllTokenJsonFile');


                    fs.readdir(directoryfilePath, (err, files) => {
                        if (err) {
                            console.log(err);
                        } else {
                          //  console.log('token', element.token);
                            //const jsonFiles = files.filter(file => path.extname(file) === element.token+'.json');
                            const jsonFiles = files.filter(item => item === element.token + '.json');

                            if (jsonFiles.length > 0) {
                            //    console.log('token', element.token);
                             //   console.log('JSON files exist in the folder');

                                const jsonTokenLiveData = fs.readFileSync('./AllTokenJsonFile/' + element.token + '.json');
                                const TokenLiveData = JSON.parse(jsonTokenLiveData);

                             //   console.log("TokenLiveData", TokenLiveData)

                                if (TokenLiveData.lp != undefined) {

                                 //   console.log("TargetPrice ", element.TargetPrice)
                                  // console.log("StopLossPrice ", element.StopLossPrice)
                                //    console.log("TokenLiveData.lp ", TokenLiveData.lp)

                                    if (element.type == "LE") {

                                        if (element.TargetPrice != "NOTSET") {
                                            // console.log("TargetPrice inside le  ", element.TargetPrice)

                                            if (parseFloat(TokenLiveData.lp) > parseFloat(element.TargetPrice)) {
                                                tradeExucated(element, TokenLiveData.lp,connection1)

                                                targetstoploss_check_status(io,element)
                                                const dataTargetJsondata = JSON.parse(jsonString);

                                           //     console.log("dataTargetJsondata  ", dataTargetJsondata)


                                                let remainderdata = dataTargetJsondata.filter(item => item.id !== element.id);

                                            //    console.log("remainderdata  ", remainderdata)

                                                const jsonStringnew = JSON.stringify(remainderdata);

                                                fs.writeFileSync('./TargetAndStoppLossJson/target.json', jsonStringnew);

                                                // let usersWithoutTim = jsonString.filter(item => user.name !== "Tim");
                                            }


                                        }
                                        if (element.StopLossPrice != "NOTSET") {
                                            // console.log("StopLossPrice inside le  ", element.StopLossPrice)

                                            if (parseFloat(TokenLiveData.lp) < parseFloat(element.StopLossPrice)) {
                                                tradeExucated(element, TokenLiveData.lp,connection1)
                                                targetstoploss_check_status(io,element)

                                                const dataTargetJsondata = JSON.parse(jsonString);

                                           //     console.log("dataTargetJsondata  ", dataTargetJsondata)

                                                let remainderdata = dataTargetJsondata.filter(item => item.id !== element.id);

                                            //    console.log("remainderdata  ", remainderdata)

                                                const jsonStringnew = JSON.stringify(remainderdata);

                                                fs.writeFileSync('./TargetAndStoppLossJson/target.json', jsonStringnew);

                                            }


                                        }


                                    } else if (element.type == "SE") {


                                        if (element.TargetPrice != "NOTSET") {
                                            // console.log("TargetPrice inside se  ", element.TargetPrice)

                                            if (parseFloat(TokenLiveData.lp) < parseFloat(element.TargetPrice)) {
                                                tradeExucated(element, TokenLiveData.lp,connection1)
                                                targetstoploss_check_status(io,element)


                                                const dataTargetJsondata = JSON.parse(jsonString);

                                            //    console.log("dataTargetJsondata  ", dataTargetJsondata)

                                                let remainderdata = dataTargetJsondata.filter(item => item.id !== element.id);

                                             //   console.log("remainderdata  ", remainderdata)

                                                const jsonStringnew = JSON.stringify(remainderdata);

                                                fs.writeFileSync('./TargetAndStoppLossJson/target.json', jsonStringnew);




                                            }


                                        }
                                        if (element.StopLossPrice != "NOTSET") {

                                            // console.log("StopLossPrice inside se  ", element.StopLossPrice)
                                            if (parseFloat(TokenLiveData.lp) > parseFloat(element.StopLossPrice)) {
                                                tradeExucated(element, TokenLiveData.lp,connection1)
                                                targetstoploss_check_status(io,element)

                                                const dataTargetJsondata = JSON.parse(jsonString);

                                             //   console.log("dataTargetJsondata  ", dataTargetJsondata)

                                                let remainderdata = dataTargetJsondata.filter(item => item.id !== element.id);

                                             //   console.log("remainderdata  ", remainderdata)

                                                const jsonStringnew = JSON.stringify(remainderdata);

                                                fs.writeFileSync('./TargetAndStoppLossJson/target.json', jsonStringnew);
                                            }


                                        }

                                    }



                                }




                            } else {
                                // console.log('token', element.token);
                                console.log('No JSON files exist in the folder');
                            }
                        }
                    });



                });

            }

        }


    }, 2000);





}








const tradeExucated = (row, price,connection1) => {
    
    var axios = require('axios');

    connection1.query('SELECT `panel_key` FROM `client_key_prefix_letters` LIMIT 1', (err, panel_key) => {
        var panelKey = panel_key[0].panel_key
     //  console.log(" panelKey  ", panelKey)
     //   console.log(" tradeExucated  ", row)

    var type = "";
    if (row.type == "LE") {
        type = "LX";
    }
    else if (row.type == "SE") {
        type = "SX";
    }


    var request = "id:12@@@@@input_symbol:" + row.input_symbol + "@@@@@type:" + type + "@@@@@price:" + price + "@@@@@dt:1668504000@@@@@qty_percent:100@@@@@order_type:Market@@@@@client_key:" + panelKey + "@@@@@exchange:NFO@@@@@product_type:MIS@@@@@strike:" + row.strike_price + "@@@@@segment:O@@@@@option_type:" + row.option_type + "@@@@@expiry:" + row.expiry + "@@@@@strategy:" + row.strategy_tag + "@@@@@sq_value:00.00@@@@@sl_value:00.00@@@@@tr_price:00.00@@@@@tsl:00.00@@@@@token:" + row.token + "@@@@@entry_trade_id:" + row.id + "@@@@@tradesymbol:" + row.tradesymbol + "@@@@@chain:option_chain@@@@@demo:demo";


//    console.log("exit trade ", request);

    

    var config = {
      method: 'post',
      url: 'https://api.smartalgo.in:3002/broker-signals',
      headers: {
        'Content-Type': 'text/plain'
      },
      data: request
    };

    axios(config)
      .then(function (response) {
        //  console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });


})



}


const targetstoploss_check_status = (io,row) => {
    
    io.emit('executed_trade_broadcast', {status:true,symbol:row});
    console.log('shakir 1');
   
    
}



