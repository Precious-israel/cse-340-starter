const accountController = {};
const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* *****************************
 * Show Login Page
 ***************************** */
accountController.buildLogin = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
};

/* *****************************
 * Show Registration Page
 ***************************** */
accountController.buildRegister = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
};

/* *****************************
 * Process Registration - FIXED
 ***************************** */
accountController.registerAccount = async function (req, res) {
  const nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Log incoming data for debugging
  console.log("Registration attempt:", { account_firstname, account_lastname, account_email });

  try {
    // Check for validation errors from middleware
    if (req.errors && !req.errors.isEmpty()) {
      console.log("Validation errors in controller:", req.errors.array());
      
      return res.status(400).render("account/register", {
        title: "Register",
        nav,
        errors: req.errors, // Pass the validationResult object directly
        account_firstname,
        account_lastname,
        account_email,
      });
    }

    // Check for existing email (additional safety check)
    const emailExists = await accountModel.checkExistingEmail(account_email);
    console.log("Email exists check:", emailExists);
    
    if (emailExists) {
      return res.status(400).render("account/register", {
        title: "Register",
        nav,
        errors: [{ msg: "That email already exists. Please log in or use a different email." }],
        account_firstname,
        account_lastname,
        account_email,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(account_password, 10);
    console.log("Password hashed successfully");

    // Register account
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    console.log("Registration result:", regResult);

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      });
    } else {
      throw new Error("Registration failed - no result from model.");
    }
  } catch (error) {
    console.error("Registration Error:", error.message);
    console.error("Full error:", error);
    
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: [{ msg: `Sorry, something went wrong with your registration: ${error.message}` }],
      account_firstname,
      account_lastname,
      account_email,
    });
  }
};

/* *****************************
 * Process Login - FIXED
 ***************************** */
accountController.accountLogin = async function (req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  // Log login attempt for debugging
  console.log("Login attempt for:", account_email);

  try {
    // Check for validation errors from middleware
    if (req.errors && !req.errors.isEmpty()) {
      console.log("Validation errors in login controller:", req.errors.array());
      
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: req.errors, // Pass the validationResult object directly
        account_email,
      });
    }

    const accountData = await accountModel.getAccountByEmail(account_email);
    console.log("Account data found:", accountData ? "Yes" : "No");
    
    if (!accountData) {
      console.log("No account found for email:", account_email);
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Invalid email or password." }],
        account_email,
      });
    }

    // Compare password
    const match = await bcrypt.compare(account_password, accountData.account_password);
    console.log("Password match:", match);
    
    if (!match) {
      console.log("Password mismatch for:", account_email);
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Invalid email or password." }],
        account_email,
      });
    }

    // Remove password from data and create JWT
    delete accountData.account_password;
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    // Set secure cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600 * 1000,
    };
    res.cookie("jwt", accessToken, cookieOptions);

    req.flash("notice", `Welcome back, ${accountData.account_firstname}!`);
    return res.redirect("/account/");
  } catch (error) {
    console.error("Login Error:", error.message);
    console.error("Full login error:", error);
    
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: [{ msg: `Login failed: ${error.message}` }],
      account_email,
    });
  }
};


/* *****************************
 * Process Logout
 ***************************** */
accountController.accountLogout = async function (req, res) {
  // Clear the JWT cookie
  res.clearCookie('jwt');
  req.flash("notice", "You have been logged out successfully.");
  res.redirect("/");
};



/* *****************************
 * Show Account Management Page
 ***************************** */
accountController.accountManagement = async function (req, res) {
  const nav = await utilities.getNav();
  
  res.render("account/index", {
    title: "Account Management",
    nav,
    errors: [],
    // loggedin and accountData are now automatically available via middleware
  });
};
module.exports = accountController;