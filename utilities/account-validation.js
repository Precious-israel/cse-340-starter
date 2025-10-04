const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")

/* **********************************
 *  Registration Data Validation Rules
 * ********************************* */
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
        // Only check if email changed
        const existing = await accountModel.checkExistingEmail(account_email)
        if (existing && account_email !== req.body.current_email) {
          throw new Error("Email already in use. Use a different email.")
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
  ]
}

/* ******************************
 * Check registration data
 * ***************************** */
async function checkRegData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("notice", errors.array().map((err) => err.msg).join("<br>"))
    return res.redirect("/account/register")
  }
  next()
}

/* **********************************
 *  Login Data Validation Rules
 * ********************************* */
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
  ]
}

/* ******************************
 * Check login data
 * ***************************** */
async function checkLoginData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("notice", errors.array().map((err) => err.msg).join("<br>"))
    return res.redirect("/account/login")
  }
  next()
}

/* **********************************
 *  Update Account Validation Rules
 * ********************************* */
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
        const existing = await accountModel.checkExistingEmail(account_email)
        if (existing && account_email !== req.body.current_email) {
          throw new Error("Email already exists.")
        }
      }),
  ]
}

async function checkUpdateData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("notice", errors.array().map((err) => err.msg).join("<br>"))
    return res.redirect(`/account/update/${req.body.account_id}`)
  }
  next()
}

/* **********************************
 *  Password Change Validation Rules
 * ********************************* */
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
  ]
}

async function checkPasswordData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("notice", errors.array().map((err) => err.msg).join("<br>"))
    return res.redirect(`/account/update/${req.body.account_id}`)
  }
  next()
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
}
