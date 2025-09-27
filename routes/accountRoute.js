// Needed Resources
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/account-validation");

// Login view route
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Register view route
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(), // ✅ Fixed typo here
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),  // ✅ Assumes you export loginRules as a function
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.loginAccount)
);

module.exports = router;
