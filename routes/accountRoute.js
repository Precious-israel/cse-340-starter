const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/account-validation");

// Login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

// Register view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process Registration
router.post(
"/register",
regValidate.registrationRules(),
regValidate.checkRegData,
utilities.handleErrors(accountController.registerAccount)
);

// Process Login
router.post(
"/login",
regValidate.loginRules(),
regValidate.checkLoginData,
utilities.handleErrors(accountController.accountLogin)
);

// Account Management View ("/account/")
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.accountManagement));

// Show Update Account Form (GET)
router.get(
"/update/:account_id",
utilities.checkLogin,
utilities.handleErrors(accountController.buildUpdateAccount)
);

// Process Account Update (POST)
router.post(
"/update/:account_id",
utilities.checkLogin,
regValidate.updateRules(),
regValidate.checkUpdateData,
utilities.handleErrors(accountController.updateAccount)
);

// Process Password Change (POST)
router.post(
"/update-password/:account_id",
utilities.checkLogin,
regValidate.passwordRules(),
regValidate.checkPasswordData,
utilities.handleErrors(accountController.updatePassword)
);

module.exports = router;