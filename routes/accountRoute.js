// Needed Resources
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");

// Login view route
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Register view route ✅
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// enable registration
router.post('/register', utilities.handleErrors(accountController.registerAccount))

module.exports = router;
