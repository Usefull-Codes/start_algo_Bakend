module.exports = function(app,connection1){

    app.get("/smartalgo/client/client-profile",(req,res) => {
        var clientId='92';

          connection1.query('SELECT * FROM `client` WHERE `id` = "'+clientId+'"', (err, result) => {
          
        console.log(err)
        res.send({result:result})
           
          });
      });
}