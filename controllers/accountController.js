const accountController = {};
const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Show Login Page
 * *************************************** */
accountController.buildLogin = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
};

/* ****************************************
 *  Show Registration Page
 * *************************************** */
accountController.buildRegister = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
};

/* ****************************************
 *  Process Registration
 * *************************************** */
accountController.registerAccount = async function (req, res) {
  const nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    if (req.errors && req.errors.length) {
      return res.status(400).render("account/register", {
        title: "Register",
        nav,
        errors: req.errors,
        account_firstname,
        account_lastname,
        account_email,
      });
    }

    const emailExists = await accountModel.checkExistingEmail(account_email);
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

    const hashedPassword = await bcrypt.hash(account_password, 10);
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.status(201).redirect("/account/login");
    } else {
      throw new Error("Registration failed.");
    }
  } catch (error) {
    console.error("registerAccount error:", error);
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: [{ msg: `Registration failed: ${error.message}` }],
      account_firstname,
      account_lastname,
      account_email,
    });
  }
};

/* ****************************************
 *  Process Login
 * *************************************** */
accountController.accountLogin = async function (req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  try {
    if (req.errors && req.errors.length) {
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: req.errors,
        account_email,
      });
    }

    const accountData = await accountModel.getAccountByEmail(account_email);
    if (!accountData) {
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Invalid email or password." }],
        account_email,
      });
    }

    const match = await bcrypt.compare(account_password, accountData.account_password);
    if (!match) {
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Invalid email or password." }],
        account_email,
      });
    }

    delete accountData.account_password;
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600 * 1000,
    };

    res.cookie("jwt", accessToken, cookieOptions);
    req.flash("notice", `Welcome back, ${accountData.account_firstname}!`);
    return res.redirect("/account/");
  } catch (error) {
    console.error("accountLogin error:", error);
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: [{ msg: `Login failed: ${error.message}` }],
      account_email,
    });
  }
};

/* ****************************************
 *  Process Logout
 * *************************************** */
accountController.accountLogout = async function (req, res) {
  try {
    res.clearCookie("jwt");
    req.flash("notice", "You have been logged out successfully.");
    return res.redirect("/");
  } catch (err) {
    console.error("accountLogout error:", err);
    return res.redirect("/");
  }
};

/* ****************************************
 *  Show Account Management Page
 * *************************************** */
accountController.accountManagement = async function (req, res) {
  try {
    const nav = await utilities.getNav();
    const accountData = res.locals.accountData || {};
    
    res.render("account/index", {
      title: "Account Management",
      nav,
      errors: [],
      account_firstname: accountData.account_firstname,
      account_type: accountData.account_type,
      account_id: accountData.account_id,
      loggedin: !!accountData.account_id,
    });
  } catch (err) {
    console.error("accountManagement error:", err);
    throw err;
  }
};

/* ****************************************
 *  Show Update Account Page (GET)
 * *************************************** */
accountController.buildUpdateAccount = async function (req, res) {
  try {
    const account_id = parseInt(req.params.account_id, 10);
    if (Number.isNaN(account_id)) {
      req.flash("notice", "Invalid account id.");
      return res.redirect("/account/");
    }

    const accountData = await accountModel.getAccountById(account_id);
    if (!accountData) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account/");
    }

    const nav = await utilities.getNav();
    return res.render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      account: accountData,
    });
  } catch (err) {
    console.error("buildUpdateAccount error:", err);
    throw err;
  }
};

/* ****************************************
 *  Process Account Update (POST)
 * *************************************** */
accountController.updateAccount = async function (req, res) {
  try {
    const account_id = parseInt(req.params.account_id, 10);
    const { account_firstname, account_lastname, account_email } = req.body;

    if (Number.isNaN(account_id)) {
      req.flash("error", "Invalid account id.");
      return res.redirect("/account/");
    }

    // Check if validation errors exist
    if (req.errors && req.errors.length) {
      const nav = await utilities.getNav();
      return res.status(400).render("account/update", {
        title: "Update Account Information",
        nav,
        errors: req.errors,
        account: { account_id, account_firstname, account_lastname, account_email }
      });
    }

    const updated = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (!updated) {
      req.flash("error", "Account update failed.");
      return res.redirect(`/account/update/${account_id}`);
    }

    // Get fresh account data and update JWT
    const fresh = await accountModel.getAccountById(account_id);
    const newToken = jwt.sign(fresh, process.env.ACCESS_TOKEN_SECRET, { 
      expiresIn: "1h" 
    });

    res.cookie("jwt", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600 * 1000,
    });

    req.flash("success", "Account information updated successfully.");
    return res.redirect("/account/");
  } catch (err) {
    console.error("updateAccount error:", err);
    req.flash("error", "An unexpected error occurred while updating account.");
    return res.redirect("back");
  }
};

/* ****************************************
 *  Process Password Change (POST)
 * *************************************** */
accountController.updatePassword = async function (req, res) {
  try {
    const account_id = parseInt(req.params.account_id, 10);
    const { account_password } = req.body;

    if (Number.isNaN(account_id)) {
      req.flash("error", "Invalid account id.");
      return res.redirect("/account/");
    }

    // Check if validation errors exist
    if (req.errors && req.errors.length) {
      const nav = await utilities.getNav();
      const accountData = await accountModel.getAccountById(account_id);
      return res.status(400).render("account/update", {
        title: "Update Account Information",
        nav,
        errors: req.errors,
        account: accountData
      });
    }

    const hashed = await bcrypt.hash(account_password, 10);
    const updated = await accountModel.updatePassword(account_id, hashed);

    if (!updated) {
      req.flash("error", "Password update failed.");
      return res.redirect(`/account/update/${account_id}`);
    }

    req.flash("success", "Password changed successfully.");
    return res.redirect("/account/");
  } catch (err) {
    console.error("updatePassword error:", err);
    req.flash("error", "An unexpected error occurred while updating password.");
    return res.redirect("back");
  }
};

module.exports = accountController;