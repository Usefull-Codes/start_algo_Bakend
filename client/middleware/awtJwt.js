const jwt = require("jsonwebtoken");

const verifyToken = (req,res,next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
      return res.status(403).send({
        msg: "No token provided!"
      });
    }
    jwt.verify(token, 'shhhhh', (err, decoded) => {
      if (err) {
        return res.status(401).send({
            msg: "Unauthorized!"
        });
      }
      
      req.body.client_id = decoded.id;
      next();
    });
  };

  module.exports = verifyToken