// accountRoute.js
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/account-validation");

// Login view route
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Logout route
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

// Register view route
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// ✅ Updated default account management view ("/account/")
router.get(
  "/",
  utilities.checkLogin, // <-- inserted here as instructed
  utilities.handleErrors(accountController.accountManagement)
);

module.exports = router;
