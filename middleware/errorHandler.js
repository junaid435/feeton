const errorHandler = (err, req, res, next) => {
    const errStatus = err.statusCode || 500;
  
    console.log(err);
    res.status(errStatus).render("error500");
  };
  
  module.exports = errorHandler;