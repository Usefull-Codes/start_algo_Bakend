module.exports = function(app,connection1){
   var verifyToken = require('./middleware/awtJwt');

app.post("/smartalgo/services",verifyToken,(req,res) => {
    var id=req.body.id;
 
    connection1.query("SELECT * from services Where `categorie_id`='"+id+"' GROUP BY service" , (err, result) => {
       res.send({ services: result });
    });
});

 
   app.post("/services",verifyToken,(req,res) => {
   var category_id=req.body.cat_id;
   var where='';
   console.log(req.body);
   if(category_id!='')
   {
      
      where="where categorie_id='"+category_id+"' AND categorie.id=services.categorie_id";
   }else
   {
      where="where categorie.id=services.categorie_id";
   }

    connection1.query('SELECT *  FROM `categorie`,`services` '+where+'  group by  `categorie_id`,`service`', (err, result) => {
       res.send({ services: result });
    });
}); 
}
