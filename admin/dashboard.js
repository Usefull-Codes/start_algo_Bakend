module.exports = function(app,connection1){
  var verifyToken = require('./middleware/awtJwt');

    app.get("/admin/dashboard",verifyToken,(req,res) => {
        var d = new Date;
        const dformat = [d.getFullYear(),
                   d.getMonth()+1,
                   d.getDate()
                   ].join('-');
                   
        connection1.query('SELECT COUNT(*) as count_rows1 FROM client where licence_type = 2;SELECT COUNT(*) as count_rows2 FROM client where licence_type = 2 AND end_date >= "'+dformat+'";SELECT COUNT(*) as count_rows3 FROM client where licence_type = 2 AND end_date < "'+dformat+'";SELECT COUNT(*) as count_rows4 FROM client where licence_type = 1;SELECT COUNT(*) as count_rows5 FROM client where licence_type = 1 AND end_date >= "'+dformat+'";SELECT COUNT(*) as count_rows6 FROM client where licence_type = 1 AND end_date < "'+dformat+'";SELECT `licence` FROM `tbl_users`;SELECT SUM(`to_month`) as used_license FROM `client` WHERE `licence_type`=2 AND status_term="1";SELECT COUNT(*) as total_todayservice FROM client where licence_type = 2 AND twoday_service=1;SELECT COUNT(*) as active_todayservice FROM client where licence_type = 2 AND twoday_service=1 AND to_month = 0 AND end_date >= "'+dformat+'";SELECT COUNT(*) as expire_todayservice FROM client where licence_type = 2 AND to_month > 0  AND twoday_service=1 ;',[1,2,3,4,5,6,7,8,9,10,11],(err, result) => {

        
        var msg={'total_live_account':result[0][0].count_rows1,'active_live_account':result[1][0].count_rows2,'expired_live_account':result[2][0].count_rows3,'total_demo_account':result[3][0].count_rows4,'active_demo_account':result[4][0].count_rows5,'expired_demo_account':result[5][0].count_rows6,'total_license':result[6][0].licence,'used_license':result[7][0].used_license,'total_todayservice':result[8][0].total_todayservice,'active_todayservice':result[9][0].active_todayservice,'expire_todayservice':result[10][0].expire_todayservice};
        res.send({ success: 'true', msg:msg});
        // console.log("msg",msg);
         
        });
    });
    
    app.get("/dashboard/signals",verifyToken,(req,res) => {
        var d = new Date;
        const dformat = [d.getFullYear(),
                   d.getMonth()+1,
                   d.getDate()
                   ].join('-');
        connection1.query("SELECT *  FROM `signals` where `dt_date`='"+dformat+"' order by `trade_symbol` ASC", (err, result) => {
           res.send({ signals: result });
        });
      });


     

    }

    
  