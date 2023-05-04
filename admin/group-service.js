module.exports = function (app, connection1) {
    var verifyToken = require('./middleware/awtJwt');

    var d = new Date,
        dformat = [d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
        ].join('/') + ' ' + [d.getHours(),
        d.getMinutes(),
        d.getSeconds()
        ].join(':');

    app.get("/admin/group-services", verifyToken, (req, res) => {
        connection1.query('SELECT service_group_name.id As id,service_group_name.name AS group_name, COUNT(service_and_group_id.service_group_id) AS group_all FROM service_group_name INNER JOIN service_and_group_id ON service_group_name.id=service_and_group_id.service_group_id GROUP BY service_and_group_id.service_group_id DESC', (err, result) => {
            res.send({ services: result });
            console.log("run");
        });
    });

    app.post("/admin/get-all-services", verifyToken, (req, res) => {

        const clientId = req.body.client_id.status
        console.log("clientId :-", clientId);

        connection1.query('SELECT service_id AS id,services.service AS text ,services.categorie_id AS cat_id FROM `client_service` INNER JOIN `services` ON client_service.service_id=services.id where client_id ="' + clientId + '"', (err, result) => {
            res.send({ services: result });
            console.log("REturn duplicate data -", result);
        });
    });


    app.post("/admin/group-services", verifyToken, (req, res) => {
        var id = req.body.id;
        connection1.query('SELECT * from service_group_name where `id`=' + id, (err, result) => {
            var name = result[0].name;
            connection1.query('SELECT `services`.`id`,`services`.`service` as "text",`categorie`.`id` as "cat_id"  FROM `service_and_group_id`,`services`,`categorie` where `service_and_group_id`.`service_group_id`=' + id + ' AND `service_and_group_id`.`service_id`=`services`.`id`  AND `categorie`.`id`=`services`.`categorie_id` GROUP BY `services`.`id`', (err, result) => {

                res.send({ 'name': name, 'service': result });
            });
        });
    });

    app.post("/admin/group-service-names", verifyToken, (req, res) => {
        var GroupId = req.body.groupId

        connection1.query('Select service_and_group_id.service_id AS service_Id, services.service AS service_Name, categorie.name AS CategorieName, categorie.segment AS catsegment from service_group_name Join service_and_group_id on service_group_name.id=service_and_group_id.service_group_id Join services on service_and_group_id.service_id=services.id Join categorie on services.categorie_id=categorie.id Where service_and_group_id.service_group_id="' + GroupId + '"', (err, result) => {
            // console.log("result", result)
            console.log("err", err)
            res.send({ groupSeviceName: result })
        })
    })

    app.post("/admin/group-services/delete", verifyToken, (req, res) => {
        var id = req.body.id;
        connection1.query('Delete from service_group_name Where `id`=' + id, (err, result) => {


            connection1.query('Delete from client_service Where `service_group_id`=' + id, (err, result) => {

            });

            res.send({ services: 'true' });



        });

    });

    app.post("/admin/group-services/add", verifyToken, (req, res) => {
        console.log(req.body);
        var name = req.body.name
        var services = req.body.service
        connection1.query('INSERT INTO service_group_name(`name`,`created_at`) VALUES ("' + name + '","' + dformat + '")', (err, result) => {

            var row_id = result.insertId;
            var dataa = '';
            services.forEach(function (item, index) {
                dataa += '("' + row_id + '","' + item.id + '","' + dformat + '"),';
            });
            dataa = dataa.slice(0, -1);
            connection1.query('INSERT INTO service_and_group_id(`service_group_id`,`service_id`,`created_at`) VALUES' + dataa + '', (err, result) => {


                res.send({ services: 'true' });
            });

        });
    });

    app.post("/admin/group-services/update", verifyToken, (req, res) => {
        var id = req.body.id;
        var name = req.body.name;
        var services = req.body.service

        console.log('all service -', services);

        var all_service_group_id = [];
        services.forEach(function (item, index) {
            all_service_group_id.push(parseInt(item.id));
        });

        //console.log('All service id -', all_service_group_id);

        console.log('group id -', id);

        // console.log('group name -', name);


        connection1.query('SELECT `client_service`.*, `services`.`service` as `ser_name`, `client`.`status` as `client_status`, `client`.`full_name` as `client_name`, `client`.`created_at` as `s_date`, `client`.`id` as `client_id`, `categorie`.`segment` as `cat_segment`, `categorie`.`name` as `cat_name` FROM `client_service` LEFT JOIN `services` ON `services`.`id` = `client_service`.`service_id` LEFT JOIN `client` ON `client`.`id` = `client_service`.`client_id` LEFT JOIN `categorie` ON `categorie`.`id` = `services`.`categorie_id` WHERE `client_service`.`service_group_id` =' + id, (err, dd) => {


            connection1.query('SELECT *  FROM `service_and_group_id` WHERE `service_group_id` = ' + id, (err, dd_service_group) => {

                //console.log(dd);



                connection1.query('UPDATE `service_group_name` SET `name`="' + name + '",`updated_at`="' + dformat + '" WHERE `id`=' + id, (err, result) => {

                    var row_id = id;
                    var dataa = '';
                    services.forEach(function (item, index) {
                        dataa += '("' + row_id + '","' + item.id + '","' + dformat + '"),';
                    });
                    dataa = dataa.slice(0, -1);

                    connection1.query('DELETE FROM `service_and_group_id` WHERE `service_group_id`=' + id, (err, result) => {


                        connection1.query('INSERT INTO service_and_group_id(`service_group_id`,`service_id`,`created_at`) VALUES' + dataa + ' ', (err, result) => {

                            res.send({ services: 'true' });
                        });
                    });


                });






                var c_id = ''
                var client_ids = [];
                dd.forEach(function (item, index) {
                    c_id = item.client_id;
                    //  client_ids.push(item.client_id);
                    if (!client_ids.includes(c_id)) {
                        client_ids.push(item.client_id);
                    }
                });

                // console.log('client -d ', client_ids);

                var ser_id = ''
                var db_exist_ids = [];
                dd_service_group.forEach(function (item, index) {

                    ser_id = item.service_id;

                    if (!db_exist_ids.includes(ser_id)) {
                        db_exist_ids.push(item.service_id);
                    }

                });


            console.log('All service id -', all_service_group_id);    

          console.log('db_exist_ids ', db_exist_ids);




                var add_service = [];
                all_service_group_id.forEach(function (item, index) {
                    if (!db_exist_ids.includes(item)) {
                        add_service.push(item);
                    }


                });
                // console.log('all_service_group_id', all_service_group_id);
                // console.log('db exist service', db_exist_ids);

                const get_strategy = (c_id) => {

                    connection1.query('SELECT `strategy` FROM `client_service` WHERE `client_id` = ' + c_id + ' LIMIT 1', (result_strategy_err, result_strategy) => {
                        return result_strategy[0].strategy;
                    });

                }


      
                console.log('add service - ', add_service);
                var strategy_add = '';
                if (add_service.length > 0) {
                    console.log('inside');
                    var dataa = [];
                    
                    var strategy_i_want = '';
                    client_ids.forEach(function (client_item_id, index) {
                        add_service.forEach(function (item, index) {

                            connection1.query('SELECT `client_id`,`service_id` FROM `client_service` WHERE `client_id` = "'+client_item_id+'" AND `service_id` = "'+item+'"', (err, insert_service_and_client_id) => {
                             console.log("insert_service_and_client_id" ,insert_service_and_client_id.length );
                            // dataa += '("' + item + '",' + client_item_id + ',"' + id + '","' + dformat + '"),';
                            if(insert_service_and_client_id.length == 0){

                            connection1.query('SELECT `strategy` FROM `client_service` WHERE `client_id` = ' + client_item_id + ' LIMIT 1', (err, result_strategy) => {
                                var client_strategy;
                                if (result_strategy.length == 0) {
                                    client_strategy = "NULL";
                                } else {
                                    client_strategy = result_strategy[0].strategy;
                                }
                                connection1.query('INSERT INTO `client_service`  (`service_id`,`client_id`,`service_group_id`,`created_at`,`strategy`) VALUES ("' + item + '",' + client_item_id + ',"' + id + '","' + dformat + '","' + client_strategy + '")', (err, result) => {
                                    console.log(err);
                                    //  console.log(result);

                                });

                            });
                         
                           }



                        });

                        });
                    });
                    

                }



                var delete_service = [];
                db_exist_ids.forEach(function (item, index) {
                    if (!all_service_group_id.includes(item)) {
                        delete_service.push(item);
                    }

                });
                //console.log('delete service - ', delete_service);


                if (delete_service.length > 0) {
                    client_ids.forEach(function (client_item_id, index) {
                        delete_service.forEach(function (item, index) {
                            connection1.query('Delete from `client_service` Where `service_id`="' + item + '" AND `client_id`=' + client_item_id, (err, result) => {

                            });
                        });
                    });
                }



            });
        });

    });

    app.get("/admin/group-services/servicecount", verifyToken, (req, res) => {

        connection1.query('SELECT `service_group_name`.`name` as `catg_name` , `service_and_group_id`.`service_id` as `service_id`  FROM `service_group_name` JOIN `service_and_group_id` ON `service_group_name`.`id` = `service_and_group_id`.`service_group_id`', (err, result) => {
            console.log("err", err)
            //  console.log("result",result)
            res.send({ servicesCount: result });
        });
    });

    // Get all client on group
    app.post("/admin/group-service/client", verifyToken, (req, res) => {
        var GroupId = req.body.groupId

        connection1.query('SELECT DISTINCT `client`.id,`client`.`username`,`client`.`licence_type`  FROM `client` LEFT JOIN `client_service` ON `client`.id =`client_service`.client_id WHERE `client_service`.service_group_id =' + GroupId, (err, result1) => {
             
         
            console.log("err", err)

            res.send({ groupSeviceClientName: result1 })
        })
    })


}