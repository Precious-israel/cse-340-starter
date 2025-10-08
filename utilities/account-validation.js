const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");

/* ****************************************
 *  Registration Data Validation Rules
 * *************************************** */
function registrationRules() {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const existing = await accountModel.checkExistingEmail(account_email);
        if (existing) {
          throw new Error("Email already in use. Use a different email.");
        }
      }),
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must be at least 12 characters and include uppercase, lowercase, number, and symbol."
      ),
  ];
}

/* ****************************************
 * Check registration data
 * *************************************** */
async function checkRegData(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await require("./index").getNav();
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: errors.array(),
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    });
  }
  next();
}

/* ****************************************
 *  Login Data Validation Rules
 * *************************************** */
function loginRules() {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
}

/* ****************************************
 * Check login data
 * *************************************** */
async function checkLoginData(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await require("./index").getNav();
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email: req.body.account_email,
    });
  }
  next();
}

/* ****************************************
 *  Update Account Validation Rules
 * *************************************** */
function updateRules() {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const existing = await accountModel.checkExistingEmail(account_email);
        if (existing && existing.account_id !== parseInt(req.body.account_id)) {
          throw new Error("Email already in use. Use a different email.");
        }
      }),
  ];
}

async function checkUpdateData(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.errors = errors.array();
  }
  next();
}

/* ****************************************
 *  Password Change Validation Rules
 * *************************************** */
function passwordRules() {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must be at least 12 characters and include uppercase, lowercase, number, and symbol."
      ),
  ];
}

async function checkPasswordData(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.errors = errors.array();
  }
  next();
}

module.exports = {
  registrationRules,
  checkRegData,
  loginRules,
  checkLoginData,
  updateRules,
  checkUpdateData,
  passwordRules,
  checkPasswordData,
};