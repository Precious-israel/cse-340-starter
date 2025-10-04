const jwt = require("jsonwebtoken")

/**
 * Middleware: allow only Employee or Admin
 */
module.exports = (req, res, next) => {
  const token = req.cookies.jwt
  if (!token) {
    req.flash("notice", "Please log in to access this page.")
    return res.redirect("/account/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    // Make account data available to views
    res.locals.accountData = decoded

    if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
      return next()
    } else {
      req.flash("notice", "Access denied. Employees or Admins only.")
      return res.redirect("/account/login")
    }
  } catch (err) {
    console.error("JWT verification failed:", err.message)
    req.flash("notice", "Session expired. Please log in again.")
    return res.redirect("/account/login")
  }
}
