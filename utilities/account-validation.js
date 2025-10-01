const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")

/*  **********************************
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
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email")
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
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check registration data and return errors or continue
 * ***************************** */
async function checkRegData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log("Validation errors in checkRegData:", errors.array())
    req.errors = errors // Attach errors to request object
  }
  next() // Always call next() to continue to controller
}

/*  **********************************
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
 * Check login data and return errors or continue
 * ***************************** */
async function checkLoginData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log("Validation errors in checkLoginData:", errors.array())
    req.errors = errors // Attach errors to request object
  }
  next() // Always call next() to continue to controller
}

module.exports = {
  registrationRules,
  checkRegData,
  loginRules,
  checkLoginData
}