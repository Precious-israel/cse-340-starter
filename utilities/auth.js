const jwt = require('jsonwebtoken');

// Middleware to check if user is logged in on every request
const checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    console.log("JWT cookie found:", req.cookies.jwt);
    try {
      const decoded = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
      console.log("JWT decoded:", decoded);
      res.locals.loggedin = true;
      res.locals.accountData = decoded;
      res.locals.account_firstname = decoded.account_firstname;
    } catch (error) {
      console.log("JWT verification failed:", error.message);
      res.locals.loggedin = false;
    }
  } else {
    console.log("No JWT cookie found");
    res.locals.loggedin = false;
  }
  next();
};


module.exports = { checkJWTToken };